import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { requireAuth } from '../middleware/requireAuth.js';
import { query } from '../db/client.js';
import { redis } from '../redis.js';
import { MATERIALS_BUCKET } from '../plugins/minio.js';
import { logActivity } from '../db/activity.js';
import { escapeHtml } from '../lib/sanitize.js';

const QR_TTL_SECONDS = 600;
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TA_GRADABLE_TYPES = ['Assignment', 'Quiz', 'Lab', 'Coursework'];
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx', '.zip', '.pptx'];

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

async function requireTA(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(request, reply);
  if (reply.sent) return;
  if (request.user?.roleType !== 'teaching-assistant') {
    return reply.status(403).send({ error: 'Forbidden' });
  }
}

interface TASectionRow extends Record<string, unknown> {
  id: string;
  course_id: string;
  course_name: string;
  course_code: string;
  section_label: string;
  room: string | null;
  faculty_id: string | null;
  faculty_name: string | null;
  faculty_email: string | null;
}

async function getTASections(taId: string): Promise<TASectionRow[]> {
  return query<TASectionRow>(
    `SELECT tsa.id, tsa.course_id, c.name AS course_name, c.code AS course_code,
            tsa.section_label, tsa.room,
            u.id AS faculty_id, u.name AS faculty_name, u.email AS faculty_email
     FROM ta_section_assignments tsa
     JOIN courses c ON c.id = tsa.course_id
     LEFT JOIN users u ON u.id = tsa.supervising_faculty_id
     WHERE tsa.ta_id = $1
     ORDER BY c.code`,
    [taId]
  );
}

async function verifyTASection(taId: string, courseId: string, sectionLabel?: string): Promise<boolean> {
  const params: string[] = [taId, courseId];
  let sql = `SELECT id FROM ta_section_assignments WHERE ta_id = $1 AND course_id = $2`;
  if (sectionLabel) {
    sql += ` AND section_label = $3`;
    params.push(sectionLabel);
  }
  const rows = await query<{ id: string }>(sql, params);
  return rows.length > 0;
}

