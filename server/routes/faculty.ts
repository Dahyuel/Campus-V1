import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAuth } from '../middleware/requireAuth.js';
import { query } from '../db/client.js';
import { redis } from '../redis.js';
import { MATERIALS_BUCKET } from '../plugins/minio.js';
import { indexMaterial } from '../lib/rag.js';
import { escapeHtml } from '../lib/sanitize.js';
import { normalizePreferences } from '../lib/preferences.js';

const QR_TTL_SECONDS = 600;
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// Office hours are kept for the working week only (Sunday–Thursday locally).
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ALLOWED_MATERIAL_TYPES = [
  'PDF Lecture Slides',
  'Assignment PDF',
  'Lab Archive Code',
  'Video Lecture',
  'Other',
];
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.zip', '.mp4'];
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};
const CONTENT_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.zip': 'application/zip',
  '.mp4': 'video/mp4',
};

function qrKey(token: string): string {
  return `qr:${token}`;
}

function formatDateLabel(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// Schedule slots are stored as display text ("10:00 AM"); returns minutes since midnight.
function slotMinutes(slot: string): number | null {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(slot.trim());
  if (!m) return null;
  const hours = (Number(m[1]) % 12) + (m[3].toUpperCase() === 'PM' ? 12 : 0);
  return hours * 60 + Number(m[2]);
}

// No slot duration is stored; assume a standard lecture block for live status.
const LECTURE_MINUTES = 90;

function timeAgo(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(1, mins)} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  if (hours < 48) return 'Yesterday';
  return `${Math.floor(hours / 24)} days ago`;
}

interface RawAssessmentRow extends Record<string, unknown> {
  course_id: string;
  grade: string | null;
  weight_pct: string;
  out_of: number | null;
  grade_status: string | null;
}

function computeCourseAverage(assessments: RawAssessmentRow[]): number | null {
  let weightedPoints = 0;
  let releasedWeight = 0;
  for (const a of assessments) {
    if (a.grade_status === 'RELEASED' && a.grade !== null && a.out_of) {
      const weight = parseFloat(a.weight_pct.replace('%', '')) | 0;
      weightedPoints += Math.round((Number(a.grade) / a.out_of) * 100) * weight;
      releasedWeight += weight;
    }
  }
  if (releasedWeight === 0) return null;
  return Math.round(weightedPoints / releasedWeight);
}

async function requireFaculty(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(request, reply);
  if (reply.sent) return;
  if (request.user?.roleType !== 'faculty') {
    return reply.status(403).send({ error: 'Forbidden' });
  }
}

async function facultyCourseIds(facultyId: string): Promise<string[]> {
  const rows = await query<{ course_id: string }>(
    `SELECT course_id FROM faculty_course_assignments WHERE faculty_id = $1`,
    [facultyId]
  );
  return rows.map((r) => r.course_id);
}

async function assertCourseOwned(facultyId: string, courseId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `SELECT id FROM faculty_course_assignments WHERE faculty_id = $1 AND course_id = $2 LIMIT 1`,
    [facultyId, courseId]
  );
  return rows.length > 0;
}

