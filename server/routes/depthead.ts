import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../middleware/requireAuth.js';
import { query } from '../db/client.js';
import { escapeHtml } from '../lib/sanitize.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateLabel(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function formatTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  let hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  faculty: 'Faculty',
  admin: 'Admin',
  'dept-head': 'Dept. Head',
  dean: 'Dean',
};

async function requireDeptHead(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(request, reply);
  if (reply.sent) return;
  if (request.user?.roleType !== 'dept-head') {
    return reply.status(403).send({ error: 'Forbidden' });
  }
}

async function getDeptIdForHead(headId: string): Promise<string | null> {
  const rows = await query<{ id: string }>(`SELECT id FROM departments WHERE head_id = $1 LIMIT 1`, [headId]);
  return rows[0]?.id ?? null;
}

interface StudentAvgRow extends Record<string, unknown> {
  student_id: string;
  course_id: string;
  avg: string | null;
}

async function computeAverages(courseIds: string[]): Promise<StudentAvgRow[]> {
  if (courseIds.length === 0) return [];
  return query<StudentAvgRow>(
    `SELECT e.student_id, e.course_id,
            COALESCE(SUM(CASE WHEN g.status = 'RELEASED' AND g.grade IS NOT NULL AND a.out_of IS NOT NULL
              THEN ROUND((g.grade / a.out_of) * 100) * NULLIF(REPLACE(a.weight_pct, '%', '')::int, 0) END)
              / NULLIF(SUM(CASE WHEN g.status = 'RELEASED' AND g.grade IS NOT NULL AND a.out_of IS NOT NULL
              THEN NULLIF(REPLACE(a.weight_pct, '%', '')::int, 0) END), 0), 0) AS avg
     FROM enrollments e
     LEFT JOIN assessments a ON a.course_id = e.course_id
     LEFT JOIN grades g ON g.assessment_id = a.id AND g.student_id = e.student_id
     WHERE e.course_id = ANY($1::uuid[])
     GROUP BY e.student_id, e.course_id`,
    [courseIds]
  );
}

function gpaFromAvg(avg: number): number {
  if (avg >= 90) return 3.8;
  if (avg >= 80) return 3.4;
  if (avg >= 70) return 2.9;
  if (avg >= 60) return 2.4;
  return 2.1;
}

