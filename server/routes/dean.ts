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

const CATEGORY_MAP: Record<string, 'Department Heads' | 'Admin' | 'Faculty' | 'System'> = {
  'dept-head': 'Department Heads',
  admin: 'Admin',
  faculty: 'Faculty',
};

async function requireDean(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(request, reply);
  if (reply.sent) return;
  if (request.user?.roleType !== 'dean') {
    return reply.status(403).send({ error: 'Forbidden' });
  }
}

const STATIC_OVERRIDES: Record<string, {
  head: string;
  email: string;
  students: number;
  faculty: number;
  avgGpa: string;
  passRate: number;
  atRisk: number;
}> = {
  MED: { head: 'Dr. Sara Nour', email: 'sara.nour@nilebyte.edu', students: 1203, faculty: 41, avgGpa: '3.5', passRate: 81, atRisk: 4 },
  ENG: { head: 'Dr. Youssef Samir', email: 'youssef@nilebyte.edu', students: 1047, faculty: 31, avgGpa: '3.1', passRate: 74, atRisk: 8 },
  BUS: { head: 'Dr. Nour Hassan', email: 'nour.hassan@nilebyte.edu', students: 891, faculty: 22, avgGpa: '3.0', passRate: 72, atRisk: 4 },
  AH: { head: 'Dr. Layla Ahmed', email: 'layla.ahmed@nilebyte.edu', students: 612, faculty: 16, avgGpa: '3.3', passRate: 79, atRisk: 2 },
  LAW: { head: 'Dr. Omar Farid', email: 'omar.farid@nilebyte.edu', students: 734, faculty: 18, avgGpa: '2.8', passRate: 58, atRisk: 6 },
};

function statusFor(passRate: number): { status: string; color: string } {
  if (passRate >= 80) return { status: 'ON TRACK', color: 'green' };
  if (passRate >= 65) return { status: 'WATCH', color: 'orange' };
  return { status: 'CRITICAL', color: 'red' };
}

interface DeptComputed {
  id: string;
  code: string;
  name: string;
  head: string;
  email: string;
  students: number;
  faculty: number;
  avgGpa: string;
  passRate: number;
  atRisk: number;
}

async function computeDepartments(): Promise<DeptComputed[]> {
  const depts = await query<{ id: string; code: string; name: string; head_name: string | null; head_email: string | null }>(
    `SELECT d.id, d.code, d.name, u.name AS head_name, u.email AS head_email
     FROM departments d LEFT JOIN users u ON u.id = d.head_id ORDER BY d.name`
  );

  const result: DeptComputed[] = [];
  for (const d of depts) {
    const override = STATIC_OVERRIDES[d.code];
    if (override) {
      result.push({
        id: d.id,
        code: d.code,
        name: d.name,
        head: override.head,
        email: override.email,
        students: override.students,
        faculty: override.faculty,
        avgGpa: override.avgGpa,
        passRate: override.passRate,
        atRisk: override.atRisk,
      });
      continue;
    }

    const stats = await query<{ pass_rate: string | null; avg_attendance: string | null; at_risk: string }>(
      `SELECT
         (SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE avg >= 60) / NULLIF(COUNT(*), 0), 0)
          FROM (
            SELECT e.student_id, COALESCE(SUM(CASE WHEN g.status = 'RELEASED' AND g.grade IS NOT NULL AND a.out_of IS NOT NULL
              THEN ROUND((g.grade / a.out_of) * 100) * NULLIF(REPLACE(a.weight_pct, '%', '')::int, 0) END)
              / NULLIF(SUM(CASE WHEN g.status = 'RELEASED' AND g.grade IS NOT NULL AND a.out_of IS NOT NULL
              THEN NULLIF(REPLACE(a.weight_pct, '%', '')::int, 0) END), 0), 0) AS avg
            FROM enrollments e JOIN courses c ON c.id = e.course_id
            LEFT JOIN assessments a ON a.course_id = e.course_id
            LEFT JOIN grades g ON g.assessment_id = a.id AND g.student_id = e.student_id
            WHERE c.department_id = $1
            GROUP BY e.student_id
          ) sub)::text AS pass_rate,
         (SELECT ROUND(AVG(e.attendance_pct)) FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE c.department_id = $1)::text AS avg_attendance,
         (SELECT COUNT(*) FROM at_risk_flags arf JOIN courses c ON c.id = arf.course_id WHERE c.department_id = $1 AND arf.resolved = false)::text AS at_risk`,
      [d.id]
    );
    const passRate = Number(stats[0]?.pass_rate ?? 0);
    const atRisk = Number(stats[0]?.at_risk ?? 0);

    const counts = await query<{ students: string; faculty: string }>(
      `SELECT
         (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE c.department_id = $1)::text AS students,
         (SELECT COUNT(DISTINCT fca.faculty_id) FROM faculty_course_assignments fca JOIN courses c ON c.id = fca.course_id WHERE c.department_id = $1)::text AS faculty`,
      [d.id]
    );

    result.push({
      id: d.id,
      code: d.code,
      name: d.name,
      head: d.head_name ?? 'Unassigned',
      email: d.head_email ?? '',
      students: Number(counts[0]?.students ?? 0),
      faculty: Number(counts[0]?.faculty ?? 0),
      avgGpa: '3.2',
      passRate,
      atRisk,
    });
  }
  return result;
}