export default async function facultyRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireFaculty);

  fastify.get('/dashboard', async (request, reply) => {
    const facultyId = request.user!.id;
    const courseIds = await facultyCourseIds(facultyId);
    const emptyIds = ['00000000-0000-0000-0000-000000000000'];

    const today = DAYS[new Date().getDay()];
    const scheduleRows = await query<{
      id: string;
      course_id: string;
      course_name: string;
      code: string;
      room: string | null;
      time_slot: string;
      day_of_week: string;
      students_count: string;
    }>(
      `SELECT s.id, c.id AS course_id, c.name AS course_name, c.code, s.room, s.time_slot, s.day_of_week,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS students_count
       FROM schedule_slots s
       JOIN courses c ON c.id = s.course_id
       WHERE c.id = ANY($1::uuid[])
       ORDER BY s.time_slot`,
      [courseIds.length ? courseIds : emptyIds]
    );

    // Show today's classes; if there are none, show the next day that has any,
    // so the card still carries real times and rooms.
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    let scheduleDay = today;
    let isToday = true;
    let daySlots = scheduleRows.filter((r) => r.day_of_week === today);
    if (daySlots.length === 0) {
      for (let offset = 1; offset <= 7; offset += 1) {
        const candidate = DAYS[(now.getDay() + offset) % 7];
        const found = scheduleRows.filter((r) => r.day_of_week === candidate);
        if (found.length > 0) {
          scheduleDay = candidate;
          daySlots = found;
          isToday = false;
          break;
        }
      }
    }

    const schedule = daySlots
      .slice()
      .sort((a, b) => (slotMinutes(a.time_slot) ?? 0) - (slotMinutes(b.time_slot) ?? 0))
      .map((r) => {
        const start = slotMinutes(r.time_slot);
        let status: 'Completed' | 'In Progress' | 'Upcoming' = 'Upcoming';
        if (isToday && start !== null) {
          if (nowMinutes >= start + LECTURE_MINUTES) status = 'Completed';
          else if (nowMinutes >= start) status = 'In Progress';
        }
        return {
          id: r.id,
          courseId: r.course_id,
          courseName: r.course_name,
          code: r.code,
          room: r.room ?? '',
          time: r.time_slot,
          studentsCount: Number(r.students_count),
          status,
        };
      });

    const courseIdParam = [courseIds.length ? courseIds : emptyIds];

    const missingGradeRows = await query<{
      assessment_id: string;
      title: string;
      course_name: string;
      code: string;
      missing: string;
    }>(
      // One row per course: the assessment with the most grades still missing,
      // so the action list covers every course instead of filling up with one.
      `SELECT DISTINCT ON (t.course_id) t.assessment_id, t.title, t.course_name, t.code, t.missing
       FROM (
         SELECT a.course_id, a.id AS assessment_id, a.title, c.name AS course_name, c.code,
                a.display_order,
                COUNT(*) FILTER (WHERE g.id IS NULL) AS missing
         FROM assessments a
         JOIN courses c ON c.id = a.course_id
         JOIN enrollments e ON e.course_id = a.course_id AND e.status IS DISTINCT FROM 'DROPPED'
         LEFT JOIN grades g ON g.assessment_id = a.id AND g.student_id = e.student_id
         WHERE a.course_id = ANY($1::uuid[])
         GROUP BY a.course_id, a.id, a.title, c.name, c.code, a.display_order
         HAVING COUNT(*) FILTER (WHERE g.id IS NULL) > 0
       ) t
       ORDER BY t.course_id, t.missing DESC, t.display_order`,
      courseIdParam
    );

    const taPendingRows = await query<{ id: string; ta_name: string | null; title: string; course_name: string; section_label: string }>(
      `SELECT tgs.id, u.name AS ta_name, a.title, c.name AS course_name, tgs.section_label
       FROM ta_grade_submissions tgs
       JOIN assessments a ON a.id = tgs.assessment_id
       JOIN courses c ON c.id = tgs.course_id
       LEFT JOIN users u ON u.id = tgs.ta_id
       WHERE tgs.course_id = ANY($1::uuid[]) AND tgs.status = 'PENDING'
       ORDER BY tgs.submitted_at`,
      courseIdParam
    );

    const aiPendingRows = await query<{ code: string; pending: string }>(
      `SELECT c.code, COUNT(*) AS pending
       FROM community_posts cp
       JOIN courses c ON c.id = cp.course_id
       WHERE cp.course_id = ANY($1::uuid[])
         AND cp.ai_status = 'awaiting_approval' AND cp.is_flagged = false
       GROUP BY c.code
       ORDER BY COUNT(*) DESC`,
      courseIdParam
    );

    const pendingActions = [
      ...missingGradeRows
        .slice()
        .sort((a, b) => Number(b.missing) - Number(a.missing) || a.code.localeCompare(b.code))
        .slice(0, 4)
        .map((r) => ({
        id: `grades-${r.assessment_id}`,
        priority: 'high',
        color: 'bg-rose-500',
        text: `Enter ${r.title} grades for ${r.course_name} — ${r.missing} student${Number(r.missing) === 1 ? '' : 's'} pending`,
        actionText: 'Do Now',
        targetTab: 'grade-entry',
      })),
      ...taPendingRows.map((r) => ({
        id: `ta-${r.id}`,
        priority: 'medium',
        color: 'bg-amber-500',
        text: `Review ${r.ta_name ?? 'TA'}'s submitted ${r.title} grades for ${r.course_name} ${r.section_label}`,
        actionText: 'Review',
        targetTab: 'grade-entry',
      })),
      ...aiPendingRows.map((r) => ({
        id: `ai-${r.code}`,
        priority: 'low',
        color: 'bg-blue-500',
        text: `Review ${r.pending} pending AI answer${Number(r.pending) === 1 ? '' : 's'} in ${r.code} community`,
        actionText: 'Review',
        targetTab: 'course-community',
      })),
    ];

    const statRows = await query<{
      total_students: string;
      active_courses: string;
      pending_grades: string;
      avg_attendance: string | null;
    }>(
      `SELECT
         (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e
           WHERE e.course_id = ANY($1::uuid[]) AND e.status IS DISTINCT FROM 'DROPPED') AS total_students,
         (SELECT COUNT(*) FROM faculty_course_assignments WHERE faculty_id = $2) AS active_courses,
         (SELECT COUNT(*) FROM assessments a
            JOIN enrollments e ON e.course_id = a.course_id AND e.status IS DISTINCT FROM 'DROPPED'
            LEFT JOIN grades g ON g.assessment_id = a.id AND g.student_id = e.student_id
           WHERE a.course_id = ANY($1::uuid[]) AND g.id IS NULL) AS pending_grades,
         (SELECT AVG(e.attendance_pct) FROM enrollments e
           WHERE e.course_id = ANY($1::uuid[]) AND e.status IS DISTINCT FROM 'DROPPED') AS avg_attendance`,
      [courseIds.length ? courseIds : emptyIds, facultyId]
    );
    const stats = {
      activeCourses: Number(statRows[0]?.active_courses ?? 0),
      totalStudents: Number(statRows[0]?.total_students ?? 0),
      pendingGrades: Number(statRows[0]?.pending_grades ?? 0),
      avgAttendance:
        statRows[0]?.avg_attendance === null || statRows[0]?.avg_attendance === undefined
          ? null
          : Math.round(Number(statRows[0].avg_attendance)),
    };

    const atRiskRows = await query<{
      id: string;
      name: string;
      course_name: string;
      risk_level: string;
      signal: string;
    }>(
      `SELECT arf.id, u.name, c.name AS course_name, arf.risk_level, arf.signal
       FROM at_risk_flags arf
       JOIN users u ON u.id = arf.student_id
       JOIN courses c ON c.id = arf.course_id
       WHERE arf.resolved = false AND arf.course_id = ANY($1::uuid[])
       ORDER BY CASE arf.risk_level WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 ELSE 3 END`,
      [courseIds.length ? courseIds : emptyIds]
    );

    const communityRows = await query<{
      course_id: string;
      course_name: string;
      code: string;
      new_posts: string;
      latest_question: string | null;
    }>(
      `SELECT c.id AS course_id, c.name AS course_name, c.code,
              COUNT(cp.id) FILTER (WHERE cp.created_at > NOW() - INTERVAL '7 days') AS new_posts,
              (SELECT title FROM community_posts WHERE course_id = c.id AND post_type = 'QUESTION' ORDER BY created_at DESC LIMIT 1) AS latest_question
       FROM faculty_course_assignments fca
       JOIN courses c ON c.id = fca.course_id
       LEFT JOIN community_posts cp ON cp.course_id = c.id
       WHERE fca.faculty_id = $1
       GROUP BY c.id, c.name, c.code
       ORDER BY c.code`,
      [facultyId]
    );

    return reply.status(200).send({
      schedule,
      scheduleDay,
      scheduleIsToday: isToday,
      stats,
      pendingActions,
      atRiskStudents: atRiskRows.map((r) => ({
        id: r.id,
        name: r.name,
        course: r.course_name,
        riskLevel: r.risk_level,
        signal: r.signal,
      })),
      communities: communityRows.map((r) => ({
        id: r.course_id,
        course: `${r.course_name} (${r.code})`,
        newPosts: Number(r.new_posts),
        latestQuestion: r.latest_question ?? '',
      })),
    });
  });

  fastify.get('/courses', async (request, reply) => {
    const facultyId = request.user!.id;
    const rows = await query<{
      id: string;
      name: string;
      code: string;
      section: string;
      room: string | null;
      credits: number;
      students_count: string;
      attendance_rate: string | null;
      grades_entered: string;
      grades_total: string;
    }>(
      `SELECT c.id, c.name, c.code, fca.section, fca.room, c.credits,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS students_count,
              (SELECT AVG(e.attendance_pct) FROM enrollments e WHERE e.course_id = c.id) AS attendance_rate,
              (SELECT COUNT(DISTINCT a.id) FROM assessments a JOIN grades g ON g.assessment_id = a.id AND g.status = 'RELEASED' WHERE a.course_id = c.id) AS grades_entered,
              (SELECT COUNT(*) FROM assessments a WHERE a.course_id = c.id) AS grades_total
       FROM faculty_course_assignments fca
       JOIN courses c ON c.id = fca.course_id
       WHERE fca.faculty_id = $1
       ORDER BY c.code`,
      [facultyId]
    );

    return reply.status(200).send(
      rows.map((r) => {
        const attendanceRate = r.attendance_rate === null ? 0 : Math.round(Number(r.attendance_rate));
        let status: 'ON TRACK' | 'ATTENTION NEEDED' | 'OVERDUE' = 'ON TRACK';
        if (attendanceRate < 65) status = 'OVERDUE';
        else if (attendanceRate < 80) status = 'ATTENTION NEEDED';
        return {
          id: r.id,
          name: r.name,
          code: r.code,
          section: r.section,
          room: r.room ?? '',
          studentsCount: Number(r.students_count),
          creditHours: r.credits,
          attendanceRate,
          gradesEntered: Number(r.grades_entered),
          gradesTotal: Number(r.grades_total),
          status,
        };
      })
    );
  });

  fastify.get('/profile', async (request, reply) => {
    const facultyId = request.user!.id;
    const rows = await query<{
      name: string; email: string; phone: string | null; academic_rank: string | null;
      code_id: string; avatar_url: string | null; preferences: unknown;
    }>(
      `SELECT name, email, phone, academic_rank, code_id, avatar_url, preferences FROM users WHERE id = $1 LIMIT 1`,
      [facultyId]
    );
    if (!rows[0]) return reply.status(404).send({ error: 'Profile not found' });

    const hours = await query<{
      day_of_week: string; start_time: string | null; end_time: string | null;
      location: string | null; is_closed: boolean;
    }>(
      `SELECT day_of_week, start_time, end_time, location, is_closed
       FROM office_hours WHERE user_id = $1`,
      [facultyId]
    );
    const byDay = new Map(hours.map((h) => [h.day_of_week, h]));

    // Department isn't stored on the user; take the one most of their courses belong to.
    const academic = await query<{
      department: string | null; course_count: string; credit_hours: string | null; student_count: string;
    }>(
      `SELECT
         (SELECT d.name FROM faculty_course_assignments fca
            JOIN courses c ON c.id = fca.course_id
            JOIN departments d ON d.id = c.department_id
           WHERE fca.faculty_id = $1
           GROUP BY d.name ORDER BY COUNT(*) DESC, d.name LIMIT 1) AS department,
         (SELECT COUNT(DISTINCT fca.course_id) FROM faculty_course_assignments fca
           WHERE fca.faculty_id = $1) AS course_count,
         (SELECT SUM(c.credits) FROM courses c
           WHERE c.id IN (SELECT course_id FROM faculty_course_assignments WHERE faculty_id = $1)) AS credit_hours,
         (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e
           WHERE e.course_id IN (SELECT course_id FROM faculty_course_assignments WHERE faculty_id = $1)) AS student_count`,
      [facultyId]
    );

    return reply.status(200).send({
      name: rows[0].name,
      email: rows[0].email,
      phone: rows[0].phone ?? '',
      rank: rows[0].academic_rank ?? '',
      codeId: rows[0].code_id,
      avatarUrl: rows[0].avatar_url,
      department: academic[0]?.department ?? null,
      courseCount: Number(academic[0]?.course_count ?? 0),
      creditHours: Number(academic[0]?.credit_hours ?? 0),
      studentCount: Number(academic[0]?.student_count ?? 0),
      preferences: normalizePreferences(rows[0].preferences),
      officeHours: WEEKDAYS.map((day) => {
        const row = byDay.get(day);
        return {
          day,
          start: row?.start_time ?? '',
          end: row?.end_time ?? '',
          location: row?.location ?? '',
          isClosed: row?.is_closed ?? true,
        };
      }),
    });
  });

  fastify.patch('/profile', async (request, reply) => {
    const facultyId = request.user!.id;
    const body = (request.body ?? {}) as {
      name?: string;
      email?: string;
      phone?: string;
      rank?: string;
      officeHours?: Array<{ day: string; start?: string; end?: string; location?: string; isClosed?: boolean }>;
    };

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    if (!name) return reply.status(400).send({ error: 'Name is required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return reply.status(400).send({ error: 'Enter a valid email address' });
    }

    const taken = await query<{ id: string }>(
      `SELECT id FROM users WHERE lower(email) = lower($1) AND id <> $2 LIMIT 1`,
      [email, facultyId]
    );
    if (taken[0]) return reply.status(409).send({ error: 'That email is already in use' });

    await query(
      `UPDATE users SET name = $1, email = $2, phone = $3, academic_rank = $4, updated_at = NOW()
       WHERE id = $5`,
      [
        name.slice(0, 255),
        email.slice(0, 255),
        (body.phone ?? '').trim().slice(0, 50) || null,
        (body.rank ?? '').trim().slice(0, 100) || null,
        facultyId,
      ]
    );

    if (Array.isArray(body.officeHours)) {
      for (const slot of body.officeHours) {
        if (!WEEKDAYS.includes(slot.day)) continue;
        await query(
          `INSERT INTO office_hours (user_id, day_of_week, start_time, end_time, location, is_closed)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (user_id, day_of_week)
           DO UPDATE SET start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time,
                         location = EXCLUDED.location, is_closed = EXCLUDED.is_closed`,
          [
            facultyId,
            slot.day,
            (slot.start ?? '').trim().slice(0, 20) || null,
            (slot.end ?? '').trim().slice(0, 20) || null,
            (slot.location ?? '').trim().slice(0, 255) || null,
            slot.isClosed === true,
          ]
        );
      }
    }

    return reply.status(200).send({ message: 'Profile saved' });
  });

  fastify.patch('/preferences', async (request, reply) => {
    const facultyId = request.user!.id;
    const prefs = normalizePreferences(request.body);
    if (prefs.defaultCourseId && !(await assertCourseOwned(facultyId, prefs.defaultCourseId))) {
      return reply.status(400).send({ error: 'That course is not assigned to you' });
    }
    await query(`UPDATE users SET preferences = $1::jsonb, updated_at = NOW() WHERE id = $2`, [
      JSON.stringify(prefs),
      facultyId,
    ]);
    return reply.status(200).send(prefs);
  });

  fastify.post('/profile/avatar', async (request, reply) => {
    const userId = request.user!.id;
    const file = await request.file();
    if (!file) return reply.status(400).send({ error: 'Choose an image to upload' });

    const ext = path.extname(file.filename).toLowerCase();
    const contentType = AVATAR_CONTENT_TYPES[ext];
    if (!contentType) {
      return reply.status(400).send({ error: 'Use a JPG, PNG or WebP image' });
    }
    const buffer = await file.toBuffer();
    if (buffer.length > AVATAR_MAX_BYTES) {
      return reply.status(400).send({ error: 'Image must be 2 MB or smaller' });
    }

    const key = `avatars/${userId}/${Date.now()}${ext}`;
    try {
      await fastify.minio.send(
        new PutObjectCommand({ Bucket: MATERIALS_BUCKET, Key: key, Body: buffer, ContentType: contentType })
      );
    } catch (err) {
      fastify.log.error({ err }, 'avatar upload to storage failed');
      return reply.status(503).send({ error: 'File storage is unavailable. Please try again later.' });
    }

    const previous = await query<{ avatar_key: string | null }>(
      `SELECT avatar_key FROM users WHERE id = $1`,
      [userId]
    );
    // Browser-facing path through the frontend's /api proxy; the version
    // query busts cached copies of the previous photo.
    const avatarUrl = `/api/avatars/${userId}?v=${Date.now()}`;
    await query(`UPDATE users SET avatar_key = $1, avatar_url = $2, updated_at = NOW() WHERE id = $3`, [
      key,
      avatarUrl,
      userId,
    ]);

    const oldKey = previous[0]?.avatar_key;
    if (oldKey && oldKey !== key) {
      fastify.minio
        .send(new DeleteObjectCommand({ Bucket: MATERIALS_BUCKET, Key: oldKey }))
        .catch((err) => fastify.log.warn({ err }, 'could not delete previous avatar'));
    }

    return reply.status(200).send({ avatarUrl });
  });

  fastify.get('/assessments', async (request, reply) => {
    const facultyId = request.user!.id;
    const { courseId } = request.query as { courseId?: string };
    if (!courseId || !(await assertCourseOwned(facultyId, courseId))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const rows = await query<{
      id: string; title: string; type: string; weight_pct: string; out_of: number | null; due_date: string | null;
      released: boolean;
    }>(
      `SELECT a.id, a.title, a.type, a.weight_pct, a.out_of, to_char(a.due_date, 'YYYY-MM-DD') AS due_date,
              EXISTS (SELECT 1 FROM grades g WHERE g.assessment_id = a.id AND g.status = 'RELEASED') AS released
       FROM assessments a
       WHERE a.course_id = $1
       ORDER BY a.display_order, a.title`,
      [courseId]
    );
    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        weight: r.weight_pct,
        outOf: r.out_of ?? 100,
        dueDate: r.due_date,
        released: r.released,
      }))
    );
  });

  fastify.patch('/assessments/:assessmentId/due-date', async (request, reply) => {
    const facultyId = request.user!.id;
    const { assessmentId } = request.params as { assessmentId: string };
    const { dueDate } = (request.body ?? {}) as { dueDate?: string | null };
    if (dueDate !== null && !(typeof dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dueDate) && !Number.isNaN(Date.parse(dueDate)))) {
      return reply.status(400).send({ error: 'Enter a valid date' });
    }
    const updated = await query<{ id: string }>(
      `UPDATE assessments a SET due_date = $1
       FROM faculty_course_assignments fca
       WHERE a.id = $2 AND fca.course_id = a.course_id AND fca.faculty_id = $3
       RETURNING a.id`,
      [dueDate, assessmentId, facultyId]
    );
    if (!updated[0]) return reply.status(404).send({ error: 'Assessment not found' });
    return reply.status(200).send({ id: assessmentId, dueDate });
  });

  fastify.get('/materials', async (request, reply) => {
    const facultyId = request.user!.id;
    const rows = await query<{
      id: string;
      file_name: string;
      course_name: string;
      material_type: string;
      uploaded_at: string;
      file_size: string | null;
    }>(
      `SELECT cm.id, cm.file_name, c.name AS course_name, cm.material_type, cm.uploaded_at, cm.file_size
       FROM course_materials cm
       JOIN courses c ON c.id = cm.course_id
       WHERE cm.course_id = ANY(SELECT course_id FROM faculty_course_assignments WHERE faculty_id = $1)
       ORDER BY cm.uploaded_at DESC`,
      [facultyId]
    );

    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        fileName: r.file_name,
        course: r.course_name,
        type: r.material_type,
        uploadDate: formatDateLabel(r.uploaded_at),
        size: r.file_size ?? '',
      }))
    );
  });

  fastify.post('/materials/upload', async (request, reply) => {
    const facultyId = request.user!.id;
    const parts = request.parts();
    let courseCode = '';
    let materialType = 'PDF Lecture Slides';
    let originalName = 'material.bin';
    let buffer: Buffer | null = null;

    for await (const part of parts) {
      if (part.type === 'file') {
        originalName = part.filename;
        buffer = await part.toBuffer();
      } else if (part.fieldname === 'courseCode') {
        courseCode = String(part.value);
      } else if (part.fieldname === 'materialType') {
        materialType = String(part.value);
      }
    }

    if (!buffer) {
      return reply.status(400).send({ error: 'File is required' });
    }

    const ext = path.extname(originalName).toLowerCase();
    if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
      return reply.status(400).send({ error: 'Unsupported file type' });
    }
    if (!ALLOWED_MATERIAL_TYPES.includes(materialType)) {
      return reply.status(400).send({ error: 'Unsupported material type' });
    }

    const safeName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');

    const courseRows = await query<{ id: string; name: string }>(
      `SELECT c.id, c.name FROM courses c
       JOIN faculty_course_assignments fca ON fca.course_id = c.id
       WHERE fca.faculty_id = $1 AND c.code = $2 LIMIT 1`,
      [facultyId, courseCode]
    );
    const course = courseRows[0];
    if (!course) {
      return reply.status(403).send({ error: 'Course not assigned to faculty' });
    }

    const key = `courses/${courseCode.toLowerCase()}/materials/${Date.now()}_${safeName}`;
    try {
      await fastify.minio.send(
        new PutObjectCommand({
          Bucket: MATERIALS_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: CONTENT_TYPES[ext] ?? 'application/octet-stream',
        })
      );
    } catch (err) {
      fastify.log.error({ err }, 'material upload to storage failed');
      return reply.status(503).send({ error: 'File storage is unavailable. Please try again later.' });
    }

    const sizeLabel =
      buffer.length < 100 * 1024
        ? `${Math.max(1, Math.round(buffer.length / 1024))} KB`
        : `${(buffer.length / (1024 * 1024)).toFixed(1)} MB`;
    const inserted = await query<{ id: string; uploaded_at: string }>(
      `INSERT INTO course_materials (course_id, faculty_id, file_name, file_key, file_size, material_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, uploaded_at`,
      [course.id, facultyId, safeName, key, sizeLabel, materialType]
    );

    // Fire-and-forget RAG indexing
    indexMaterial({
      id: inserted[0].id,
      courseCode,
      fileName: safeName,
      fileKey: key,
    }).catch((err) => fastify.log.warn('RAG indexing failed:', err));

    return reply.status(200).send({
      id: inserted[0].id,
      fileName: escapeHtml(safeName),
      course: escapeHtml(course.name),
      type: escapeHtml(materialType),
      uploadDate: formatDateLabel(inserted[0].uploaded_at),
      size: sizeLabel,
    });
  });

  fastify.get('/materials/:materialId/url', async (request, reply) => {
    const facultyId = request.user!.id;
    const { materialId } = request.params as { materialId: string };
    const rows = await query<{ file_key: string; file_name: string }>(
      `SELECT cm.file_key, cm.file_name FROM course_materials cm
       JOIN faculty_course_assignments fca ON fca.course_id = cm.course_id
       WHERE cm.id = $1 AND fca.faculty_id = $2 LIMIT 1`,
      [materialId, facultyId]
    );
    if (!rows[0]) {
      return reply.status(404).send({ error: 'Material not found' });
    }
    const url = await getSignedUrl(
      fastify.minio,
      new GetObjectCommand({
        Bucket: MATERIALS_BUCKET,
        Key: rows[0].file_key,
        ResponseContentDisposition: `inline; filename="${rows[0].file_name}"`,
      }),
      { expiresIn: 300 }
    );
    return reply.status(200).send({ url });
  });

  fastify.delete('/materials/:materialId', async (request, reply) => {
    const facultyId = request.user!.id;
    const { materialId } = request.params as { materialId: string };

    const rows = await query<{ file_key: string }>(
      `SELECT cm.file_key FROM course_materials cm
       JOIN faculty_course_assignments fca ON fca.course_id = cm.course_id
       WHERE cm.id = $1 AND fca.faculty_id = $2 LIMIT 1`,
      [materialId, facultyId]
    );
    if (!rows[0]) {
      return reply.status(403).send({ error: 'Material not found or not owned' });
    }

    try {
      await fastify.minio.send(new DeleteObjectCommand({ Bucket: MATERIALS_BUCKET, Key: rows[0].file_key }));
    } catch {
    }
    await query(`DELETE FROM course_materials WHERE id = $1`, [materialId]);
    return reply.status(200).send({ message: 'Deleted' });
  });

  fastify.get('/students', async (request, reply) => {
    const facultyId = request.user!.id;
    const students = await query<{
      id: string;
      name: string;
      code_id: string;
      course_name: string;
      attendance_pct: number;
      course_id: string;
      enrollment_id: string;
    }>(
      `SELECT u.id, u.name, u.code_id, c.name AS course_name, e.attendance_pct, c.id AS course_id,
              e.id AS enrollment_id
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       JOIN courses c ON c.id = e.course_id
       WHERE e.course_id = ANY(SELECT course_id FROM faculty_course_assignments WHERE faculty_id = $1)
       ORDER BY u.name`,
      [facultyId]
    );

    const flags = await query<{ student_id: string; course_id: string; risk_level: string }>(
      `SELECT student_id, course_id, risk_level FROM at_risk_flags WHERE resolved = false`
    );
    const flagMap = new Map<string, string>();
    for (const f of flags) flagMap.set(`${f.student_id}:${f.course_id}`, f.risk_level);

    const courseIds = [...new Set(students.map((s) => s.course_id))];
    const emptyIds = ['00000000-0000-0000-0000-000000000000'];
    const assessments = await query<RawAssessmentRow & { student_id: string }>(
      `SELECT a.course_id, a.weight_pct, a.out_of, g.grade, g.status AS grade_status, g.student_id
       FROM assessments a
       JOIN grades g ON g.assessment_id = a.id
       WHERE a.course_id = ANY($1::uuid[])`,
      [courseIds.length ? courseIds : emptyIds]
    );

    const studentIds = [...new Set(students.map((s) => s.id))];
    const gpaRows = await query<{ student_id: string; gpa: string }>(
      `SELECT student_id, AVG(gpa_points::numeric) AS gpa
       FROM transcript_entries
       WHERE student_id = ANY($1::uuid[]) AND gpa_points ~ '^[0-9.]+$'
       GROUP BY student_id`,
      [studentIds.length ? studentIds : emptyIds]
    );
    const gpaMap = new Map(gpaRows.map((r) => [r.student_id, Math.round(Number(r.gpa) * 100) / 100]));

    return reply.status(200).send(
      students.map((s) => {
        const currentGrade = computeCourseAverage(
          assessments.filter((a) => a.course_id === s.course_id && a.student_id === s.id)
        );
        const risk = flagMap.get(`${s.id}:${s.course_id}`);
        let status: 'GOOD STANDING' | 'AT RISK' | 'WARNING';
        if (risk === 'Critical' || risk === 'High') status = 'AT RISK';
        else if (risk === 'Moderate') status = 'WARNING';
        else if (s.attendance_pct < 75) status = 'WARNING';
        else status = 'GOOD STANDING';
        const gpa = gpaMap.get(s.id) ?? null;
        return {
          // One row per enrollment: the same student appears once per course,
          // so rows need their own id, distinct from the student's.
          rowId: s.enrollment_id,
          id: s.id,
          courseId: s.course_id,
          name: s.name,
          studentId: s.code_id,
          course: s.course_name,
          attendance: s.attendance_pct,
          currentGrade,
          gpa,
          status,
        };
      })
    );
  });

  fastify.get('/attendance/sessions', async (request, reply) => {
    const facultyId = request.user!.id;
    const { courseId } = request.query as { courseId?: string };
    if (!courseId || !(await assertCourseOwned(facultyId, courseId))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const rows = await query<{
      id: string;
      lecture_label: string;
      session_date: string;
      present_count: number;
      absent_count: number;
    }>(
      `SELECT id, lecture_label, session_date::text AS session_date, present_count, absent_count
       FROM attendance_sessions WHERE course_id = $1 ORDER BY session_date DESC, created_at DESC`,
      [courseId]
    );
    return reply.status(200).send(
      rows.map((r) => {
        const total = r.present_count + r.absent_count;
        return {
          id: r.id,
          lectureNo: r.lecture_label,
          date: formatDateLabel(r.session_date),
          present: r.present_count,
          absent: r.absent_count,
          rate: total > 0 ? Math.round((r.present_count / total) * 100) : 0,
        };
      })
    );
  });

  fastify.get('/attendance/summary', async (request, reply) => {
    const facultyId = request.user!.id;
    const { courseId } = request.query as { courseId?: string };
    if (!courseId || !(await assertCourseOwned(facultyId, courseId))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const rows = await query<{
      id: string;
      name: string;
      present: string;
      absent: string;
    }>(
      `SELECT u.id, u.name,
              COUNT(ar.id) FILTER (WHERE ar.status = 'PRESENT') AS present,
              COUNT(ar.id) FILTER (WHERE ar.status = 'ABSENT') AS absent
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       LEFT JOIN attendance_records ar ON ar.student_id = u.id
         AND ar.session_id IN (SELECT id FROM attendance_sessions WHERE course_id = $1)
       WHERE e.course_id = $1
       GROUP BY u.id, u.name
       ORDER BY u.name`,
      [courseId]
    );
    return reply.status(200).send(
      rows.map((r) => {
        const present = Number(r.present);
        const absent = Number(r.absent);
        const total = present + absent;
        const rate = total > 0 ? Math.round((present / total) * 100) : null;
        const status =
          rate === null ? 'NO RECORDS' : rate >= 75 ? 'GOOD' : rate >= 60 ? 'WARNING' : 'AT RISK';
        return { id: r.id, name: r.name, present, absent, rate, status };
      })
    );
  });

  fastify.post('/attendance/session', async (request, reply) => {
    const facultyId = request.user!.id;
const { courseId, lectureLabel, latitude, longitude, radiusMeters } = request.body as {
      courseId: string;
      lectureLabel: string;
      latitude?: number;
      longitude?: number;
      radiusMeters?: number;
    };
    if (!courseId || !(await assertCourseOwned(facultyId, courseId))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const qrToken = randomUUID();
    const expiresAt = new Date(Date.now() + QR_TTL_SECONDS * 1000);
    const inserted = await query<{ id: string }>(
      `INSERT INTO attendance_sessions (course_id, faculty_id, lecture_label, session_date, qr_token, qr_expires_at, is_open, latitude, longitude, radius_meters)
       VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, true, $6, $7, $8) RETURNING id`,
      [courseId, facultyId, lectureLabel, qrToken, expiresAt.toISOString(), latitude ?? null, longitude ?? null, radiusMeters ?? 100]
    );
    const sessionId = inserted[0].id;
    await redis.setex(
      qrKey(qrToken),
      QR_TTL_SECONDS,
      JSON.stringify({ sessionId, courseId, facultyId })
    );
    return reply.status(200).send({
      sessionId,
      qrToken,
      expiresAt: expiresAt.toISOString(),
      lectureLabel,
    });
  });

  // Who has checked in so far, polled by the QR panel while a session is open.
  // Full roster for one session: every enrolled student with their recorded
  // status. Older sessions may only have totals and no per-student records.
  fastify.get('/attendance/session/:sessionId/roster', async (request, reply) => {
    const facultyId = request.user!.id;
    const { sessionId } = request.params as { sessionId: string };
    const sessionRows = await query<{
      course_id: string; lecture_label: string; session_date: string;
      present_count: number; absent_count: number; is_open: boolean;
    }>(
      `SELECT s.course_id, s.lecture_label, s.session_date::text AS session_date,
              s.present_count, s.absent_count, s.is_open
       FROM attendance_sessions s
       JOIN faculty_course_assignments fca ON fca.course_id = s.course_id AND fca.faculty_id = $2
       WHERE s.id = $1 LIMIT 1`,
      [sessionId, facultyId]
    );
    const session = sessionRows[0];
    if (!session) return reply.status(404).send({ error: 'Session not found' });

    const rows = await query<{
      id: string; name: string; code_id: string;
      status: string | null; method: string | null; marked_at: string | null;
    }>(
      `SELECT u.id, u.name, u.code_id, ar.status, ar.method, ar.marked_at
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       LEFT JOIN attendance_records ar ON ar.session_id = $1 AND ar.student_id = e.student_id
       WHERE e.course_id = $2 AND e.status IS DISTINCT FROM 'DROPPED'
       ORDER BY u.name`,
      [sessionId, session.course_id]
    );

    return reply.status(200).send({
      lectureLabel: session.lecture_label,
      date: formatDateLabel(session.session_date),
      isOpen: session.is_open,
      presentCount: session.present_count,
      absentCount: session.absent_count,
      hasRecords: rows.some((r) => r.status !== null),
      students: rows.map((r) => ({
        id: r.id,
        name: r.name,
        studentId: r.code_id,
        status: r.status ?? 'NOT RECORDED',
        method: r.status === 'PRESENT' ? r.method ?? 'QR' : null,
        markedAt: r.marked_at ? new Date(r.marked_at).toISOString() : null,
      })),
    });
  });

  fastify.get('/attendance/session/:sessionId/live', async (request, reply) => {
    const facultyId = request.user!.id;
    const { sessionId } = request.params as { sessionId: string };
    const sessionRows = await query<{ course_id: string; is_open: boolean; qr_expires_at: string | null }>(
      `SELECT s.course_id, s.is_open, s.qr_expires_at
       FROM attendance_sessions s
       JOIN faculty_course_assignments fca ON fca.course_id = s.course_id AND fca.faculty_id = $2
       WHERE s.id = $1 LIMIT 1`,
      [sessionId, facultyId]
    );
    const session = sessionRows[0];
    if (!session) return reply.status(404).send({ error: 'Session not found' });

    const rows = await query<{
      id: string;
      name: string;
      code_id: string;
      marked_at: string;
      method: string | null;
      status: string;
    }>(
      `SELECT u.id, u.name, u.code_id, ar.marked_at, ar.method, ar.status
       FROM attendance_records ar
       JOIN users u ON u.id = ar.student_id
       WHERE ar.session_id = $1 AND ar.status = 'PRESENT'
       ORDER BY ar.marked_at DESC`,
      [sessionId]
    );

    const totals = await query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM enrollments
       WHERE course_id = $1 AND status IS DISTINCT FROM 'DROPPED'`,
      [session.course_id]
    );

    return reply.status(200).send({
      isOpen: session.is_open,
      expiresAt: session.qr_expires_at,
      totalStudents: Number(totals[0]?.total ?? 0),
      presentCount: rows.length,
      present: rows.map((r) => ({
        id: r.id,
        name: r.name,
        studentId: r.code_id,
        method: r.method ?? 'QR',
        markedAt: new Date(r.marked_at).toISOString(),
      })),
    });
  });

  fastify.post('/attendance/session/:sessionId/extend', async (request, reply) => {
    const facultyId = request.user!.id;
    const { sessionId } = request.params as { sessionId: string };
    const rows = await query<{ qr_token: string | null; course_id: string; qr_expires_at: string | null }>(
      `SELECT qr_token, course_id, qr_expires_at FROM attendance_sessions WHERE id = $1 AND faculty_id = $2 LIMIT 1`,
      [sessionId, facultyId]
    );
    if (!rows[0] || !rows[0].qr_token) {
      return reply.status(404).send({ error: 'Session not found' });
    }
    // Add 5 minutes to whatever time is left (or to now, if already expired)
    const currentExpiry = rows[0].qr_expires_at ? new Date(rows[0].qr_expires_at).getTime() : 0;
    const newExpiry = new Date(Math.max(currentExpiry, Date.now()) + 300 * 1000);
    const ttlSeconds = Math.ceil((newExpiry.getTime() - Date.now()) / 1000);
    await redis.setex(
      qrKey(rows[0].qr_token),
      ttlSeconds,
      JSON.stringify({ sessionId, courseId: rows[0].course_id, facultyId })
    );
    await query(`UPDATE attendance_sessions SET qr_expires_at = $1 WHERE id = $2`, [newExpiry.toISOString(), sessionId]);
    return reply.status(200).send({ expiresAt: newExpiry.toISOString() });
  });

  fastify.post('/attendance/session/:sessionId/close', async (request, reply) => {
    const facultyId = request.user!.id;
    const { sessionId } = request.params as { sessionId: string };
    const rows = await query<{ qr_token: string | null }>(
      `SELECT qr_token FROM attendance_sessions WHERE id = $1 AND faculty_id = $2 LIMIT 1`,
      [sessionId, facultyId]
    );
    if (!rows[0]) return reply.status(404).send({ error: 'Session not found' });
    if (rows[0].qr_token) await redis.del(qrKey(rows[0].qr_token));
    // Enrolled students who never checked in are absent
    await query(
      `INSERT INTO attendance_records (session_id, student_id, status, method)
       SELECT $1, e.student_id, 'ABSENT', 'AUTO'
       FROM enrollments e
       JOIN attendance_sessions s ON s.id = $1 AND s.course_id = e.course_id
       WHERE e.status IS DISTINCT FROM 'DROPPED'
       ON CONFLICT (session_id, student_id) DO NOTHING`,
      [sessionId]
    );
    const counts = await query<{ present: string; absent: string }>(
      `SELECT COUNT(*) FILTER (WHERE status = 'PRESENT') AS present,
              COUNT(*) FILTER (WHERE status = 'ABSENT') AS absent
       FROM attendance_records WHERE session_id = $1`,
      [sessionId]
    );
    await query(
      `UPDATE attendance_sessions SET is_open = false, qr_token = NULL, present_count = $1, absent_count = $2 WHERE id = $3`,
      [Number(counts[0].present), Number(counts[0].absent), sessionId]
    );

    try {
      const sessionInfo = await query<{
        course_id: string;
        course_name: string;
        department_id: string | null;
        session_date: string;
      }>(
        `SELECT s.course_id, c.name AS course_name, c.department_id, s.session_date
         FROM attendance_sessions s JOIN courses c ON c.id = s.course_id WHERE s.id = $1 LIMIT 1`,
        [sessionId]
      );
      const absentRows = await query<{ student_id: string }>(
        `SELECT student_id FROM attendance_records WHERE session_id = $1 AND status != 'PRESENT'`,
        [sessionId]
      );
      if (sessionInfo[0]) {
        await fastify.amqp.publish('course.attendance.closed', {
          sessionId,
          courseId: sessionInfo[0].course_id,
          courseName: sessionInfo[0].course_name,
          departmentId: sessionInfo[0].department_id,
          date: sessionInfo[0].session_date,
          absentStudentIds: absentRows.map((r) => r.student_id),
        });
      }
    } catch (err) {
      fastify.log.error({ err }, 'failed to publish attendance.closed');
    }

    return reply.status(200).send({ message: 'Closed' });
  });

  fastify.post('/attendance/mark-manual', async (request, reply) => {
    const facultyId = request.user!.id;
    const { sessionId, studentId, status } = request.body as {
      sessionId: string;
      studentId: string;
      status: string;
    };
    if (!['PRESENT', 'ABSENT', 'EXCUSED'].includes(status)) {
      return reply.status(400).send({ error: 'Invalid status' });
    }
    const sessionRows = await query<{ course_id: string }>(
      `SELECT s.course_id FROM attendance_sessions s
       JOIN faculty_course_assignments fca ON fca.course_id = s.course_id AND fca.faculty_id = $2
       WHERE s.id = $1 LIMIT 1`,
      [sessionId, facultyId]
    );
    if (!sessionRows[0]) return reply.status(403).send({ error: 'Forbidden' });
    const enrolled = await query<{ id: string }>(
      `SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2 LIMIT 1`,
      [sessionRows[0].course_id, studentId]
    );
    if (!enrolled[0]) return reply.status(404).send({ error: 'Student not enrolled in this course' });
    await query(
      `INSERT INTO attendance_records (session_id, student_id, status, method)
       VALUES ($1, $2, $3, 'MANUAL')
       ON CONFLICT (session_id, student_id) DO UPDATE SET status = EXCLUDED.status, method = 'MANUAL'`,
      [sessionId, studentId, status]
    );
    const counts = await query<{ present: string; absent: string }>(
      `SELECT COUNT(*) FILTER (WHERE status = 'PRESENT') AS present,
              COUNT(*) FILTER (WHERE status = 'ABSENT') AS absent
       FROM attendance_records WHERE session_id = $1`,
      [sessionId]
    );
    await query(
      `UPDATE attendance_sessions SET present_count = $1, absent_count = $2 WHERE id = $3 AND is_open = false`,
      [Number(counts[0].present), Number(counts[0].absent), sessionId]
    );
    return reply.status(200).send({ message: 'Marked' });
  });

  fastify.get('/grades', async (request, reply) => {
    const facultyId = request.user!.id;
    const { courseId, assessmentTitle } = request.query as { courseId?: string; assessmentTitle?: string };
    if (!courseId || !(await assertCourseOwned(facultyId, courseId))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const assessmentRows = await query<{ id: string; out_of: number | null }>(
      `SELECT id, out_of FROM assessments WHERE course_id = $1 AND title = $2 LIMIT 1`,
      [courseId, assessmentTitle]
    );
    const assessment = assessmentRows[0];
    if (!assessment) return reply.status(200).send({ entries: [], taPendingSubmissions: [] });
    const outOf = assessment.out_of ?? 100;

    const rows = await query<{
      student_name: string;
      code_id: string;
      grade: string | null;
      status: string | null;
    }>(
      `SELECT u.name AS student_name, u.code_id, g.grade, g.status
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       LEFT JOIN grades g ON g.student_id = u.id AND g.assessment_id = $2
       WHERE e.course_id = $1
       ORDER BY u.name`,
      [courseId, assessment.id]
    );

    const taPendingRows = await query<{
      id: string; ta_name: string | null; ta_code: string | null; section_label: string;
      assessment_title: string; submitted_at: string; graded_count: string;
    }>(
      `SELECT tgs.id, u.name AS ta_name, u.code_id AS ta_code, tgs.section_label,
              a.title AS assessment_title, tgs.submitted_at,
              (SELECT COUNT(*) FROM grades g WHERE g.assessment_id = tgs.assessment_id AND g.status = 'SUBMITTED') AS graded_count
       FROM ta_grade_submissions tgs
       JOIN assessments a ON a.id = tgs.assessment_id
       LEFT JOIN users u ON u.id = tgs.ta_id
       WHERE tgs.course_id = $1 AND tgs.status = 'PENDING'`,
      [courseId]
    );

    return reply.status(200).send({
      entries: rows.map((r) => ({
        studentName: r.student_name,
        studentId: r.code_id,
        grade: r.grade === null ? null : Number(r.grade),
        outOf,
        percentage: r.grade === null ? null : Math.round((Number(r.grade) / outOf) * 100),
        status: r.grade === null ? 'MISSING' : r.status === 'RELEASED' ? 'RELEASED' : 'ENTERED',
      })),
      taPendingSubmissions: taPendingRows.map((r) => ({
        submissionId: r.id,
        taName: r.ta_name ?? '',
        taCode: r.ta_code ?? '',
        sectionLabel: r.section_label,
        assessmentTitle: r.assessment_title,
        submittedAt: formatDateLabel(r.submitted_at),
        gradedCount: Number(r.graded_count),
      })),
    });
  });

  fastify.post('/grades', async (request, reply) => {
    const facultyId = request.user!.id;
    const { courseId, assessmentTitle, entries } = request.body as {
      courseId: string;
      assessmentTitle: string;
      entries: Array<{ studentId: string; grade: number }>;
    };
    if (!courseId || !(await assertCourseOwned(facultyId, courseId))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const assessmentRows = await query<{ id: string }>(
      `SELECT id FROM assessments WHERE course_id = $1 AND title = $2 LIMIT 1`,
      [courseId, assessmentTitle]
    );
    if (!assessmentRows[0]) return reply.status(404).send({ error: 'Assessment not found' });
    const assessmentId = assessmentRows[0].id;

    let saved = 0;
    for (const entry of entries) {
      const studentRows = await query<{ id: string }>(`SELECT id FROM users WHERE code_id = $1 LIMIT 1`, [entry.studentId]);
      if (!studentRows[0]) continue;
      const studentId = studentRows[0].id;

      const enrolled = await query<{ id: string }>(
        `SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2 AND status != 'DROPPED' LIMIT 1`,
        [courseId, studentId]
      );
      if (!enrolled[0]) continue;

      await query(
        `INSERT INTO grades (assessment_id, student_id, grade, status)
         VALUES ($1, $2, $3, 'ENTERED')
         ON CONFLICT (assessment_id, student_id)
         DO UPDATE SET grade = EXCLUDED.grade, status = CASE WHEN grades.status = 'RELEASED' THEN 'RELEASED' ELSE 'ENTERED' END`,
        [assessmentId, studentId, entry.grade]
      );
      saved += 1;
    }
    return reply.status(200).send({ saved });
  });

  fastify.post('/grades/release', async (request, reply) => {
    const facultyId = request.user!.id;
    const { courseId, assessmentTitle } = request.body as { courseId: string; assessmentTitle: string };
    if (!courseId || !(await assertCourseOwned(facultyId, courseId))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const assessmentRows = await query<{ id: string }>(
      `SELECT id FROM assessments WHERE course_id = $1 AND title = $2 LIMIT 1`,
      [courseId, assessmentTitle]
    );
    if (!assessmentRows[0]) return reply.status(404).send({ error: 'Assessment not found' });

    const taSubmissions = await query<{ id: string; ta_id: string | null }>(
      `SELECT id, ta_id FROM ta_grade_submissions
       WHERE assessment_id = $1 AND course_id = $2 AND status = 'PENDING'`,
      [assessmentRows[0].id, courseId]
    );
    if (taSubmissions.length > 0) {
      await query(
        `UPDATE ta_grade_submissions SET status = 'APPROVED', reviewed_at = NOW(), reviewed_by = $1
         WHERE assessment_id = $2 AND course_id = $3 AND status = 'PENDING'`,
        [facultyId, assessmentRows[0].id, courseId]
      );
      for (const sub of taSubmissions) {
        if (!sub.ta_id) continue;
        await query(
          `INSERT INTO notifications (user_id, title, body, type)
           VALUES ($1, 'Grade Submission Approved', $2, 'grade')`,
          [sub.ta_id, `${request.user!.name} approved and released your submitted grades for ${assessmentTitle}.`]
        );
      }
    }

    const today = formatDateLabel(new Date());
    const updated = await query<{ id: string }>(
      `UPDATE grades SET status = 'RELEASED', released_date = $1 WHERE assessment_id = $2 RETURNING id`,
      [today, assessmentRows[0].id]
    );

    try {
      const courseRows = await query<{ name: string; department_id: string | null }>(
        `SELECT name, department_id FROM courses WHERE id = $1 LIMIT 1`,
        [courseId]
      );
      const studentRows = await query<{ student_id: string }>(
        `SELECT DISTINCT student_id FROM grades WHERE assessment_id = $1`,
        [assessmentRows[0].id]
      );
      await fastify.amqp.publish('course.grade.released', {
        courseId,
        courseName: courseRows[0]?.name ?? '',
        assessmentTitle,
        departmentId: courseRows[0]?.department_id ?? null,
        studentGrades: studentRows.map((s) => ({ studentId: s.student_id, assessmentTitle, courseName: courseRows[0]?.name ?? '' })),
      });
    } catch (err) {
      fastify.log.error({ err }, 'failed to publish grade.released');
    }

    return reply.status(200).send({ released: updated.length });
  });

  // Review a TA's submitted grades. The TA's page unlocks again on REJECTED,
  // so both outcomes put the grades back to ENTERED for the gradebook.
  async function reviewTaSubmission(
    facultyId: string,
    facultyName: string,
    submissionId: string,
    decision: 'APPROVED' | 'REJECTED',
    note: string | null
  ): Promise<{ ok: boolean; status?: number; error?: string }> {
    const rows = await query<{ ta_id: string | null; assessment_id: string; title: string; section_label: string; code: string }>(
      `SELECT tgs.ta_id, tgs.assessment_id, a.title, tgs.section_label, c.code
       FROM ta_grade_submissions tgs
       JOIN assessments a ON a.id = tgs.assessment_id
       JOIN courses c ON c.id = tgs.course_id
       JOIN faculty_course_assignments fca ON fca.course_id = tgs.course_id AND fca.faculty_id = $2
       WHERE tgs.id = $1 AND tgs.status = 'PENDING'
       LIMIT 1`,
      [submissionId, facultyId]
    );
    const submission = rows[0];
    if (!submission) return { ok: false, status: 404, error: 'Pending submission not found' };

    await query(
      `UPDATE ta_grade_submissions
       SET status = $1, reviewed_at = NOW(), reviewed_by = $2, professor_note = $3
       WHERE id = $4`,
      [decision, facultyId, note, submissionId]
    );
    await query(
      `UPDATE grades SET status = 'ENTERED' WHERE assessment_id = $1 AND status = 'SUBMITTED'`,
      [submission.assessment_id]
    );

    if (submission.ta_id) {
      const title = decision === 'APPROVED' ? 'Grade Submission Approved' : 'Grade Submission Returned';
      const body =
        decision === 'APPROVED'
          ? `${facultyName} approved your submitted grades for ${submission.title} — ${submission.section_label} in ${submission.code}.`
          : `${facultyName} returned your grades for ${submission.title} — ${submission.section_label} in ${submission.code}.${note ? ` Note: ${note}` : ''}`;
      await query(
        `INSERT INTO notifications (user_id, title, body, type) VALUES ($1, $2, $3, 'grade')`,
        [submission.ta_id, title, body]
      );
    }
    return { ok: true };
  }

  fastify.post('/grades/submissions/:submissionId/approve', async (request, reply) => {
    const { submissionId } = request.params as { submissionId: string };
    const result = await reviewTaSubmission(request.user!.id, request.user!.name, submissionId, 'APPROVED', null);
    if (!result.ok) return reply.status(result.status ?? 400).send({ error: result.error });
    return reply.status(200).send({ id: submissionId, status: 'APPROVED' });
  });

  fastify.post('/grades/submissions/:submissionId/reject', async (request, reply) => {
    const { submissionId } = request.params as { submissionId: string };
    const { note } = (request.body ?? {}) as { note?: string };
    const trimmed = typeof note === 'string' ? note.trim().slice(0, 1000) : '';
    const result = await reviewTaSubmission(
      request.user!.id,
      request.user!.name,
      submissionId,
      'REJECTED',
      trimmed || null
    );
    if (!result.ok) return reply.status(result.status ?? 400).send({ error: result.error });
    return reply.status(200).send({ id: submissionId, status: 'REJECTED' });
  });

  fastify.get('/messages', async (request, reply) => {
    const facultyId = request.user!.id;
    const rows = await query<{
      other_id: string;
      other_name: string;
      other_role: string;
      body: string;
      sent_at: string;
      read_at: string | null;
      sender_id: string;
      unread: string;
    }>(
      `SELECT DISTINCT ON (other_id) other_id, other_name, other_role, body, sent_at, read_at, sender_id,
              (SELECT COUNT(*) FROM messages um
                WHERE um.recipient_id = $1 AND um.sender_id = t.other_id AND um.read_at IS NULL) AS unread
       FROM (
         SELECT CASE WHEN sender_id = $1 THEN recipient_id ELSE sender_id END AS other_id,
                u.name AS other_name, u.role_type AS other_role,
                m.body, m.sent_at, m.read_at, m.sender_id
         FROM messages m
         JOIN users u ON u.id = CASE WHEN m.sender_id = $1 THEN m.recipient_id ELSE m.sender_id END
         WHERE m.sender_id = $1 OR m.recipient_id = $1
       ) t
       ORDER BY other_id, sent_at DESC`,
      [facultyId]
    );

    const ROLE_LABELS: Record<string, string> = {
      student: 'Student', faculty: 'Faculty', admin: 'Admin', 'dept-head': 'Dept. Head', dean: 'Dean',
    };

    return reply.status(200).send(
      rows.map((r) => {
        const roleLabel = ROLE_LABELS[r.other_role] ?? r.other_role;
        return {
          // Keyed by the other person so the id survives new conversations
          id: r.other_id,
          userId: r.other_id,
          name: r.other_name,
          role: roleLabel,
          roleCategory: roleLabel === 'Student' ? 'Students' : roleLabel === 'Admin' ? 'Admin' : 'Faculty',
          avatarUrl: null,
          avatar: '',
          lastMessage: r.body,
          time: formatDateLabel(r.sent_at),
          unreadCount: Number(r.unread),
          online: true,
        };
      })
    );
  });

  // Send the same message to several students at once (My Students cohort).
  fastify.post('/messages/broadcast', async (request, reply) => {
    const facultyId = request.user!.id;
    const { studentIds, body } = (request.body ?? {}) as { studentIds?: string[]; body?: string };
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return reply.status(400).send({ error: 'Select at least one student' });
    }
    if (typeof body !== 'string' || body.trim() === '') {
      return reply.status(400).send({ error: 'Message body is required' });
    }
    if (studentIds.length > 200) {
      return reply.status(400).send({ error: 'Too many recipients in one message' });
    }

    // Keep only students actually enrolled in this professor's courses
    const allowed = await query<{ student_id: string }>(
      `SELECT DISTINCT e.student_id
       FROM enrollments e
       WHERE e.student_id = ANY($1::uuid[])
         AND e.course_id IN (SELECT course_id FROM faculty_course_assignments WHERE faculty_id = $2)
         AND e.status IS DISTINCT FROM 'DROPPED'`,
      [studentIds, facultyId]
    );
    if (allowed.length === 0) {
      return reply.status(403).send({ error: 'None of those students are in your courses' });
    }

    const text = body.trim();
    for (const row of allowed) {
      await query(`INSERT INTO messages (sender_id, recipient_id, body) VALUES ($1, $2, $3)`, [
        facultyId,
        row.student_id,
        text,
      ]);
    }
    return reply.status(200).send({ sent: allowed.length, skipped: studentIds.length - allowed.length });
  });

  // People this professor may message: students in their courses and their TAs.
  fastify.get('/message-recipients', async (request, reply) => {
    const facultyId = request.user!.id;
    const rows = await query<{ id: string; name: string; code_id: string; role_type: string; courses: string }>(
      `SELECT u.id, u.name, u.code_id, u.role_type, string_agg(DISTINCT c.code, ', ' ORDER BY c.code) AS courses
       FROM (
         SELECT e.student_id AS user_id, e.course_id
         FROM enrollments e
         WHERE e.course_id IN (SELECT course_id FROM faculty_course_assignments WHERE faculty_id = $1)
           AND e.status IS DISTINCT FROM 'DROPPED'
         UNION
         SELECT tsa.ta_id AS user_id, tsa.course_id
         FROM ta_section_assignments tsa
         WHERE tsa.course_id IN (SELECT course_id FROM faculty_course_assignments WHERE faculty_id = $1)
       ) people
       JOIN users u ON u.id = people.user_id AND u.is_active IS DISTINCT FROM false
       JOIN courses c ON c.id = people.course_id
       WHERE u.id <> $1
       GROUP BY u.id, u.name, u.code_id, u.role_type
       ORDER BY u.name`,
      [facultyId]
    );
    const ROLE_LABELS: Record<string, string> = {
      student: 'Student',
      'teaching-assistant': 'Teaching Assistant',
    };
    return reply.status(200).send(
      rows.map((r) => ({
        userId: r.id,
        name: r.name,
        codeId: r.code_id,
        role: ROLE_LABELS[r.role_type] ?? r.role_type,
        courses: r.courses,
      }))
    );
  });

  fastify.get('/messages/:userId', async (request, reply) => {
    const facultyId = request.user!.id;
    const { userId } = request.params as { userId: string };
    const rows = await query<{
      id: string;
      sender_id: string;
      body: string;
      sent_at: string;
    }>(
      `SELECT id, sender_id, body, sent_at FROM messages
       WHERE (sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1)
       ORDER BY sent_at ASC`,
      [facultyId, userId]
    );
    await query(
      `UPDATE messages SET read_at = NOW() WHERE recipient_id = $1 AND sender_id = $2 AND read_at IS NULL`,
      [facultyId, userId]
    );
    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        sender: r.sender_id === facultyId ? 'me' : 'them',
        text: r.body,
        time: formatDateLabel(r.sent_at),
      }))
    );
  });

  fastify.post('/messages/:userId', async (request, reply) => {
    const facultyId = request.user!.id;
    const { userId } = request.params as { userId: string };
    const { body } = request.body as { body: string };
    if (typeof body !== 'string' || body.trim() === '') {
      return reply.status(400).send({ error: 'Message body is required' });
    }

    // Allowed: someone in one of their courses, or anyone already in a thread
    // with them (so replies to admin or department staff still work).
    const allowed = await query<{ ok: boolean }>(
      `SELECT true AS ok WHERE EXISTS (
         SELECT 1 FROM enrollments e
          WHERE e.student_id = $2
            AND e.course_id IN (SELECT course_id FROM faculty_course_assignments WHERE faculty_id = $1)
            AND e.status IS DISTINCT FROM 'DROPPED'
       ) OR EXISTS (
         SELECT 1 FROM ta_section_assignments tsa
          WHERE tsa.ta_id = $2
            AND tsa.course_id IN (SELECT course_id FROM faculty_course_assignments WHERE faculty_id = $1)
       ) OR EXISTS (
         SELECT 1 FROM messages m
          WHERE (m.sender_id = $1 AND m.recipient_id = $2)
             OR (m.sender_id = $2 AND m.recipient_id = $1)
       )`,
      [facultyId, userId]
    );
    if (!allowed[0]) {
      return reply.status(403).send({ error: 'You cannot message this person' });
    }

    const inserted = await query<{ id: string; sent_at: string }>(
      `INSERT INTO messages (sender_id, recipient_id, body) VALUES ($1, $2, $3) RETURNING id, sent_at`,
      [facultyId, userId, body]
    );
    return reply.status(200).send({
      id: inserted[0].id,
      sender: 'me',
      text: body,
      time: formatDateLabel(inserted[0].sent_at),
    });
  });

  fastify.get('/community', async (request, reply) => {
    const facultyId = request.user!.id;
    const { courseId } = request.query as { courseId?: string };
    if (!courseId || !(await assertCourseOwned(facultyId, courseId))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const rows = await query<{
      id: string;
      post_type: string;
      title: string;
      author_name: string | null;
      created_at: string;
      content: string;
      upvotes: number;
      is_pinned: boolean;
      ai_answer: string | null;
      ai_citation: string | null;
      ai_status: string | null;
    }>(
      `SELECT cp.id, cp.post_type, cp.title, u.name AS author_name, cp.created_at, cp.content,
              cp.upvotes, cp.is_pinned, cp.ai_answer, cp.ai_citation, cp.ai_status
       FROM community_posts cp
       LEFT JOIN users u ON u.id = cp.author_id
       WHERE cp.course_id = $1 AND cp.is_flagged = false
       ORDER BY cp.is_pinned DESC, cp.created_at DESC`,
      [courseId]
    );

    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        type: r.post_type,
        title: r.title,
        author: r.author_name ?? 'Anonymous',
        authorRole: 'Student',
        avatarUrl: null,
        avatar: '',
        timeAgo: timeAgo(r.created_at),
        content: r.content,
        upvotes: r.upvotes,
        isPinned: r.is_pinned,
        hasAiResponse: r.ai_answer !== null,
        aiResponse: r.ai_answer
          ? { answer: r.ai_answer, citation: r.ai_citation ?? '', status: r.ai_status ?? 'awaiting_approval' }
          : undefined,
      }))
    );
  });

  async function assertPostOwnedByFaculty(facultyId: string, postId: string): Promise<boolean> {
    const rows = await query<{ id: string }>(
      `SELECT cp.id FROM community_posts cp
       JOIN faculty_course_assignments fca ON fca.course_id = cp.course_id
       WHERE cp.id = $1 AND fca.faculty_id = $2
       LIMIT 1`,
      [postId, facultyId]
    );
    return rows.length > 0;
  }

  fastify.patch('/community/:postId/approve-ai', async (request, reply) => {
    const facultyId = request.user!.id;
    const { postId } = request.params as { postId: string };
    if (!(await assertPostOwnedByFaculty(facultyId, postId))) {
      return reply.status(403).send({ error: 'Post not found or not assigned to faculty' });
    }
    await query(`UPDATE community_posts SET ai_status = 'approved' WHERE id = $1`, [postId]);
    return reply.status(200).send({ id: postId, aiStatus: 'approved' });
  });

  fastify.get('/community/settings', async (request, reply) => {
    const facultyId = request.user!.id;
    const { courseId } = request.query as { courseId?: string };
    if (!courseId || !(await assertCourseOwned(facultyId, courseId))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const rows = await query<{ allow_anonymous: boolean; auto_ai_response: boolean; post_notifications: boolean }>(
      `SELECT allow_anonymous, auto_ai_response, post_notifications
       FROM community_settings WHERE course_id = $1 LIMIT 1`,
      [courseId]
    );
    return reply.status(200).send({
      allowAnonymous: rows[0]?.allow_anonymous ?? true,
      autoAiResponse: rows[0]?.auto_ai_response ?? true,
      postNotifications: rows[0]?.post_notifications ?? true,
    });
  });

  fastify.patch('/community/settings', async (request, reply) => {
    const facultyId = request.user!.id;
    const { courseId, allowAnonymous, autoAiResponse, postNotifications } = (request.body ?? {}) as {
      courseId?: string;
      allowAnonymous?: boolean;
      autoAiResponse?: boolean;
      postNotifications?: boolean;
    };
    if (!courseId || !(await assertCourseOwned(facultyId, courseId))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const rows = await query<{ allow_anonymous: boolean; auto_ai_response: boolean; post_notifications: boolean }>(
      `INSERT INTO community_settings (course_id, allow_anonymous, auto_ai_response, post_notifications, updated_at, updated_by)
       VALUES ($1, COALESCE($2, true), COALESCE($3, true), COALESCE($4, true), NOW(), $5)
       ON CONFLICT (course_id) DO UPDATE SET
         allow_anonymous = COALESCE($2, community_settings.allow_anonymous),
         auto_ai_response = COALESCE($3, community_settings.auto_ai_response),
         post_notifications = COALESCE($4, community_settings.post_notifications),
         updated_at = NOW(), updated_by = $5
       RETURNING allow_anonymous, auto_ai_response, post_notifications`,
      [
        courseId,
        typeof allowAnonymous === 'boolean' ? allowAnonymous : null,
        typeof autoAiResponse === 'boolean' ? autoAiResponse : null,
        typeof postNotifications === 'boolean' ? postNotifications : null,
        facultyId,
      ]
    );
    return reply.status(200).send({
      allowAnonymous: rows[0].allow_anonymous,
      autoAiResponse: rows[0].auto_ai_response,
      postNotifications: rows[0].post_notifications,
    });
  });

  fastify.get('/community/removed', async (request, reply) => {
    const facultyId = request.user!.id;
    const { courseId } = request.query as { courseId?: string };
    if (!courseId || !(await assertCourseOwned(facultyId, courseId))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const rows = await query<{ id: string; title: string; author_name: string | null; created_at: string }>(
      `SELECT cp.id, cp.title, u.name AS author_name, cp.created_at
       FROM community_posts cp
       LEFT JOIN users u ON u.id = cp.author_id
       WHERE cp.course_id = $1 AND cp.is_flagged = true
       ORDER BY cp.created_at DESC`,
      [courseId]
    );
    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        author: r.author_name ?? 'Anonymous',
        timeAgo: timeAgo(r.created_at),
      }))
    );
  });

  fastify.patch('/community/:postId/restore', async (request, reply) => {
    const facultyId = request.user!.id;
    const { postId } = request.params as { postId: string };
    if (!(await assertPostOwnedByFaculty(facultyId, postId))) {
      return reply.status(403).send({ error: 'Post not found or not assigned to faculty' });
    }
    await query(`UPDATE community_posts SET is_flagged = false WHERE id = $1`, [postId]);
    return reply.status(200).send({ id: postId, restored: true });
  });

  fastify.patch('/community/:postId/ai-correction', async (request, reply) => {
    const facultyId = request.user!.id;
    const { postId } = request.params as { postId: string };
    if (!(await assertPostOwnedByFaculty(facultyId, postId))) {
      return reply.status(403).send({ error: 'Post not found or not assigned to faculty' });
    }
    await query(`UPDATE community_posts SET ai_status = 'correction_needed' WHERE id = $1`, [postId]);
    return reply.status(200).send({ id: postId, aiStatus: 'correction_needed' });
  });

  fastify.patch('/community/:postId/pin', async (request, reply) => {
    const facultyId = request.user!.id;
    const { postId } = request.params as { postId: string };
    if (!(await assertPostOwnedByFaculty(facultyId, postId))) {
      return reply.status(403).send({ error: 'Post not found or not assigned to faculty' });
    }
    const rows = await query<{ is_pinned: boolean }>(
      `UPDATE community_posts SET is_pinned = NOT is_pinned WHERE id = $1 RETURNING is_pinned`,
      [postId]
    );
    return reply.status(200).send({ id: postId, isPinned: rows[0]?.is_pinned ?? false });
  });

  fastify.delete('/community/:postId', async (request, reply) => {
    const facultyId = request.user!.id;
    const { postId } = request.params as { postId: string };
    if (!(await assertPostOwnedByFaculty(facultyId, postId))) {
      return reply.status(403).send({ error: 'Post not found or not assigned to faculty' });
    }
    await query(`UPDATE community_posts SET is_flagged = true WHERE id = $1`, [postId]);
    return reply.status(200).send({ message: 'Flagged' });
  });
}
