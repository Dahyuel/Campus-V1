import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAuth } from '../middleware/requireAuth.js';
import { query } from '../db/client.js';
import { redis } from '../redis.js';
import { escapeHtml } from '../lib/sanitize.js';
import { MATERIALS_BUCKET } from '../plugins/minio.js';
import { haversineDistance } from '../lib/geo.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateLabel(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function qrKey(token: string): string {
  return `qr:${token}`;
}

interface CourseRow extends Record<string, unknown> {
  id: string;
  name: string;
  code: string;
  credits: number;
  faculty_name: string | null;
  faculty_avatar: string | null;
  status: string;
  attendance_pct: number;
}

interface AssessmentRow extends Record<string, unknown> {
  course_id: string;
  id: string;
  title: string;
  type: string;
  weight_pct: string;
  out_of: number | null;
  grade: string | null;
  released_date: string | null;
  grade_status: string | null;
}

const SHORT_LABELS: Record<string, string> = {
  'MATH-201': 'Math',
  'CS-301': 'DS',
  'CS-302': 'OS',
  'CS-401': 'AI',
  'CS-303': 'Net',
  'ENG-101': 'Eng',
};

function parseWeight(weight: string): number {
  const value = parseFloat(weight.replace('%', ''));
  return Number.isFinite(value) ? value : 0;
}

// AUDIT-FIX: candidate (a) wins — round each component percentage first, weight it,
// divide by the sum of RELEASED weights, then round the final result.
//   round( sum(round(grade/outOf*100) * weight) / sum(weight over RELEASED) )
// NOTE: this does NOT reproduce every stored mock currentAverage; the mock's
// stored values are internally inconsistent with its own assessment rows
// (only ENG-101 reconciles). This is the mathematically correct formula.
function computeAverage(assessments: AssessmentRow[]): number {
  let weightedPoints = 0;
  let releasedWeight = 0;
  for (const a of assessments) {
    if (a.grade_status === 'RELEASED' && a.grade !== null && a.out_of) {
      const weight = parseWeight(a.weight_pct);
      weightedPoints += Math.round((Number(a.grade) / a.out_of) * 100) * weight;
      releasedWeight += weight;
    }
  }
  if (releasedWeight === 0) return 0;
  return Math.round(weightedPoints / releasedWeight);
}

async function requireStudent(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  await requireAuth(request, reply);
  if (reply.sent) return;
  if (request.user?.roleType !== 'student') {
    return reply.status(403).send({ error: 'Forbidden' });
  }
}