export default async function taRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireTA);

  fastify.get('/dashboard', async (request, reply) => {
    const taId = request.user!.id;
    const sections = await getTASections(taId);
    const courseIds = [...new Set(sections.map((s) => s.course_id))];
    const emptyIds = ['00000000-0000-0000-0000-000000000000'];

    const today = DAYS[new Date().getDay()];
    const scheduleRows = await query<{
      id: string; course_id: string; section_label: string; room: string | null;
      time_slot: string; day_of_week: string; students_count: string;
    }>(
      `SELECT s.id, s.course_id, s.room, s.time_slot, s.day_of_week,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = s.course_id) AS students_count
       FROM schedule_slots s
       WHERE s.course_id = ANY($1::uuid[]) AND s.day_of_week = $2
       ORDER BY s.time_slot`,
      [courseIds.length ? courseIds : emptyIds, today]
    );

    const todaySections = scheduleRows.map((r) => {
      const sec = sections.find((s) => s.course_id === r.course_id);
      return {
        id: r.id,
        courseCode: sec?.course_code ?? '',
        courseName: sec?.course_name ?? '',
        sectionLabel: sec?.section_label ?? '',
        room: r.room ?? sec?.room ?? '',
        time: r.time_slot,
        studentsCount: Number(r.students_count),
        attendanceRate: 86,
      };
    });

    const gradingRows = await query<{
      assessment_id: string; assessment_title: string; course_id: string; course_code: string;
      ungraded: string;
    }>(
      `SELECT a.id AS assessment_id, a.title AS assessment_title, a.course_id, c.code AS course_code,
              (SELECT COUNT(*) FROM enrollments e
                LEFT JOIN grades g ON g.assessment_id = a.id AND g.student_id = e.student_id
                WHERE e.course_id = a.course_id AND g.id IS NULL) AS ungraded
       FROM assessments a
       JOIN courses c ON c.id = a.course_id
       WHERE a.course_id = ANY($1::uuid[]) AND a.type = ANY($2::text[])
       ORDER BY c.code, a.display_order`,
      [courseIds.length ? courseIds : emptyIds, TA_GRADABLE_TYPES]
    );

    const gradingQueue = gradingRows.map((r) => {
      const sec = sections.find((s) => s.course_id === r.course_id);
      const ungraded = Number(r.ungraded);
      return {
        assessmentId: r.assessment_id,
        assessmentTitle: r.assessment_title,
        courseCode: r.course_code,
        sectionLabel: sec?.section_label ?? '',
        ungradedCount: ungraded,
        dueLabel: 'Due in 2 days',
        priority: ungraded > 10 ? 'high' : ungraded > 4 ? 'medium' : 'low',
      };
    });

    const pendingRows = await query<{
      id: string; assessment_title: string; course_code: string; section_label: string;
      submitted_at: string; faculty_name: string | null; status: string;
    }>(
      `SELECT tgs.id, a.title AS assessment_title, c.code AS course_code, tgs.section_label,
              tgs.submitted_at, u.name AS faculty_name, tgs.status
       FROM ta_grade_submissions tgs
       JOIN assessments a ON a.id = tgs.assessment_id
       JOIN courses c ON c.id = tgs.course_id
       LEFT JOIN users u ON u.id = c.faculty_id
       WHERE tgs.ta_id = $1
       ORDER BY tgs.submitted_at DESC`,
      [taId]
    );

    const supervisors = sections.map((s) => ({
      courseCode: s.course_code,
      courseName: s.course_name,
      sectionLabel: s.section_label,
      facultyName: s.faculty_name ?? '',
      facultyEmail: s.faculty_email ?? '',
      facultyId: s.faculty_id ?? '',
    }));

    const activityRows = await query<{ id: string; action: string; created_at: string }>(
      `SELECT id, action, created_at FROM activity_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [taId]
    );

    const studentsCountRows = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM enrollments WHERE course_id = ANY($1::uuid[])`,
      [courseIds.length ? courseIds : emptyIds]
    );

    return reply.status(200).send({
      todaySections,
      gradingQueue,
      pendingApprovals: pendingRows.map((r) => ({
        submissionId: r.id,
        assessmentTitle: r.assessment_title,
        courseCode: r.course_code,
        sectionLabel: r.section_label,
        submittedAt: formatDateLabel(r.submitted_at),
        professorName: r.faculty_name ?? '',
        status: r.status,
      })),
      supervisors,
      recentActivity: activityRows.map((r) => ({ id: r.id, action: r.action, time: timeAgo(r.created_at) })),
      stats: {
        sectionsCount: sections.length,
        studentsCount: Number(studentsCountRows[0]?.count ?? 0),
        pendingGradingCount: gradingQueue.reduce((acc, g) => acc + g.ungradedCount, 0),
        pendingApprovalCount: pendingRows.filter((r) => r.status === 'PENDING').length,
      },
    });
  });

  fastify.get('/sections', async (request, reply) => {
    const taId = request.user!.id;
    const sections = await getTASections(taId);
    const result = [];
    for (const s of sections) {
      const sched = await query<{ day_of_week: string; time_slot: string; room: string | null }>(
        `SELECT day_of_week, time_slot, room FROM schedule_slots WHERE course_id = $1 ORDER BY day_of_week, time_slot`,
        [s.course_id]
      );
      const counts = await query<{ students: string; attendance: string | null }>(
        `SELECT COUNT(*) AS students, AVG(attendance_pct) AS attendance FROM enrollments WHERE course_id = $1`,
        [s.course_id]
      );
      const assessRows = await query<{ id: string; title: string; type: string; weight_pct: string; out_of: number | null }>(
        `SELECT id, title, type, weight_pct, out_of FROM assessments WHERE course_id = $1 AND type = ANY($2::text[]) ORDER BY display_order`,
        [s.course_id, TA_GRADABLE_TYPES]
      );
      const assessments = [];
      for (const a of assessRows) {
        const sub = await query<{ status: string }>(
          `SELECT status FROM ta_grade_submissions WHERE ta_id = $1 AND assessment_id = $2 AND section_label = $3 LIMIT 1`,
          [taId, a.id, s.section_label]
        );
        assessments.push({
          id: a.id,
          title: a.title,
          type: a.type,
          weight: a.weight_pct,
          outOf: a.out_of,
          taCanGrade: true,
          submissionStatus: sub[0]?.status ?? 'NOT SUBMITTED',
        });
      }
      result.push({
        id: s.id,
        courseId: s.course_id,
        courseCode: s.course_code,
        courseName: s.course_name,
        sectionLabel: s.section_label,
        room: s.room ?? '',
        facultyName: s.faculty_name ?? '',
        facultyEmail: s.faculty_email ?? '',
        facultyId: s.faculty_id ?? '',
        studentsCount: Number(counts[0]?.students ?? 0),
        attendanceRate: Math.round(Number(counts[0]?.attendance ?? 0)),
        schedule: sched.map((x) => ({ day: x.day_of_week, timeSlot: x.time_slot, room: x.room ?? '' })),
        assessments,
      });
    }
    return reply.status(200).send(result);
  });

  async function studentRoster(taId: string, courseId: string) {
    const students = await query<{ id: string; name: string; code_id: string; email: string; attendance_pct: number }>(
      `SELECT u.id, u.name, u.code_id, u.email, e.attendance_pct
       FROM enrollments e JOIN users u ON u.id = e.student_id
       WHERE e.course_id = $1 ORDER BY u.name`,
      [courseId]
    );
    const flags = await query<{ student_id: string }>(
      `SELECT student_id FROM ta_student_flags WHERE ta_id = $1 AND course_id = $2 AND resolved = false`,
      [taId, courseId]
    );
    const flagSet = new Set(flags.map((f) => f.student_id));
    const grades = await query<{ student_id: string; grade: string; out_of: number | null }>(
      `SELECT g.student_id, g.grade, a.out_of
       FROM grades g JOIN assessments a ON a.id = g.assessment_id
       WHERE a.course_id = $1 AND a.type = ANY($2::text[]) AND g.grade IS NOT NULL`,
      [courseId, TA_GRADABLE_TYPES]
    );
    return students.map((s) => {
      const sg = grades.filter((g) => g.student_id === s.id);
      const avg = sg.length
        ? Math.round(sg.reduce((acc, g) => acc + (g.out_of ? (Number(g.grade) / g.out_of) * 100 : 0), 0) / sg.length)
        : 0;
      let standing = 'GOOD';
      let standingColor = 'green';
      if (s.attendance_pct < 60 || avg < 50) { standing = 'AT RISK'; standingColor = 'red'; }
      else if (s.attendance_pct < 75 || avg < 65) { standing = 'WARNING'; standingColor = 'amber'; }
      return {
        id: s.id,
        name: escapeHtml(s.name),
        studentId: s.code_id,
        email: s.email,
        attendancePct: s.attendance_pct,
        assignmentAvg: avg,
        standing,
        standingColor,
        isFlagged: flagSet.has(s.id),
      };
    });
  }

  fastify.get('/sections/:courseId/students', async (request, reply) => {
    const taId = request.user!.id;
    const { courseId } = request.params as { courseId: string };
    const { section } = request.query as { section?: string };
    if (!(await verifyTASection(taId, courseId, section))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    return reply.status(200).send(await studentRoster(taId, courseId));
  });

  fastify.get('/students', async (request, reply) => {
    const taId = request.user!.id;
    const sections = await getTASections(taId);
    const result = [];
    for (const s of sections) {
      const roster = await studentRoster(taId, s.course_id);
      for (const r of roster) {
        result.push({ ...r, courseCode: s.course_code, courseName: s.course_name, sectionLabel: s.section_label });
      }
    }
    return reply.status(200).send(result);
  });

  fastify.post('/students/:studentId/flag', async (request, reply) => {
    const taId = request.user!.id;
    const { studentId } = request.params as { studentId: string };
    const { courseId, sectionLabel, reason } = request.body as { courseId: string; sectionLabel: string; reason: string };
    if (!(await verifyTASection(taId, courseId, sectionLabel))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    await query(
      `INSERT INTO ta_student_flags (ta_id, student_id, course_id, section_label, reason, notified_faculty)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (ta_id, student_id, course_id)
       DO UPDATE SET reason = EXCLUDED.reason, section_label = EXCLUDED.section_label, resolved = false, notified_faculty = true`,
      [taId, studentId, courseId, sectionLabel, reason]
    );
    const faculty = await query<{ id: string }>(
      `SELECT supervising_faculty_id AS id FROM ta_section_assignments WHERE ta_id = $1 AND course_id = $2 AND section_label = $3 LIMIT 1`,
      [taId, courseId, sectionLabel]
    );
    const student = await query<{ name: string }>(`SELECT name FROM users WHERE id = $1 LIMIT 1`, [studentId]);
    const course = await query<{ code: string }>(`SELECT code FROM courses WHERE id = $1 LIMIT 1`, [courseId]);
    if (faculty[0]?.id) {
      await query(
        `INSERT INTO notifications (user_id, title, body, type)
         VALUES ($1, $2, $3, 'alert')`,
        [
          faculty[0].id,
          `Student Needs Attention — ${sectionLabel}`,
          `TA ${request.user!.name} flagged ${student[0]?.name ?? 'a student'} in ${course[0]?.code ?? ''} ${sectionLabel}: ${reason}`,
        ]
      );
    }
    await logActivity(taId, 'ta_student_flag', { studentId, courseId });
    return reply.status(200).send({ flagged: true });
  });

  fastify.delete('/students/:studentId/flag', async (request, reply) => {
    const taId = request.user!.id;
    const { studentId } = request.params as { studentId: string };
    const { courseId } = request.query as { courseId?: string };
    await query(
      `UPDATE ta_student_flags SET resolved = true WHERE ta_id = $1 AND student_id = $2 AND course_id = $3`,
      [taId, studentId, courseId]
    );
    return reply.status(200).send({ resolved: true });
  });

  fastify.post('/attendance/session', async (request, reply) => {
    const taId = request.user!.id;
    const { courseId, lectureLabel, sectionLabel } = request.body as { courseId: string; lectureLabel: string; sectionLabel: string };
    if (!(await verifyTASection(taId, courseId, sectionLabel))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const qrToken = randomUUID();
    const expiresAt = new Date(Date.now() + QR_TTL_SECONDS * 1000);
    const inserted = await query<{ id: string }>(
      `INSERT INTO attendance_sessions (course_id, ta_id, section_label, lecture_label, session_date, qr_token, qr_expires_at, is_open)
       VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, true) RETURNING id`,
      [courseId, taId, sectionLabel, lectureLabel, qrToken, expiresAt.toISOString()]
    );
    const sessionId = inserted[0].id;
    await redis.setex(qrKey(qrToken), QR_TTL_SECONDS, JSON.stringify({ sessionId, courseId, taId, sectionLabel }));
    return reply.status(200).send({ sessionId, qrToken, expiresAt: expiresAt.toISOString(), lectureLabel });
  });

  fastify.post('/attendance/session/:sessionId/close', async (request, reply) => {
    const taId = request.user!.id;
    const { sessionId } = request.params as { sessionId: string };
    const rows = await query<{ qr_token: string | null }>(
      `SELECT qr_token FROM attendance_sessions WHERE id = $1 AND ta_id = $2 LIMIT 1`,
      [sessionId, taId]
    );
    if (!rows[0]) return reply.status(404).send({ error: 'Session not found' });
    if (rows[0].qr_token) await redis.del(qrKey(rows[0].qr_token));
    const counts = await query<{ present: string; absent: string }>(
      `SELECT COUNT(*) FILTER (WHERE status = 'PRESENT') AS present,
              COUNT(*) FILTER (WHERE status != 'PRESENT') AS absent
       FROM attendance_records WHERE session_id = $1`,
      [sessionId]
    );
    await query(
      `UPDATE attendance_sessions SET is_open = false, qr_token = NULL, present_count = $1, absent_count = $2 WHERE id = $3`,
      [Number(counts[0].present), Number(counts[0].absent), sessionId]
    );
    return reply.status(200).send({ message: 'Closed' });
  });

  fastify.get('/grades', async (request, reply) => {
    const taId = request.user!.id;
    const { courseId, assessmentTitle } = request.query as { courseId?: string; assessmentTitle?: string };
    if (!courseId || !(await verifyTASection(taId, courseId))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const assessmentRows = await query<{ id: string; out_of: number | null; type: string }>(
      `SELECT id, out_of, type FROM assessments WHERE course_id = $1 AND title = $2 LIMIT 1`,
      [courseId, assessmentTitle]
    );
    const assessment = assessmentRows[0];
    if (!assessment) return reply.status(200).send([]);
    if (!TA_GRADABLE_TYPES.includes(assessment.type)) {
      return reply.status(403).send({ error: 'TA cannot grade this assessment type' });
    }
    const outOf = assessment.out_of ?? 100;
    const rows = await query<{ student_name: string; code_id: string; grade: string | null; status: string | null }>(
      `SELECT u.name AS student_name, u.code_id, g.grade, g.status
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       LEFT JOIN grades g ON g.student_id = u.id AND g.assessment_id = $2
       WHERE e.course_id = $1 ORDER BY u.name`,
      [courseId, assessment.id]
    );
    return reply.status(200).send(
      rows.map((r) => ({
        studentName: escapeHtml(r.student_name),
        studentId: r.code_id,
        grade: r.grade === null ? null : Number(r.grade),
        outOf,
        percentage: r.grade === null ? null : Math.round((Number(r.grade) / outOf) * 100),
        status: r.grade === null ? 'MISSING' : r.status === 'RELEASED' ? 'RELEASED' : r.status === 'SUBMITTED' ? 'SUBMITTED' : 'ENTERED',
      }))
    );
  });

  fastify.post('/grades', async (request, reply) => {
    const taId = request.user!.id;
    const { courseId, assessmentTitle, entries } = request.body as {
      courseId: string;
      assessmentTitle: string;
      entries: Array<{ studentId: string; grade: number }>;
    };
    if (!courseId || !(await verifyTASection(taId, courseId))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const assessmentRows = await query<{ id: string; type: string }>(
      `SELECT id, type FROM assessments WHERE course_id = $1 AND title = $2 LIMIT 1`,
      [courseId, assessmentTitle]
    );
    if (!assessmentRows[0]) return reply.status(404).send({ error: 'Assessment not found' });
    if (!TA_GRADABLE_TYPES.includes(assessmentRows[0].type)) {
      return reply.status(403).send({ error: 'TA cannot grade this assessment type' });
    }
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
         DO UPDATE SET grade = EXCLUDED.grade, status = CASE WHEN grades.status IN ('RELEASED','SUBMITTED') THEN grades.status ELSE 'ENTERED' END`,
        [assessmentId, studentId, entry.grade]
      );
      saved += 1;
    }
    await logActivity(taId, 'ta_grade_entry', { courseId, assessmentTitle });
    return reply.status(200).send({ saved });
  });

  fastify.post('/grades/submit', async (request, reply) => {
    const taId = request.user!.id;
    const { courseId, assessmentTitle, sectionLabel } = request.body as { courseId: string; assessmentTitle: string; sectionLabel: string };
    if (!(await verifyTASection(taId, courseId, sectionLabel))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const assessmentRows = await query<{ id: string; type: string }>(
      `SELECT id, type FROM assessments WHERE course_id = $1 AND title = $2 LIMIT 1`,
      [courseId, assessmentTitle]
    );
    if (!assessmentRows[0]) return reply.status(404).send({ error: 'Assessment not found' });
    if (!TA_GRADABLE_TYPES.includes(assessmentRows[0].type)) {
      return reply.status(403).send({ error: 'TA cannot grade this assessment type' });
    }
    const assessmentId = assessmentRows[0].id;
    const updated = await query<{ id: string }>(
      `UPDATE grades SET status = 'SUBMITTED'
       WHERE assessment_id = $1 AND status = 'ENTERED' RETURNING id`,
      [assessmentId]
    );
    const submission = await query<{ id: string }>(
      `INSERT INTO ta_grade_submissions (ta_id, assessment_id, course_id, section_label, submitted_at, status)
       VALUES ($1, $2, $3, $4, NOW(), 'PENDING')
       ON CONFLICT (ta_id, assessment_id, section_label)
       DO UPDATE SET status = 'PENDING', submitted_at = NOW(), reviewed_at = NULL, reviewed_by = NULL
       RETURNING id`,
      [taId, assessmentId, courseId, sectionLabel]
    );
    const faculty = await query<{ id: string }>(
      `SELECT supervising_faculty_id AS id FROM ta_section_assignments WHERE ta_id = $1 AND course_id = $2 AND section_label = $3 LIMIT 1`,
      [taId, courseId, sectionLabel]
    );
    const course = await query<{ code: string }>(`SELECT code FROM courses WHERE id = $1 LIMIT 1`, [courseId]);
    if (faculty[0]?.id) {
      await query(
        `INSERT INTO notifications (user_id, title, body, type)
         VALUES ($1, 'TA Grade Submission Pending Review', $2, 'grade')`,
        [faculty[0].id, `${request.user!.name} (${request.user!.codeId}) submitted grades for ${assessmentTitle} — ${sectionLabel} in ${course[0]?.code ?? ''}. Please review and release.`]
      );
    }
    await logActivity(taId, 'ta_grade_submission', { courseId, assessmentTitle });
    return reply.status(200).send({ submitted: updated.length, submissionId: submission[0].id });
  });

  fastify.get('/grades/submissions', async (request, reply) => {
    const taId = request.user!.id;
    const rows = await query<{
      id: string; assessment_title: string; course_code: string; section_label: string;
      submitted_at: string; status: string; faculty_name: string | null; professor_note: string | null; reviewed_at: string | null;
    }>(
      `SELECT tgs.id, a.title AS assessment_title, c.code AS course_code, tgs.section_label,
              tgs.submitted_at, tgs.status, u.name AS faculty_name, tgs.professor_note, tgs.reviewed_at
       FROM ta_grade_submissions tgs
       JOIN assessments a ON a.id = tgs.assessment_id
       JOIN courses c ON c.id = tgs.course_id
       LEFT JOIN users u ON u.id = c.faculty_id
       WHERE tgs.ta_id = $1 ORDER BY tgs.submitted_at DESC`,
      [taId]
    );
    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        assessmentTitle: r.assessment_title,
        courseCode: r.course_code,
        sectionLabel: r.section_label,
        submittedAt: formatDateLabel(r.submitted_at),
        status: r.status,
        professorName: r.faculty_name ?? '',
        professorNote: r.professor_note,
        reviewedAt: r.reviewed_at ? formatDateLabel(r.reviewed_at) : null,
      }))
    );
  });

  fastify.get('/materials', async (request, reply) => {
    const taId = request.user!.id;
    const rows = await query<{
      id: string; file_name: string; section_label: string; material_type: string;
      file_size: string | null; uploaded_at: string; file_key: string; course_code: string; course_name: string;
    }>(
      `SELECT tm.id, tm.file_name, tm.section_label, tm.material_type, tm.file_size, tm.uploaded_at, tm.file_key,
              c.code AS course_code, c.name AS course_name
       FROM ta_materials tm JOIN courses c ON c.id = tm.course_id
       WHERE tm.ta_id = $1 ORDER BY tm.uploaded_at DESC`,
      [taId]
    );
    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        fileName: escapeHtml(r.file_name),
        courseCode: r.course_code,
        courseName: escapeHtml(r.course_name),
        sectionLabel: r.section_label,
        type: escapeHtml(r.material_type),
        size: r.file_size ?? '',
        uploadedAt: formatDateLabel(r.uploaded_at),
        fileKey: r.file_key,
      }))
    );
  });

  fastify.post('/materials/upload', async (request, reply) => {
    const taId = request.user!.id;
    const parts = request.parts();
    let courseId = '';
    let sectionLabel = '';
    let materialType = 'Other';
    let originalName = 'material.bin';
    let buffer: Buffer | null = null;
    for await (const part of parts) {
      if (part.type === 'file') {
        originalName = part.filename;
        buffer = await part.toBuffer();
      } else if (part.fieldname === 'courseId') {
        courseId = String(part.value);
      } else if (part.fieldname === 'sectionLabel') {
        sectionLabel = String(part.value);
      } else if (part.fieldname === 'materialType') {
        materialType = String(part.value);
      }
    }
    if (!buffer) return reply.status(400).send({ error: 'File is required' });
    if (!(await verifyTASection(taId, courseId, sectionLabel))) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const ext = path.extname(originalName).toLowerCase();
    if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
      return reply.status(400).send({ error: 'Unsupported file type' });
    }
    const safeName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const courseRows = await query<{ code: string; name: string }>(`SELECT code, name FROM courses WHERE id = $1 LIMIT 1`, [courseId]);
    const courseCode = courseRows[0]?.code ?? 'course';
    const key = `courses/${courseCode.toLowerCase()}/ta-materials/${sectionLabel.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}_${safeName}`;
    await fastify.minio.send(
      new PutObjectCommand({ Bucket: MATERIALS_BUCKET, Key: key, Body: buffer, ContentType: 'application/octet-stream' })
    );
    const sizeMb = (buffer.length / (1024 * 1024)).toFixed(1);
    const inserted = await query<{ id: string; uploaded_at: string }>(
      `INSERT INTO ta_materials (ta_id, course_id, section_label, file_name, file_key, file_size, material_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, uploaded_at`,
      [taId, courseId, sectionLabel, safeName, key, `${sizeMb} MB`, materialType]
    );
    await logActivity(taId, 'ta_material_upload', { courseId, sectionLabel });
    return reply.status(200).send({
      id: inserted[0].id,
      fileName: escapeHtml(safeName),
      courseCode,
      courseName: escapeHtml(courseRows[0]?.name ?? ''),
      sectionLabel,
      type: escapeHtml(materialType),
      size: `${sizeMb} MB`,
      uploadedAt: formatDateLabel(inserted[0].uploaded_at),
      fileKey: key,
    });
  });

  fastify.delete('/materials/:materialId', async (request, reply) => {
    const taId = request.user!.id;
    const { materialId } = request.params as { materialId: string };
    const rows = await query<{ file_key: string }>(
      `SELECT file_key FROM ta_materials WHERE id = $1 AND ta_id = $2 LIMIT 1`,
      [materialId, taId]
    );
    if (!rows[0]) return reply.status(403).send({ error: 'Material not found or not owned' });
    try {
      await fastify.minio.send(new DeleteObjectCommand({ Bucket: MATERIALS_BUCKET, Key: rows[0].file_key }));
    } catch {}
    await query(`DELETE FROM ta_materials WHERE id = $1`, [materialId]);
    return reply.status(200).send({ message: 'Deleted' });
  });

  fastify.get('/academic-record', async (request, reply) => {
    const taId = request.user!.id;
    const recordRows = await query<Record<string, unknown>>(
      `SELECT degree_type, thesis_title, thesis_supervisor, research_field, enrollment_year,
              expected_grad, current_stage, stage_progress, gpa, notes
       FROM ta_academic_record WHERE ta_id = $1 LIMIT 1`,
      [taId]
    );
    const courses = await query<Record<string, unknown>>(
      `SELECT id, course_name, course_code, semester, credits, grade, status
       FROM ta_postgrad_courses WHERE ta_id = $1 ORDER BY created_at`,
      [taId]
    );
    const STAGES = ['Coursework', 'Research Proposal', 'Data Collection', 'Writing', 'Defense'];
    const record = recordRows[0];
    const currentStage = record ? String(record.current_stage ?? '') : '';
    const currentIdx = STAGES.indexOf(currentStage);
    const stageTimeline = STAGES.map((stage, idx) => {
      const done = currentIdx > idx || (currentIdx === idx && Number(record?.stage_progress ?? 0) >= 100);
      const active = currentIdx === idx;
      return { stage, done, active, progress: active ? Number(record?.stage_progress ?? 0) : undefined };
    });
    return reply.status(200).send({
      record: record
        ? {
            degreeType: record.degree_type,
            thesisTitle: record.thesis_title,
            thesisSupervisor: record.thesis_supervisor,
            researchField: record.research_field,
            enrollmentYear: record.enrollment_year,
            expectedGrad: record.expected_grad,
            currentStage: record.current_stage,
            stageProgress: record.stage_progress,
            gpa: record.gpa === null ? null : Number(record.gpa),
            notes: record.notes,
          }
        : null,
      postgradCourses: courses.map((c) => ({
        id: c.id,
        courseName: escapeHtml(String(c.course_name)),
        courseCode: c.course_code,
        semester: c.semester,
        credits: c.credits,
        grade: c.grade,
        status: c.status,
      })),
      stageTimeline,
    });
  });

  fastify.put('/academic-record', async (request, reply) => {
    const taId = request.user!.id;
    const b = request.body as Record<string, unknown>;
    const rows = await query<Record<string, unknown>>(
      `INSERT INTO ta_academic_record (ta_id, degree_type, thesis_title, thesis_supervisor, research_field, enrollment_year, expected_grad, current_stage, stage_progress, gpa, notes, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       ON CONFLICT (ta_id) DO UPDATE SET
         degree_type = EXCLUDED.degree_type, thesis_title = EXCLUDED.thesis_title,
         thesis_supervisor = EXCLUDED.thesis_supervisor, research_field = EXCLUDED.research_field,
         enrollment_year = EXCLUDED.enrollment_year, expected_grad = EXCLUDED.expected_grad,
         current_stage = EXCLUDED.current_stage, stage_progress = EXCLUDED.stage_progress,
         gpa = EXCLUDED.gpa, notes = EXCLUDED.notes, updated_at = NOW()
       RETURNING *`,
      [taId, b.degreeType ?? "Master's", b.thesisTitle ?? null, b.thesisSupervisor ?? null, b.researchField ?? null, b.enrollmentYear ?? null, b.expectedGrad ?? null, b.currentStage ?? null, b.stageProgress ?? 0, b.gpa ?? null, b.notes ?? null]
    );
    return reply.status(200).send({ record: rows[0] });
  });

  fastify.post('/academic-record/courses', async (request, reply) => {
    const taId = request.user!.id;
    const { courseName, courseCode, semester, credits, grade, status } = request.body as {
      courseName: string; courseCode: string; semester: string; credits?: number; grade?: string; status?: string;
    };
    const rows = await query<Record<string, unknown>>(
      `INSERT INTO ta_postgrad_courses (ta_id, course_name, course_code, semester, credits, grade, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [taId, courseName, courseCode, semester, credits ?? 3, grade ?? null, status ?? 'IN PROGRESS']
    );
    return reply.status(200).send(rows[0]);
  });

  fastify.patch('/academic-record/courses/:courseId', async (request, reply) => {
    const taId = request.user!.id;
    const { courseId } = request.params as { courseId: string };
    const b = request.body as Record<string, unknown>;
    const rows = await query<Record<string, unknown>>(
      `UPDATE ta_postgrad_courses SET
         course_name = COALESCE($3, course_name), course_code = COALESCE($4, course_code),
         semester = COALESCE($5, semester), credits = COALESCE($6, credits),
         grade = COALESCE($7, grade), status = COALESCE($8, status)
       WHERE id = $1 AND ta_id = $2 RETURNING *`,
      [courseId, taId, b.courseName ?? null, b.courseCode ?? null, b.semester ?? null, b.credits ?? null, b.grade ?? null, b.status ?? null]
    );
    if (!rows[0]) return reply.status(404).send({ error: 'Course not found' });
    return reply.status(200).send(rows[0]);
  });

  fastify.delete('/academic-record/courses/:courseId', async (request, reply) => {
    const taId = request.user!.id;
    const { courseId } = request.params as { courseId: string };
    await query(`DELETE FROM ta_postgrad_courses WHERE id = $1 AND ta_id = $2`, [courseId, taId]);
    return reply.status(200).send({ message: 'Deleted' });
  });

  fastify.get('/messages', async (request, reply) => {
    const taId = request.user!.id;
    const rows = await query<{
      other_id: string; other_name: string; other_role: string; body: string;
      sent_at: string; read_at: string | null; sender_id: string;
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
      [taId]
    );
    const ROLE_LABELS: Record<string, string> = {
      student: 'Student', faculty: 'Faculty', admin: 'Admin', 'dept-head': 'Dept. Head', dean: 'Dean', 'teaching-assistant': 'Teaching Assistant',
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
          unreadCount: r.read_at === null && r.sender_id !== taId ? 1 : 0,
          online: true,
        };
      })
    );
  });

  fastify.get('/messages/:userId', async (request, reply) => {
    const taId = request.user!.id;
    const { userId } = request.params as { userId: string };
    const rows = await query<{ id: string; sender_id: string; body: string; sent_at: string }>(
      `SELECT id, sender_id, body, sent_at FROM messages
       WHERE (sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1)
       ORDER BY sent_at ASC`,
      [taId, userId]
    );
    await query(
      `UPDATE messages SET read_at = NOW() WHERE recipient_id = $1 AND sender_id = $2 AND read_at IS NULL`,
      [taId, userId]
    );
    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        sender: r.sender_id === taId ? 'me' : 'them',
        text: escapeHtml(r.body),
        time: formatDateLabel(r.sent_at),
      }))
    );
  });

  fastify.post('/messages/:userId', async (request, reply) => {
    const taId = request.user!.id;
    const { userId } = request.params as { userId: string };
    const { body } = request.body as { body: string };
    const inserted = await query<{ id: string; sent_at: string }>(
      `INSERT INTO messages (sender_id, recipient_id, body) VALUES ($1, $2, $3) RETURNING id, sent_at`,
      [taId, userId, body]
    );
    return reply.status(200).send({
      id: inserted[0].id,
      sender: 'me',
      text: escapeHtml(body),
      time: formatDateLabel(inserted[0].sent_at),
    });
  });
}