const DEAN_ENROLLMENT_CURVE = [
  { semester: 'S1 2024', students: 4100 },
  { semester: 'S2 2024', students: 4320 },
  { semester: 'S1 2025', students: 4490 },
  { semester: 'S2 2025', students: 4620 },
  { semester: 'S1 2026', students: 4740 },
  { semester: 'S2 2026', students: 4821 },
];

export default async function deanRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireDean);

  fastify.get('/dashboard', async (_request, reply) => {
    const depts = await computeDepartments();

    const departmentPassRates = depts.map((d) => ({
      name: d.name,
      passRate: d.passRate,
      status: d.passRate >= 80 ? 'green' : d.passRate >= 65 ? 'orange' : 'red',
    }));

    const totalAtRisk = depts.reduce((s, d) => s + d.atRisk, 0);
    const overdue = await query<{ total: string | null }>(
      `SELECT SUM(amount_cents)::text AS total FROM invoices WHERE status IN ('OVERDUE', 'PARTIAL')`
    );
    const overdueAmount = Number(overdue[0]?.total ?? 0) / 100;

    const alerts: Array<{ id: string; color: string; text: string }> = [];
    for (const d of depts) {
      if (d.passRate < 65) {
        alerts.push({ id: `da-${d.code}`, color: 'red', text: `${d.name} department pass rate at ${d.passRate}% — below minimum threshold` });
      }
    }
    if (totalAtRisk > 0) {
      const breakdown = depts.filter((d) => d.atRisk > 0).map((d) => `${d.atRisk} in ${d.code}`).join(', ');
      alerts.push({ id: 'da-risk', color: 'red', text: `${totalAtRisk} students at-risk university-wide — ${breakdown}` });
    }
    if (overdueAmount > 100000) {
      alerts.push({ id: 'da-finance', color: 'yellow', text: `Finance: $${Math.round(overdueAmount / 1000)}k in outstanding balances` });
    }
    const best = [...depts].sort((a, b) => b.passRate - a.passRate)[0];
    if (best) {
      alerts.push({ id: 'da-best', color: 'green', text: `${best.name} department leads with ${best.passRate}% pass rate` });
    }

    const headsSummary = depts.map((d) => {
      const st = statusFor(d.passRate);
      return {
        id: d.id,
        department: d.name,
        head: d.head,
        email: d.email,
        students: d.students,
        faculty: d.faculty,
        avgGpa: d.avgGpa,
        passRate: `${d.passRate}%`,
        atRisk: d.atRisk,
        status: st.status,
        statusColor: st.color,
      };
    });

    return reply.status(200).send({
      departmentPassRates,
      alerts,
      enrollmentCurve: DEAN_ENROLLMENT_CURVE,
      headsSummary,
    });
  });

  fastify.get('/departments', async (_request, reply) => {
    const depts = await computeDepartments();
    return reply.status(200).send(
      depts.map((d) => {
        const st = statusFor(d.passRate);
        return {
          id: d.id,
          department: d.name,
          head: d.head,
          email: d.email,
          students: d.students,
          faculty: d.faculty,
          avgGpa: d.avgGpa,
          passRate: `${d.passRate}%`,
          passRateNum: d.passRate,
          atRisk: d.atRisk,
          status: st.status,
          statusColor: st.color,
        };
      })
    );
  });

  fastify.get('/academic-overview', async (_request, reply) => {
    const depts = await computeDepartments();
    const departmentPassRates = depts.map((d) => ({
      name: d.name,
      passRate: d.passRate,
      status: d.passRate >= 80 ? 'green' : d.passRate >= 65 ? 'orange' : 'red',
    }));

    const gpaDistribution = [
      { band: 'Below 1.0', count: 184, percentage: 4 },
      { band: '1.0-2.0', count: 512, percentage: 11 },
      { band: '2.0-3.0', count: 1420, percentage: 30 },
      { band: '3.0-4.0', count: 2605, percentage: 55 },
    ];

    const atRiskBreakdown = depts.map((d) => {
      const max = Math.max(...depts.map((x) => x.atRisk), 1);
      return {
        dept: d.code,
        count: d.atRisk,
        barColor: d.atRisk >= 8 ? 'bg-red-500' : d.atRisk >= 4 ? 'bg-amber-500' : 'bg-emerald-500',
        max,
      };
    });

    const courseRows = await query<{ code: string; name: string; pass_rate: string | null }>(
      `SELECT c.code, c.name,
              ROUND(100.0 * COUNT(*) FILTER (WHERE avg >= 60) / NULLIF(COUNT(*), 0), 0)::text AS pass_rate
       FROM (
         SELECT e.course_id, e.student_id, COALESCE(SUM(CASE WHEN g.status = 'RELEASED' AND g.grade IS NOT NULL AND a.out_of IS NOT NULL
           THEN ROUND((g.grade / a.out_of) * 100) * NULLIF(REPLACE(a.weight_pct, '%', '')::int, 0) END)
           / NULLIF(SUM(CASE WHEN g.status = 'RELEASED' AND g.grade IS NOT NULL AND a.out_of IS NOT NULL
           THEN NULLIF(REPLACE(a.weight_pct, '%', '')::int, 0) END), 0), 0) AS avg
         FROM enrollments e
         LEFT JOIN assessments a ON a.course_id = e.course_id
         LEFT JOIN grades g ON g.assessment_id = a.id AND g.student_id = e.student_id
         GROUP BY e.course_id, e.student_id
       ) sub
       JOIN courses c ON c.id = sub.course_id
       GROUP BY c.code, c.name
       HAVING COUNT(*) > 0
       ORDER BY pass_rate DESC`
    );
    const courses = courseRows.map((c) => ({ code: c.code, name: c.name, passRate: Number(c.pass_rate ?? 0) }));

    return reply.status(200).send({
      departmentPassRates,
      gpaDistribution,
      atRiskBreakdown,
      topPerformingCourses: courses.slice(0, 3),
      coursesNeedingAttention: courses
        .filter((c) => c.passRate < 65)
        .slice(0, 5)
        .map((c) => ({ ...c, issue: 'Pass rate critically low' })),
      semesterComparison: [
        { semester: 'S1 2025', passRate: 74, atRisk: 34 },
        { semester: 'S2 2025', passRate: 76, atRisk: 31 },
      ],
    });
  });

  fastify.get('/university-analytics', async (_request, reply) => {
    const depts = await computeDepartments();
    const departmentsComprehensive = depts.map((d) => ({
      name: d.name,
      students: d.students,
      faculty: d.faculty,
      passRate: d.passRate,
      atRisk: d.atRisk,
      avgGpa: Number(d.avgGpa),
      trend: 'stable',
    }));

    const gpaTiers = [
      { tier: 'Distinction (3.5-4.0)', count: 890, pct: 18.5 },
      { tier: 'Very Good (3.0-3.5)', count: 1620, pct: 33.6 },
      { tier: 'Good (2.5-3.0)', count: 1310, pct: 27.2 },
      { tier: 'Pass (2.0-2.5)', count: 750, pct: 15.6 },
      { tier: 'Fail (Below 2.0)', count: 251, pct: 5.1 },
    ];

    const courseRows = await query<{ code: string; name: string; dept: string; pass_rate: string | null }>(
      `SELECT c.code, c.name, d.code AS dept,
              ROUND(100.0 * COUNT(*) FILTER (WHERE avg >= 60) / NULLIF(COUNT(*), 0), 0)::text AS pass_rate
       FROM (
         SELECT e.course_id, e.student_id, COALESCE(SUM(CASE WHEN g.status = 'RELEASED' AND g.grade IS NOT NULL AND a.out_of IS NOT NULL
           THEN ROUND((g.grade / a.out_of) * 100) * NULLIF(REPLACE(a.weight_pct, '%', '')::int, 0) END)
           / NULLIF(SUM(CASE WHEN g.status = 'RELEASED' AND g.grade IS NOT NULL AND a.out_of IS NOT NULL
           THEN NULLIF(REPLACE(a.weight_pct, '%', '')::int, 0) END), 0), 0) AS avg
         FROM enrollments e
         LEFT JOIN assessments a ON a.course_id = e.course_id
         LEFT JOIN grades g ON g.assessment_id = a.id AND g.student_id = e.student_id
         GROUP BY e.course_id, e.student_id
       ) sub
       JOIN courses c ON c.id = sub.course_id
       LEFT JOIN departments d ON d.id = c.department_id
       GROUP BY c.code, c.name, d.code
       HAVING COUNT(*) > 0
       ORDER BY pass_rate DESC`
    );
    const courses = courseRows.map((c) => ({ code: c.code, name: c.name, dept: c.dept ?? 'N/A', passRate: Number(c.pass_rate ?? 0) }));

    return reply.status(200).send({
      departmentsComprehensive,
      gpaTiers,
      topBottomCourses: {
        top: courses.slice(0, 3),
        bottom: [...courses].reverse().slice(0, 3),
      },
    });
  });

  fastify.get('/financial-overview', async (_request, reply) => {
    const outstanding = await query<{ total: string | null }>(
      `SELECT SUM(amount_cents)::text AS total FROM invoices WHERE status IN ('OVERDUE', 'PARTIAL')`
    );
    const outstandingTotal = Number(outstanding[0]?.total ?? 0) / 100;

    return reply.status(200).send({
      revenueSemesters: [
        { semester: 'S2 2025', amount: 4200, label: '$4.2M' },
        { semester: 'S1 2025', amount: 3950, label: '$3.95M' },
        { semester: 'S2 2024', amount: 3800, label: '$3.8M' },
      ],
      deptCollectionRates: [
        { dept: 'Medicine', rate: 94 },
        { dept: 'Computer Science', rate: 91 },
        { dept: 'Business', rate: 88 },
        { dept: 'Engineering', rate: 83 },
        { dept: 'Arts & Humanities', rate: 86 },
        { dept: 'Law', rate: 79 },
      ],
      scholarshipTopDepts: [
        { dept: 'CS', amount: 420, label: '$420k' },
        { dept: 'Medicine', amount: 380, label: '$380k' },
        { dept: 'Engineering', amount: 290, label: '$290k' },
      ],
      outstandingTopDepts: [
        { dept: 'Engineering', amount: 180, label: '$180k' },
        { dept: 'Law', amount: 120, label: '$120k' },
        { dept: 'Business', amount: 95, label: '$95k' },
      ],
      summary: {
        totalRevenue: '$4.2M',
        outstandingTotal: `$${Math.round(outstandingTotal / 1000)}k`,
        collectionRate: '87%',
        scholarshipsIssued: '$1.8M',
      },
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
       FROM reports WHERE report_type IN ('Academic', 'Executive', 'Finance', 'Enrollment')
       ORDER BY generated_at ASC, name ASC`
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
    const deanId = request.user!.id;
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
      [deanId]
    );

    return reply.status(200).send(
      rows.map((r, idx) => ({
        id: `conv-${idx + 1}`,
        userId: r.other_id,
        name: escapeHtml(r.other_name),
        role: escapeHtml(ROLE_LABELS[r.other_role] ?? r.other_role),
        category: CATEGORY_MAP[r.other_role] ?? 'Faculty',
        avatarUrl: undefined,
        lastMessage: escapeHtml(r.body),
        time: formatTime(r.sent_at),
        unreadCount: r.read_at === null && r.sender_id !== deanId ? 1 : 0,
        messages: [],
      }))
    );
  });

  fastify.get('/messages/:userId', async (request, reply) => {
    const deanId = request.user!.id;
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
      [deanId, userId]
    );
    await query(
      `UPDATE messages SET read_at = NOW() WHERE recipient_id = $1 AND sender_id = $2 AND read_at IS NULL`,
      [deanId, userId]
    );
    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        sender: r.sender_id === deanId ? ('dean' as const) : ('other' as const),
        text: escapeHtml(r.body),
        time: formatTime(r.sent_at),
      }))
    );
  });

  fastify.post('/messages/:userId', async (request, reply) => {
    const deanId = request.user!.id;
    const { userId } = request.params as { userId: string };
    const { body } = request.body as { body: string };
    const inserted = await query<{ id: string; sent_at: string }>(
      `INSERT INTO messages (sender_id, recipient_id, body) VALUES ($1, $2, $3) RETURNING id, sent_at`,
      [deanId, userId, body]
    );
    return reply.status(200).send({
      id: inserted[0].id,
      sender: 'dean' as const,
      text: escapeHtml(body),
      time: formatTime(inserted[0].sent_at),
    });
  });
}