export default async function studentRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireStudent);

  fastify.get('/courses', async (request, reply) => {
    const studentId = request.user!.id;

    const courses = await query<CourseRow>(
      `SELECT c.id, c.name, c.code, c.credits, u.name AS faculty_name, u.avatar_url AS faculty_avatar,
              e.status, e.attendance_pct
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN users u ON u.id = c.faculty_id
       WHERE e.student_id = $1
       ORDER BY c.code`,
      [studentId]
    );

    const assessments = await query<AssessmentRow>(
      `SELECT a.course_id, a.id, a.title, a.type, a.weight_pct, a.out_of,
              g.grade, g.released_date, g.status AS grade_status
       FROM assessments a
       JOIN enrollments e ON e.course_id = a.course_id AND e.student_id = $1
       LEFT JOIN grades g ON g.assessment_id = a.id AND g.student_id = $1
       ORDER BY a.course_id, a.display_order`,
      [studentId]
    );

    const result = courses.map((c) => {
      const courseAssessments = assessments.filter((a) => a.course_id === c.id);
      const gradesReleased = courseAssessments.filter(
        (a) => a.grade_status === 'RELEASED'
      ).length;

      return {
        id: c.id,
        name: escapeHtml(c.name),
        code: escapeHtml(c.code),
        faculty: escapeHtml(c.faculty_name ?? ''),
        facultyAvatar: null,
        credits: c.credits,
        attendancePct: c.attendance_pct,
        gradesReleased,
        totalGrades: courseAssessments.length,
        status: c.status,
        currentAverage: computeAverage(courseAssessments),
        assessments: courseAssessments.map((a) => ({
          id: a.id,
          assessment: escapeHtml(a.title),
          type: escapeHtml(a.type),
          weight: escapeHtml(a.weight_pct),
          grade: a.grade === null ? null : Number(a.grade),
          outOf: a.out_of,
          releasedDate: a.released_date,
          status: a.grade_status ?? 'PENDING',
        })),
      };
    });

    return reply.status(200).send(result);
  });

  fastify.get('/transcript', async (request, reply) => {
    const studentId = request.user!.id;
    const rows = await query<{
      id: string;
      course_name: string;
      course_code: string;
      grade: string;
      gpa_points: string;
      semester: string;
    }>(
      `SELECT id, course_name, course_code, grade, gpa_points, semester
       FROM transcript_entries WHERE student_id = $1 ORDER BY enrolled_at DESC NULLS LAST, course_name`,
      [studentId]
    );

    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        course: escapeHtml(r.course_name),
        code: escapeHtml(r.course_code),
        grade: escapeHtml(r.grade),
        gpaPoints: escapeHtml(r.gpa_points),
        semester: escapeHtml(r.semester),
      }))
    );
  });

  fastify.get('/schedule', async (request, reply) => {
    const studentId = request.user!.id;
    const rows = await query<{
      id: string;
      day_of_week: string;
      time_slot: string;
      room: string | null;
      is_live: boolean | null;
      course_name: string;
      course_code: string;
      faculty_name: string | null;
    }>(
      `SELECT s.id, s.day_of_week, s.time_slot, s.room, s.is_live,
              COALESCE(s.name, c.name) AS course_name, c.code AS course_code,
              COALESCE(sf.name, u.name) AS faculty_name
       FROM schedule_slots s
       JOIN courses c ON c.id = s.course_id
       JOIN enrollments e ON e.course_id = c.id AND e.student_id = $1
       LEFT JOIN users sf ON sf.id = s.faculty_id
       LEFT JOIN users u ON u.id = c.faculty_id
       ORDER BY s.day_of_week, s.time_slot`,
      [studentId]
    );

    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        day: escapeHtml(r.day_of_week),
        timeSlot: escapeHtml(r.time_slot),
        courseName: escapeHtml(r.course_name),
        courseCode: escapeHtml(r.course_code),
        room: escapeHtml(r.room ?? ''),
        faculty: escapeHtml(r.faculty_name ?? ''),
        isLive: r.is_live ?? false,
      }))
    );
  });

  fastify.get('/events', async (request, reply) => {
    const studentId = request.user!.id;
    const rows = await query<{
      id: string;
      type: string;
      title: string;
      date_label: string;
      time_label: string;
      room: string | null;
      course_code: string | null;
      course_name: string | null;
    }>(
      `SELECT ev.id, ev.type, ev.title, ev.date_label, ev.time_label, ev.room,
              c.code AS course_code, c.name AS course_name
       FROM upcoming_events ev
       LEFT JOIN courses c ON c.id = ev.course_id
       WHERE ev.student_id = $1
       ORDER BY ev.starts_at ASC NULLS LAST`, 
      [studentId]
    );

    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        type: escapeHtml(r.type),
        courseName: escapeHtml(r.course_name ?? ''),
        courseCode: escapeHtml(r.course_code ?? ''),
        date: escapeHtml(r.date_label),
        time: escapeHtml(r.time_label),
        room: escapeHtml(r.room ?? ''),
      }))
    );
  });

  fastify.get('/dashboard', async (request, reply) => {
    const studentId = request.user!.id;

    const courses = await query<CourseRow>(
      `SELECT c.id, c.name, c.code, c.credits, u.name AS faculty_name, u.avatar_url AS faculty_avatar,
              e.status, e.attendance_pct
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN users u ON u.id = c.faculty_id
       WHERE e.student_id = $1
       ORDER BY c.code`,
      [studentId]
    );

    const assessments = await query<AssessmentRow>(
      `SELECT a.course_id, a.id, a.title, a.type, a.weight_pct, a.out_of,
              g.grade, g.released_date, g.status AS grade_status
       FROM assessments a
       JOIN enrollments e ON e.course_id = a.course_id AND e.student_id = $1
       LEFT JOIN grades g ON g.assessment_id = a.id AND g.student_id = $1
       ORDER BY a.course_id, a.display_order`,
      [studentId]
    );

    const gradeSubjects = courses.map((c) => ({
      subject: escapeHtml(c.name),
      shortLabel: escapeHtml(SHORT_LABELS[c.code] ?? c.code),
      score: computeAverage(assessments.filter((a) => a.course_id === c.id)),
      maxScore: 100,
      highlighted: c.code === 'CS-301',
    }));

    const releases = await query<{
      id: string;
      title: string;
      course_name: string;
      released_date: string | null;
      entered_at: string;
    }>(
      `SELECT g.id, a.title, c.name AS course_name, g.released_date, g.entered_at
       FROM grades g
       JOIN assessments a ON a.id = g.assessment_id
       JOIN courses c ON c.id = a.course_id
       WHERE g.student_id = $1 AND g.status = 'RELEASED'
       ORDER BY g.entered_at DESC
       LIMIT 5`,
      [studentId]
    );

    const activities = releases.map((r) => ({
      id: r.id,
      type: 'grade',
      title: 'Grade Released for',
      subject: escapeHtml(r.title),
      time: escapeHtml(r.released_date ?? ''),
    }));

    return reply.status(200).send({
      gradeSubjects,
      activities,
      invoices: [],
    });
  });

  fastify.get('/materials', async (request, reply) => {
    const studentId = request.user!.id;
    const rows = await query<{
      id: string;
      course_id: string;
      course_name: string;
      course_code: string;
      semester: string;
      file_name: string;
      material_type: string;
      uploaded_at: string;
      file_size: string | null;
    }>(
      `SELECT cm.id, cm.course_id, c.name AS course_name, c.code AS course_code,
              c.semester, cm.file_name, cm.material_type, cm.uploaded_at, cm.file_size
       FROM course_materials cm
       JOIN courses c ON c.id = cm.course_id
       WHERE cm.course_id IN (SELECT course_id FROM enrollments WHERE student_id = $1)
       ORDER BY c.code, cm.uploaded_at DESC`,
      [studentId]
    );

    const courses = await query<{
      id: string;
      name: string;
      code: string;
      semester: string;
      status: string;
    }>(
      `SELECT c.id, c.name, c.code, c.semester, e.status
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.student_id = $1
       ORDER BY c.code`,
      [studentId]
    );

    const taRows = await query<{
      id: string;
      course_id: string;
      course_name: string;
      course_code: string;
      semester: string;
      file_name: string;
      material_type: string;
      section_label: string;
      ta_name: string | null;
      uploaded_at: string;
      file_size: string | null;
    }>(
      `SELECT tm.id, tm.course_id, c.name AS course_name, c.code AS course_code,
              c.semester, tm.file_name, tm.material_type, tm.section_label,
              u.name AS ta_name, tm.uploaded_at, tm.file_size
       FROM ta_materials tm
       JOIN courses c ON c.id = tm.course_id
       LEFT JOIN users u ON u.id = tm.ta_id
       WHERE tm.course_id IN (SELECT course_id FROM enrollments WHERE student_id = $1)
       ORDER BY c.code, tm.uploaded_at DESC`,
      [studentId]
    );

    const merged = [
      ...rows.map((r) => ({
        id: r.id,
        courseId: r.course_id,
        courseName: escapeHtml(r.course_name),
        courseCode: escapeHtml(r.course_code),
        semester: escapeHtml(r.semester),
        fileName: escapeHtml(r.file_name),
        type: escapeHtml(r.material_type),
        uploadDate: formatDateLabel(r.uploaded_at),
        size: r.file_size ?? '',
        source: 'faculty',
        sectionLabel: null,
        uploadedBy: null,
      })),
      ...taRows.map((r) => ({
        id: r.id,
        courseId: r.course_id,
        courseName: escapeHtml(r.course_name),
        courseCode: escapeHtml(r.course_code),
        semester: escapeHtml(r.semester),
        fileName: escapeHtml(r.file_name),
        type: escapeHtml(r.material_type),
        uploadDate: formatDateLabel(r.uploaded_at),
        size: r.file_size ?? '',
        source: 'ta',
        sectionLabel: r.section_label,
        uploadedBy: escapeHtml(r.ta_name ?? ''),
      })),
    ];

    return reply.status(200).send({
      courses: courses.map((c) => ({
        id: c.id,
        name: escapeHtml(c.name),
        code: escapeHtml(c.code),
        semester: escapeHtml(c.semester),
        status: c.status,
        isCurrent: c.status !== 'COMPLETED',
      })),
      materials: merged,
    });
  });

  fastify.get('/materials/:materialId/url', async (request, reply) => {
    const studentId = request.user!.id;
    const { materialId } = request.params as { materialId: string };

    const rows = await query<{ file_key: string; file_name: string }>(
      `SELECT cm.file_key, cm.file_name
       FROM course_materials cm
       WHERE cm.id = $1
         AND cm.course_id IN (SELECT course_id FROM enrollments WHERE student_id = $2)
       LIMIT 1`,
      [materialId, studentId]
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
}
