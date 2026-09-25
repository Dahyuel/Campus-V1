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

const QR_TTL_SECONDS = 600;
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ALLOWED_MATERIAL_TYPES = [
  'PDF Lecture Slides',
  'Assignment PDF',
  'Lab Archive Code',
  'Video Lecture',
  'Other',
];
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.zip', '.mp4'];
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
      course_name: string;
      code: string;
      room: string | null;
      time_slot: string;
      day_of_week: string;
      students_count: string;
    }>(
      `SELECT s.id, c.name AS course_name, c.code, s.room, s.time_slot, s.day_of_week,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS students_count
       FROM schedule_slots s
       JOIN courses c ON c.id = s.course_id
       WHERE c.id = ANY($1::uuid[])
       ORDER BY s.time_slot`,
      [courseIds.length ? courseIds : emptyIds]
    );

    let schedule = scheduleRows
      .filter((r) => r.day_of_week === today)
      .map((r) => ({
        id: r.id,
        courseName: r.course_name,
        code: r.code,
        room: r.room ?? '',
        time: r.time_slot,
        studentsCount: Number(r.students_count),
        status: 'Upcoming',
      }));

    if (schedule.length === 0) {
      const courses = await query<{ id: string; name: string; code: string; students_count: string }>(
        `SELECT c.id, c.name, c.code,
                (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS students_count
         FROM faculty_course_assignments fca
         JOIN courses c ON c.id = fca.course_id
         WHERE fca.faculty_id = $1
         ORDER BY c.code`,
        [facultyId]
      );
      schedule = courses.map((c) => ({
        id: c.id,
        courseName: c.name,
        code: c.code,
        room: '',
        time: '',
        studentsCount: Number(c.students_count),
        status: 'Upcoming',
      }));
    }

    const pendingActions = [
      { id: 'act-f1', priority: 'high', color: 'bg-rose-500', text: 'Enter midterm grades for Data Structures — due in 3 days', actionText: 'Do Now' },
      { id: 'act-f2', priority: 'medium', color: 'bg-amber-500', text: 'Publish Lecture 12 slides for Networks', actionText: 'Do Now' },
      { id: 'act-f3', priority: 'low', color: 'bg-blue-500', text: 'Review 5 pending AI answers in CS-301 community', actionText: 'Do Now' },
    ];

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

  fastify.get('/assessments', async (request, reply) => {
    const facultyId = request.user!.id;
    const { courseId } = request.query as { courseId?: string };
    if (!courseId || !(await assertCourseOwned(facultyId, courseId))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const rows = await query<{ id: string; title: string; type: string; weight_pct: string; out_of: number | null }>(
      `SELECT id, title, type, weight_pct, out_of FROM assessments
       WHERE course_id = $1
       ORDER BY display_order, title`,
      [courseId]
    );
    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        weight: r.weight_pct,
        outOf: r.out_of ?? 100,
      }))
    );
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

    const sizeMb = (buffer.length / (1024 * 1024)).toFixed(1);
    const inserted = await query<{ id: string; uploaded_at: string }>(
      `INSERT INTO course_materials (course_id, faculty_id, file_name, file_key, file_size, material_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, uploaded_at`,
      [course.id, facultyId, safeName, key, `${sizeMb} MB`, materialType]
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
      size: `${sizeMb} MB`,
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
    }>(
      `SELECT u.id, u.name, u.code_id, c.name AS course_name, e.attendance_pct, c.id AS course_id
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
          id: s.id,
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
    }>(
      `SELECT DISTINCT ON (other_id) other_id, other_name, other_role, body, sent_at, read_at, sender_id
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
      rows.map((r, idx) => {
        const roleLabel = ROLE_LABELS[r.other_role] ?? r.other_role;
        return {
          id: `conv-${idx + 1}`,
          userId: r.other_id,
          name: escapeHtml(r.other_name),
          role: escapeHtml(roleLabel),
          roleCategory: roleLabel === 'Student' ? 'Students' : roleLabel === 'Admin' ? 'Admin' : 'Faculty',
          avatarUrl: null,
          avatar: '',
          lastMessage: escapeHtml(r.body),
          time: formatDateLabel(r.sent_at),
          unreadCount: r.read_at === null && r.sender_id !== facultyId ? 1 : 0,
          online: true,
        };
      })
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
        text: escapeHtml(r.body),
        time: formatDateLabel(r.sent_at),
      }))
    );
  });

  fastify.post('/messages/:userId', async (request, reply) => {
    const facultyId = request.user!.id;
    const { userId } = request.params as { userId: string };
    const { body } = request.body as { body: string };
    const inserted = await query<{ id: string; sent_at: string }>(
      `INSERT INTO messages (sender_id, recipient_id, body) VALUES ($1, $2, $3) RETURNING id, sent_at`,
      [facultyId, userId, body]
    );
    return reply.status(200).send({
      id: inserted[0].id,
      sender: 'me',
      text: escapeHtml(body),
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
        title: escapeHtml(r.title),
        author: escapeHtml(r.author_name ?? 'Anonymous'),
        authorRole: 'Student',
        avatarUrl: null,
        avatar: '',
        timeAgo: timeAgo(r.created_at),
        content: escapeHtml(r.content),
        upvotes: r.upvotes,
        isPinned: r.is_pinned,
        hasAiResponse: r.ai_answer !== null,
        aiResponse: r.ai_answer
          ? { answer: escapeHtml(r.ai_answer), citation: escapeHtml(r.ai_citation ?? ''), status: r.ai_status ?? 'awaiting_approval' }
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