export default async function deptHeadRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireDeptHead);

  fastify.get('/dashboard', async (request, reply) => {
    const deptId = await getDeptIdForHead(request.user!.id);
    if (!deptId) return reply.status(404).send({ error: 'Department not found' });

    const courses = await query<{ id: string; name: string; code: string }>(
      `SELECT id, name, code FROM courses WHERE department_id = $1`,
      [deptId]
    );
    const courseIds = courses.map((c) => c.id);
    const averages = await computeAverages(courseIds);

    const byCourse = new Map<string, number[]>();
    for (const a of averages) {
      const list = byCourse.get(a.course_id) ?? [];
      list.push(Number(a.avg ?? 0));
      byCourse.set(a.course_id, list);
    }

    const coursePerformance = courses.map((c) => {
      const avgs = byCourse.get(c.id) ?? [];
      const passRate = avgs.length ? Math.round((avgs.filter((v) => v >= 60).length / avgs.length) * 100) : 0;
      return { code: c.code, name: c.name, passRate, belowThreshold: passRate < 70 };
    });

    const facultyRows = await query<{
      id: string;
      name: string;
      courses_count: string;
      students_count: string;
    }>(
      `SELECT u.id, u.name,
              COUNT(DISTINCT fca.course_id)::text AS courses_count,
              COUNT(DISTINCT e.student_id)::text AS students_count
       FROM faculty_course_assignments fca
       JOIN users u ON u.id = fca.faculty_id
       JOIN courses c ON c.id = fca.course_id
       LEFT JOIN enrollments e ON e.course_id = fca.course_id
       WHERE c.department_id = $1
       GROUP BY u.id, u.name
       ORDER BY u.name`,
      [deptId]
    );

    const facultyList = await Promise.all(
      facultyRows.map(async (f) => {
        const fCourses = await query<{ id: string }>(
          `SELECT course_id AS id FROM faculty_course_assignments fca
           JOIN courses c ON c.id = fca.course_id WHERE fca.faculty_id = $1 AND c.department_id = $2`,
          [f.id, deptId]
        );
        const fAvgs = averages.filter((a) => fCourses.some((fc) => fc.id === a.course_id)).map((a) => Number(a.avg ?? 0));
        const avgGrade = fAvgs.length ? Math.round(fAvgs.reduce((s, v) => s + v, 0) / fAvgs.length) : 0;
        const passRate = fAvgs.length ? Math.round((fAvgs.filter((v) => v >= 60).length / fAvgs.length) * 100) : 0;
        return {
          id: f.id,
          name: f.name,
          coursesCount: Number(f.courses_count),
          studentsCount: Number(f.students_count),
          avgGrade: `${avgGrade}/100`,
          passRate,
          status: passRate >= 80 ? 'green' : passRate >= 65 ? 'orange' : 'red',
        };
      })
    );

    const atRiskRows = await query<{
      id: string;
      name: string;
      course_name: string;
      risk_level: string;
      signal: string | null;
    }>(
      `SELECT u.id, u.name, c.name AS course_name, arf.risk_level, arf.signal
       FROM at_risk_flags arf
       JOIN users u ON u.id = arf.student_id
       JOIN courses c ON c.id = arf.course_id
       WHERE c.department_id = $1 AND arf.resolved = false
       ORDER BY CASE arf.risk_level WHEN 'Critical' THEN 0 WHEN 'High' THEN 1 ELSE 2 END
       LIMIT 5`,
      [deptId]
    );

    const events = [
      { id: 'ev-1', title: 'Midterm Week starts', date: 'Mon 8 Jul' },
      { id: 'ev-2', title: 'Course evaluation opens', date: 'Wed 10 Jul' },
      { id: 'ev-3', title: 'Faculty load report due', date: 'Fri 12 Jul' },
    ];

    return reply.status(200).send({
      coursePerformance,
      facultyList,
      atRiskStudents: atRiskRows.map((r) => ({
        id: r.id,
        name: r.name,
        course: r.course_name,
        risk: r.risk_level,
        trigger: r.signal ?? '',
      })),
      events,
    });
  });

  fastify.get('/courses', async (request, reply) => {
    const deptId = await getDeptIdForHead(request.user!.id);
    if (!deptId) return reply.status(404).send({ error: 'Department not found' });

    const courses = await query<{
      id: string;
      name: string;
      code: string;
      faculty_name: string | null;
      sections: string;
      enrolled: string;
      avg_attendance: string | null;
      room: string | null;
    }>(
      `SELECT c.id, c.name, c.code, u.name AS faculty_name,
              (SELECT COUNT(*) FROM faculty_course_assignments fca WHERE fca.course_id = c.id)::text AS sections,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id)::text AS enrolled,
              (SELECT ROUND(AVG(e.attendance_pct)) FROM enrollments e WHERE e.course_id = c.id)::text AS avg_attendance,
              (SELECT fca.room FROM faculty_course_assignments fca WHERE fca.course_id = c.id LIMIT 1) AS room
       FROM courses c
       LEFT JOIN users u ON u.id = c.faculty_id
       WHERE c.department_id = $1
       ORDER BY c.code`,
      [deptId]
    );
    const averages = await computeAverages(courses.map((c) => c.id));
    const byCourse = new Map<string, number[]>();
    for (const a of averages) {
      const list = byCourse.get(a.course_id) ?? [];
      list.push(Number(a.avg ?? 0));
      byCourse.set(a.course_id, list);
    }

    return reply.status(200).send(
      courses.map((c) => {
        const avgs = byCourse.get(c.id) ?? [];
        const avgGrade = avgs.length ? Math.round(avgs.reduce((s, v) => s + v, 0) / avgs.length) : 0;
        const passRateNum = avgs.length ? Math.round((avgs.filter((v) => v >= 60).length / avgs.length) * 100) : 0;
        const status = passRateNum >= 80 ? 'ON TRACK' : passRateNum >= 65 ? 'NEEDS ATTENTION' : 'AT RISK';
        const statusColor = passRateNum >= 80 ? 'green' : passRateNum >= 65 ? 'orange' : 'red';
        return {
          id: c.id,
          name: c.name,
          code: c.code,
          faculty: c.faculty_name ?? 'Unassigned',
          sections: Number(c.sections),
          enrolled: Number(c.enrolled),
          avgAttendance: `${c.avg_attendance ?? 0}%`,
          avgGrade: `${avgGrade}/100`,
          passRate: `${passRateNum}%`,
          passRateNum,
          status,
          statusColor,
          room: c.room ?? '',
          description: '',
        };
      })
    );
  });

  fastify.get('/faculty', async (request, reply) => {
    const deptId = await getDeptIdForHead(request.user!.id);
    if (!deptId) return reply.status(404).send({ error: 'Department not found' });

    const facultyRows = await query<{
      id: string;
      name: string;
      code_id: string;
      email: string;
      title: string | null;
    }>(
      `SELECT DISTINCT u.id, u.name, u.code_id, u.email, u.title
       FROM users u
       JOIN faculty_course_assignments fca ON fca.faculty_id = u.id
       JOIN courses c ON c.id = fca.course_id
       WHERE c.department_id = $1
       ORDER BY u.name`,
      [deptId]
    );

    const result = await Promise.all(
      facultyRows.map(async (f) => {
        const assigned = await query<{
          code: string;
          name: string;
          section: string;
          students: string;
          course_id: string;
        }>(
          `SELECT c.code, c.name, fca.section,
                  (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id)::text AS students,
                  c.id AS course_id
           FROM faculty_course_assignments fca
           JOIN courses c ON c.id = fca.course_id
           WHERE fca.faculty_id = $1 AND c.department_id = $2`,
          [f.id, deptId]
        );
        const courseIds = assigned.map((a) => a.course_id);
        const averages = await computeAverages(courseIds);
        const vals = averages.map((a) => Number(a.avg ?? 0));
        const avgGrade = vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0;
        const passRateNum = vals.length ? Math.round((vals.filter((v) => v >= 60).length / vals.length) * 100) : 0;
        const studentsCount = assigned.reduce((s, a) => s + Number(a.students), 0);
        return {
          id: f.id,
          codeId: f.code_id,
          name: f.name,
          title: f.title ?? 'Faculty',
          coursesCount: assigned.length,
          studentsCount,
          loadHours: assigned.length * 3,
          avgGrade: `${avgGrade}/100`,
          passRate: `${passRateNum}%`,
          passRateNum,
          status: 'ACTIVE',
          statusColor: 'green',
          email: f.email,
          assignedCourses: assigned.map((a) => ({
            code: a.code,
            name: a.name,
            section: a.section,
            students: Number(a.students),
          })),
        };
      })
    );

    return reply.status(200).send(result);
  });

  fastify.get('/students', async (request, reply) => {
    const deptId = await getDeptIdForHead(request.user!.id);
    if (!deptId) return reply.status(404).send({ error: 'Department not found' });

    const students = await query<{
      id: string;
      name: string;
      code_id: string;
      email: string;
      created_at: string;
      attendance: string | null;
    }>(
      `SELECT u.id, u.name, u.code_id, u.email, u.created_at,
              (SELECT ROUND(AVG(e.attendance_pct)) FROM enrollments e
               JOIN courses c ON c.id = e.course_id
               WHERE e.student_id = u.id AND c.department_id = $1)::text AS attendance
       FROM users u
       WHERE u.role_type = 'student' AND u.id IN (
         SELECT e.student_id FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE c.department_id = $1
       )
       ORDER BY u.name`,
      [deptId]
    );

    const result = await Promise.all(
      students.map(async (s) => {
        const enrolled = await query<{
          code: string;
          name: string;
          course_id: string;
          attendance_pct: number;
        }>(
          `SELECT c.code, c.name, c.id AS course_id, e.attendance_pct
           FROM enrollments e JOIN courses c ON c.id = e.course_id
           WHERE e.student_id = $1 AND c.department_id = $2`,
          [s.id, deptId]
        );
        const courseIds = enrolled.map((e) => e.course_id);
        const averages = (await computeAverages(courseIds)).filter((a) => a.student_id === s.id);
        const vals = averages.map((a) => Number(a.avg ?? 0));
        const avg = vals.length ? Math.round(vals.reduce((v, x) => v + x, 0) / vals.length) : 0;
        const gpa = gpaFromAvg(avg);
        const attendanceNum = Number(s.attendance ?? 0);
        const standing = gpa >= 3.0 && attendanceNum >= 75 ? 'GOOD STANDING' : attendanceNum < 75 ? 'WARNING' : 'AT RISK';
        const standingColor = standing === 'GOOD STANDING' ? 'green' : standing === 'WARNING' ? 'orange' : 'red';
        const created = new Date(s.created_at);
        const years = Math.floor((Date.now() - created.getTime()) / (365.25 * 24 * 3600 * 1000));
        return {
          id: s.id,
          name: s.name,
          studentId: s.code_id,
          year: `Year ${Math.min(Math.max(years + 1, 1), 5)}`,
          gpa,
          attendance: `${attendanceNum}%`,
          attendanceNum,
          standing,
          standingColor,
          coursesCount: enrolled.length,
          email: s.email,
          primaryCourse: enrolled[0]?.name ?? '',
          feeStatus: 'Paid in Full',
          enrolledCourses: enrolled.map((e, i) => ({
            code: e.code,
            name: e.name,
            grade: vals[i] !== undefined ? `${vals[i]}%` : 'N/A',
            attendance: `${e.attendance_pct}%`,
          })),
        };
      })
    );

    return reply.status(200).send(result);
  });

  fastify.get('/at-risk', async (request, reply) => {
    const deptId = await getDeptIdForHead(request.user!.id);
    if (!deptId) return reply.status(404).send({ error: 'Department not found' });

    const students = await query<{
      id: string;
      name: string;
      code_id: string;
      email: string;
      course_name: string;
      course_id: string;
      risk_level: string;
      signal: string | null;
      created_at: string;
    }>(
      `SELECT u.id, u.name, u.code_id, u.email, c.name AS course_name, c.id AS course_id,
              arf.risk_level, arf.signal, u.created_at
       FROM at_risk_flags arf
       JOIN users u ON u.id = arf.student_id
       JOIN courses c ON c.id = arf.course_id
       WHERE c.department_id = $1 AND arf.resolved = false
       ORDER BY CASE arf.risk_level WHEN 'Critical' THEN 0 WHEN 'High' THEN 1 ELSE 2 END`,
      [deptId]
    );

    const result = await Promise.all(
      students.map(async (s) => {
        const avgs = await computeAverages([s.course_id]);
        const mine = avgs.filter((a) => a.student_id === s.id).map((a) => Number(a.avg ?? 0));
        const gpa = mine.length ? gpaFromAvg(Math.round(mine.reduce((x, v) => x + v, 0) / mine.length)) : 2.0;
        return {
          id: s.id,
          name: s.name,
          studentId: s.code_id,
          year: `Year ${Math.min(Math.max(Math.floor((Date.now() - new Date(s.created_at).getTime()) / (365.25 * 24 * 3600 * 1000)) + 1, 1), 5)}`,
          course: s.course_name,
          riskLevel: s.risk_level.toUpperCase(),
          riskColor: s.risk_level === 'Moderate' ? 'orange' : 'red',
          gpa: Number(gpa.toFixed(1)),
          signal: s.signal ?? '',
          email: s.email,
        };
      })
    );

    const logRows = await query<{ id: string; created_at: string; action: string; metadata: Record<string, unknown> | null }>(
      `SELECT id, created_at, action, metadata FROM activity_log
       WHERE action LIKE 'intervention:%' AND metadata->>'deptId' = $1
       ORDER BY created_at DESC`,
      [deptId]
    );
    const logs = logRows.map((l) => ({
      id: l.id,
      date: (l.metadata?.date as string) ?? formatDateLabel(l.created_at),
      studentName: (l.metadata?.studentName as string) ?? '',
      actionTaken: l.action.replace('intervention:', '').replace(/_/g, ' '),
      performer: (l.metadata?.performer as string) ?? 'System',
    }));

    return reply.status(200).send({ students: result, logs });
  });

  fastify.post('/at-risk/:studentId/intervene', async (request, reply) => {
    const deptId = await getDeptIdForHead(request.user!.id);
    if (!deptId) return reply.status(404).send({ error: 'Department not found' });
    const { studentId } = request.params as { studentId: string };
    const { action } = request.body as { action: string; note?: string };

    const owns = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM at_risk_flags arf
       JOIN courses c ON c.id = arf.course_id
       WHERE arf.student_id = $1 AND c.department_id = $2`,
      [studentId, deptId]
    );
    if (Number(owns[0]?.count ?? 0) === 0) {
      return reply.status(403).send({ error: 'Student is not at-risk in this department' });
    }

    const studentRows = await query<{ name: string }>(`SELECT name FROM users WHERE id = $1 LIMIT 1`, [studentId]);
    if (!studentRows[0]) return reply.status(404).send({ error: 'Student not found' });
    const studentName = studentRows[0].name;
    const date = formatDateLabel(new Date());

    await query(
      `INSERT INTO activity_log (user_id, action, metadata) VALUES ($1, $2, $3)`,
      [
        request.user!.id,
        `intervention:${action}`,
        { studentName, deptId, performer: request.user!.name, date, note: (request.body as { note?: string }).note ?? null },
      ]
    );

    return reply.status(200).send({
      id: studentId,
      date,
      studentName,
      actionTaken: action.replace(/_/g, ' '),
      performer: request.user!.name,
    });
  });

  fastify.get('/analytics', async (request, reply) => {
    const deptId = await getDeptIdForHead(request.user!.id);
    if (!deptId) return reply.status(404).send({ error: 'Department not found' });

    const courses = await query<{ id: string; name: string; code: string }>(
      `SELECT id, name, code FROM courses WHERE department_id = $1 ORDER BY code`,
      [deptId]
    );
    const courseIds = courses.map((c) => c.id);
    const averages = await computeAverages(courseIds);
    const byCourse = new Map<string, number[]>();
    for (const a of averages) {
      const list = byCourse.get(a.course_id) ?? [];
      list.push(Number(a.avg ?? 0));
      byCourse.set(a.course_id, list);
    }

    const coursePassRates = courses.map((c) => {
      const avgs = byCourse.get(c.id) ?? [];
      return { code: c.code, name: c.name, passRate: avgs.length ? Math.round((avgs.filter((v) => v >= 60).length / avgs.length) * 100) : 0 };
    });

    const studentAvgs = new Map<string, number[]>();
    for (const a of averages) {
      const list = studentAvgs.get(a.student_id) ?? [];
      list.push(Number(a.avg ?? 0));
      studentAvgs.set(a.student_id, list);
    }
    const gpaBands = [
      { band: 'Below 2.0', count: 0, pct: 0 },
      { band: '2.0-2.5', count: 0, pct: 0 },
      { band: '2.5-3.0', count: 0, pct: 0 },
      { band: '3.0-3.5', count: 0, pct: 0 },
      { band: '3.5-4.0', count: 0, pct: 0 },
    ];
    for (const vals of studentAvgs.values()) {
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      const gpa = gpaFromAvg(Math.round(avg));
      const idx = gpa < 2.0 ? 0 : gpa < 2.5 ? 1 : gpa < 3.0 ? 2 : gpa < 3.5 ? 3 : 4;
      gpaBands[idx].count += 1;
    }
    const totalStudents = studentAvgs.size | 1;
    for (const b of gpaBands) b.pct = Number(((b.count / totalStudents) * 100).toFixed(1));

    const atRiskCounts = await query<{ course_id: string; count: string }>(
      `SELECT course_id, COUNT(*)::text AS count FROM at_risk_flags WHERE resolved = false GROUP BY course_id`
    );
    const riskByCourse = new Map<string, number>();
    for (const r of atRiskCounts) riskByCourse.set(r.course_id, Number(r.count));

    const academicSummary = courses.map((c) => {
      const avgs = byCourse.get(c.id) ?? [];
      const passRate = avgs.length ? Math.round((avgs.filter((v) => v >= 60).length / avgs.length) * 100) : 0;
      const avgGrade = avgs.length ? Math.round(avgs.reduce((s, v) => s + v, 0) / avgs.length) : 0;
      return {
        course: c.name,
        code: c.code,
        students: avgs.length,
        passRate,
        avgGrade,
        atRisk: riskByCourse.get(c.id) ?? 0,
        trend: passRate >= 75 ? 'up' : 'down',
      };
    });

    return reply.status(200).send({
      coursePassRates,
      gpaBands,
      semesterComparison: [
        { semester: 'Fall 2024', avg: 76 },
        { semester: 'Spring 2025', avg: 79 },
      ],
      academicSummary,
    });
  });

  fastify.get('/reports', async (_request, reply) => {
    const rows = await query<{
      id: string;
      name: string;
      report_type: string;
      generated_at: string;
      generated_by: string;
      is_ai: boolean;
      format: string;
      summary: string | null;
    }>(
      `SELECT id, name, report_type, generated_at, generated_by, is_ai, format, summary
       FROM reports WHERE report_type IN ('Academic', 'HR') ORDER BY generated_at ASC, name ASC`
    );
    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.report_type,
        generatedDate: formatDateLabel(r.generated_at),
        generatedBy: r.generated_by,
        isAi: r.is_ai,
        format: r.format,
        summary: r.summary ?? '',
      }))
    );
  });

  fastify.get('/messages', async (request, reply) => {
    const deptHeadId = request.user!.id;
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
      [deptHeadId]
    );

    return reply.status(200).send(
      rows.map((r, idx) => {
        const roleType = (ROLE_LABELS[r.other_role] ?? r.other_role) as
          | 'Faculty'
          | 'Dean'
          | 'Student'
          | 'Admin'
          | 'System';
        return {
          id: `conv-${idx + 1}`,
          userId: r.other_id,
          name: r.other_name,
          roleLabel: ROLE_LABELS[r.other_role] ?? r.other_role,
          roleType,
          preview: r.body,
          time: formatTime(r.sent_at),
        unread: r.read_at === null && r.sender_id !== deptHeadId ? 1 : 0,
        avatar: undefined,
        messages: [],
        };
      })
    );
  });

  fastify.get('/messages/:userId', async (request, reply) => {
    const deptHeadId = request.user!.id;
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
      [deptHeadId, userId]
    );
    await query(
      `UPDATE messages SET read_at = NOW() WHERE recipient_id = $1 AND sender_id = $2 AND read_at IS NULL`,
      [deptHeadId, userId]
    );
    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        sender: r.sender_id === deptHeadId ? ('me' as const) : ('them' as const),
        text: r.body,
        time: formatTime(r.sent_at),
      }))
    );
  });

  fastify.post('/messages/:userId', async (request, reply) => {
    const deptHeadId = request.user!.id;
    const { userId } = request.params as { userId: string };
    const { body } = request.body as { body: string };
    const inserted = await query<{ id: string; sent_at: string }>(
      `INSERT INTO messages (sender_id, recipient_id, body) VALUES ($1, $2, $3) RETURNING id, sent_at`,
      [deptHeadId, userId, body]
    );
    return reply.status(200).send({
      id: inserted[0].id,
      sender: 'me' as const,
      text: body,
      time: formatTime(inserted[0].sent_at),
    });
  });
}
