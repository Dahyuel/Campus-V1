import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth.js';
import { query, pool } from '../db/client.js';
import { logActivity } from '../db/activity.js';
import { config } from '../config.js';
import { escapeHtml } from '../lib/sanitize.js';

interface CountRow extends Record<string, unknown> { count: string }
interface NumRow extends Record<string, unknown> { value: number | null }

function fmtDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const day = date.getUTCDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function fmtToday(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const now = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();
  const yesterday = new Date(now);
  yesterday.setUTCDate(now.getUTCDate() - 1);
  if (isSameDay(date, now)) {
    const h = date.getUTCHours();
    const m = date.getUTCMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `Today, ${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return fmtDate(date);
}

function fmtMoney(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: dollars % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
}

function gradeLetter(avg: number): string {
  if (avg >= 90) return 'A';
  if (avg >= 85) return 'A-';
  if (avg >= 80) return 'B+';
  if (avg >= 75) return 'B';
  if (avg >= 70) return 'B-';
  if (avg >= 65) return 'C+';
  if (avg >= 60) return 'C';
  if (avg >= 55) return 'C-';
  if (avg >= 50) return 'D';
  return 'F';
}

function genPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*';
  const all = upper + lower + digits + symbols;
  const out: string[] = [];
  out.push(upper[Math.floor(Math.random() * upper.length)]);
  out.push(lower[Math.floor(Math.random() * lower.length)]);
  out.push(digits[Math.floor(Math.random() * digits.length)]);
  out.push(symbols[Math.floor(Math.random() * symbols.length)]);
  for (let i = 4; i < 16; i++) out.push(all[Math.floor(Math.random() * all.length)]);
  // Fisher-Yates shuffle
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join('');
}

async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(request, reply);
  if (reply.sent) return;
  if (request.user?.roleType !== 'admin') {
    return reply.status(403).send({ error: 'Forbidden' });
  }
}

const uuidSchema = z.string().uuid();

const studentCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(255).optional(),
  program: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
});

const studentUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(50).optional(),
  program: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
});

const facultyCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(255).optional(),
  department: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
});

const leaveStatusSchema = z.enum(['pending', 'approved', 'rejected']);

const enrollmentSchema = z.object({
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
});

async function createStudentUser(
  name: string,
  emailInput: string | undefined,
  program: string,
  department: string
): Promise<{ id: string; tempPassword: string; email: string; codeId: string }> {
  const tempPassword = genPassword();
  const passwordHash = await bcrypt.hash(tempPassword, config.bcryptRounds);
  const email = emailInput ?? `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@nilebyte.edu`;
  const username = email.split('@')[0];
  const codeId = `STU-${randomUUID().replace(/-/g, '').slice(0, 12)}`;
  const res = await pool.query<{ id: string }>(
    `INSERT INTO users (name, email, username, password_hash, role_type, code_id, avatar_url, message_badge)
     VALUES ($1, $2, $3, $4, 'student', $5, '', 0)
     RETURNING id`,
    [name, email, username, passwordHash, codeId]
  );
  return { id: res.rows[0].id, tempPassword, email, codeId };
}

export default async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireAdmin);

  fastify.get('/dashboard', async (_request, reply) => {
    const pendingRegs = await query<CountRow>(`SELECT COUNT(*)::text AS count FROM registrations WHERE status = 'PENDING'`);
    const overdueInv = await query<CountRow>(`SELECT COUNT(*)::text AS count FROM invoices WHERE status = 'OVERDUE'`);
    const attendanceAvg = await query<NumRow>(`SELECT COALESCE(AVG(attendance_pct), 0) AS value FROM enrollments`);
    const pendingConflicts = await query<CountRow>(`SELECT COUNT(*)::text AS count FROM exam_conflicts WHERE resolved = false`);
    const atRisk = await query<CountRow>(`SELECT COUNT(*)::text AS count FROM at_risk_flags WHERE resolved = false`);
    const pendingExams = await query<CountRow>(`SELECT COUNT(*)::text AS count FROM exam_schedule WHERE status = 'PENDING'`);

    const nPendingRegs = Number(pendingRegs[0].count);
    const nOverdue = Number(overdueInv[0].count);
    const nConflicts = Number(pendingConflicts[0].count);
    const nAtRisk = Number(atRisk[0].count);
    const nPendingExams = Number(pendingExams[0].count);
    const avgAttendance = Number(attendanceAvg[0].value ?? 0);

    const healthIndicators = [
      { label: 'Enrollment', status: nPendingRegs === 0 ? 'Healthy' : 'Warning', icon: nPendingRegs === 0 ? 'check' : 'alert', color: nPendingRegs === 0 ? 'emerald' : 'amber' },
      { label: 'Finance', status: nOverdue === 0 ? 'Healthy' : 'Warning', icon: nOverdue === 0 ? 'check' : 'alert', color: nOverdue === 0 ? 'emerald' : 'amber' },
      { label: 'Attendance', status: avgAttendance > 80 ? 'Healthy' : 'Warning', icon: avgAttendance > 80 ? 'check' : 'alert', color: avgAttendance > 80 ? 'emerald' : 'amber' },
      { label: 'Exams', status: nConflicts > 0 ? 'Warning' : 'Healthy', icon: nConflicts > 0 ? 'alert' : 'check', color: nConflicts > 0 ? 'amber' : 'emerald' },
      { label: 'At-Risk Students', status: nAtRisk > 20 ? 'Critical' : nAtRisk > 0 ? 'Warning' : 'Healthy', icon: nAtRisk > 0 ? 'danger' : 'check', color: nAtRisk > 20 ? 'rose' : nAtRisk > 0 ? 'amber' : 'emerald' },
    ];

    const enrollmentChart = [
      { semester: 'S1 2023', count: 3950 },
      { semester: 'S2 2023', count: 4100 },
      { semester: 'S1 2024', count: 4250 },
      { semester: 'S2 2024', count: 4400 },
      { semester: 'S1 2025', count: 4520 },
      { semester: 'S2 2025', count: 4680 },
      { semester: 'S1 2026', count: 4750 },
      { semester: 'S2 2026', count: 4821, active: true },
    ];

    const pendingActions: { id: string; priority: string; text: string }[] = [];
    if (nAtRisk > 0) pendingActions.push({ id: 'ap-1', priority: 'red', text: `${nAtRisk} students at-risk — advisors not yet assigned` });
    if (nOverdue > 0) pendingActions.push({ id: 'ap-2', priority: 'amber', text: `${nOverdue} students with overdue fee balances` });
    if (nPendingExams > 0) pendingActions.push({ id: 'ap-3', priority: 'amber', text: `Exam schedule for ${nPendingExams} courses not yet confirmed` });
    if (nPendingRegs > 0) pendingActions.push({ id: 'ap-4', priority: 'blue', text: `${nPendingRegs} new student registrations pending approval` });
    pendingActions.push({ id: 'ap-5', priority: 'blue', text: 'Semester 2 academic report ready to export' });

    const regRows = await query<{ id: string; name: string; program: string; status: string; created_at: string }>(
      `SELECT id, name, program, status, created_at FROM registrations ORDER BY created_at DESC LIMIT 5`
    );
    const registrations = regRows.map((r) => ({
      id: r.id,
      name: escapeHtml(r.name),
      program: escapeHtml(r.program),
      date: fmtToday(r.created_at),
      status: r.status,
    }));

    const logRows = await query<{ id: string; action: string; name: string | null; created_at: string }>(
      `SELECT a.id, a.action, u.name, a.created_at FROM activity_log a
       LEFT JOIN users u ON u.id = a.user_id
       ORDER BY a.created_at DESC LIMIT 5`
    );
    const activityLogs = logRows.map((l) => ({
      id: l.id,
      action: escapeHtml(l.action),
      user: escapeHtml(l.name ?? 'System'),
      time: fmtToday(l.created_at),
    }));

    return reply.status(200).send({ healthIndicators, enrollmentChart, pendingActions, registrations, activityLogs });
  });

  fastify.get('/students', async (_request, reply) => {
    const rows = await query<{
      id: string; name: string; code_id: string; email: string;
      program: string | null; department: string | null; phone: string | null;
      gpa: number | null; attendance: number | null;
    }>(
      `SELECT u.id, u.name, u.code_id, u.email,
              d.name AS program, d.name AS department, NULL AS phone,
              NULL::numeric AS gpa, AVG(e.attendance_pct) AS attendance
       FROM users u
       LEFT JOIN enrollments e ON e.student_id = u.id
       LEFT JOIN courses c ON c.id = e.course_id
       LEFT JOIN departments d ON d.id = c.department_id
       WHERE u.role_type = 'student' AND u.is_active = true
       GROUP BY u.id, u.name, u.code_id, u.email, d.name
       ORDER BY u.name`
    );

    const flagRows = await query<{ student_id: string; signal: string; risk_level: string }>(
      `SELECT student_id, signal, risk_level FROM at_risk_flags WHERE resolved = false`
    );
    const flagsByStudent = new Map<string, { signal: string; risk_level: string }[]>();
    for (const f of flagRows) {
      const list = flagsByStudent.get(f.student_id) ?? [];
      list.push({ signal: f.signal, risk_level: f.risk_level });
      flagsByStudent.set(f.student_id, list);
    }

    const invRows = await query<{ student_id: string; status: string; amount_cents: number; invoice_no: string }>(
      `SELECT student_id, status, amount_cents, invoice_no FROM invoices`
    );
    const invByStudent = new Map<string, { status: string; amount_cents: number; invoice_no: string }[]>();
    for (const inv of invRows) {
      if (!inv.student_id) continue;
      const list = invByStudent.get(inv.student_id) ?? [];
      list.push(inv);
      invByStudent.set(inv.student_id, list);
    }

    const enrolledRows = await query<{ student_id: string; code: string; name: string; credits: number; current_average: number | null }>(
      `SELECT e.student_id, c.code, c.name, c.credits, NULL::numeric AS current_average
       FROM enrollments e JOIN courses c ON c.id = e.course_id
       WHERE e.status != 'DROPPED'`
    );
    const coursesByStudent = new Map<string, { code: string; name: string; credits: number; grade: string }[]>();
    for (const e of enrolledRows) {
      const list = coursesByStudent.get(e.student_id) ?? [];
      list.push({ code: e.code, name: e.name, credits: e.credits, grade: gradeLetter(e.current_average ?? 0) });
      coursesByStudent.set(e.student_id, list);
    }

    const students = rows.map((s) => {
      const flags = flagsByStudent.get(s.id) ?? [];
      const invs = invByStudent.get(s.id) ?? [];
      const attendancePct = s.attendance ?? 0;
      const hasOverdue = invs.some((i) => i.status === 'OVERDUE');
      const hasPartial = invs.some((i) => i.status === 'PARTIAL');
      const allPaid = invs.length > 0 && invs.every((i) => i.status === 'PAID');
      const unpaid = invs.filter((i) => i.status !== 'PAID').reduce((sum, i) => sum + i.amount_cents, 0);

      let standing: 'Good Standing' | 'At Risk' | 'Warning' | 'Probation' = 'Good Standing';
      if (flags.some((f) => f.risk_level === 'Critical') || attendancePct < 75) standing = 'At Risk';
      else if (flags.some((f) => f.risk_level === 'Moderate')) standing = 'Warning';

      const riskFlags = flags.map((f) => f.signal);
      for (const i of invs) if (i.status === 'OVERDUE') riskFlags.push(`Overdue invoice ${i.invoice_no}`);

      return {
        id: s.id,
        name: escapeHtml(s.name),
        studentId: s.code_id,
        program: escapeHtml(s.program ?? 'Computer Science'),
        department: escapeHtml(s.department ?? 'CS Dept'),
        gpa: Number(((s.gpa ?? 0) / 25).toFixed(1)),
        attendance: `${Math.round(attendancePct)}%`,
        standing,
        email: escapeHtml(s.email),
        phone: escapeHtml(s.phone ?? '+20 100 000 0000'),
        feeStatus: allPaid ? 'Paid in Full' : hasOverdue ? 'Outstanding Balance' : hasPartial ? 'Partial' : 'Paid in Full',
        balance: `$${(unpaid / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        riskFlags: riskFlags.map(escapeHtml),
        enrolledCourses: (coursesByStudent.get(s.id) ?? []).map((c) => ({
          ...c,
          code: escapeHtml(c.code),
          name: escapeHtml(c.name),
        })),
      };
    });

    return reply.status(200).send(students);
  });

  fastify.post('/students', async (request, reply) => {
    const body = studentCreateSchema.parse(request.body);
    const created = await createStudentUser(body.name, body.email, body.program ?? 'Computer Science', body.department ?? 'CS Dept');
    await logActivity(request.user.id, 'New user created', { studentId: created.id, codeId: created.codeId });
    try {
      await fastify.amqp.publish('admin.user.created', { name: body.name, adminId: request.user.id });
    } catch (err) {
      fastify.log.error({ err }, 'failed to publish user.created');
    }
    return reply.status(200).send({
      id: created.id,
      name: body.name,
      studentId: created.codeId,
      program: body.program ?? 'Computer Science',
      department: body.department ?? 'CS Dept',
      email: created.email,
      phone: body.phone ?? '+20 100 000 0000',
      tempPassword: created.tempPassword,
    });
  });

  fastify.patch('/students/:studentId', async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    uuidSchema.parse(studentId);
    const body = studentUpdateSchema.parse(request.body);

    const target = await pool.query<{ role_type: string }>(
      `SELECT role_type FROM users WHERE id = $1 LIMIT 1`,
      [studentId]
    );
    if (target.rows[0]?.role_type !== 'student') {
      return reply.status(400).send({ error: 'Target user is not a student' });
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    if (body.name) { fields.push(`name = $${fields.length + 1}`); values.push(body.name); }
    if (body.email) { fields.push(`email = $${fields.length + 1}`); values.push(body.email); }
    if (fields.length === 0) return reply.status(400).send({ error: 'No fields to update' });
    values.push(studentId);
    await pool.query(`UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length}`, values);
    return reply.status(200).send({ ok: true });
  });

  fastify.patch('/students/:studentId/deactivate', async (request, reply) => {
    const { studentId } = request.params as { studentId: string };
    uuidSchema.parse(studentId);

    const target = await pool.query<{ role_type: string }>(
      `SELECT role_type FROM users WHERE id = $1 LIMIT 1`,
      [studentId]
    );
    if (target.rows[0]?.role_type !== 'student') {
      return reply.status(400).send({ error: 'Target user is not a student' });
    }

    await pool.query(`UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1`, [studentId]);
    await logActivity(request.user.id, 'Student account deactivated', { studentId });
    return reply.status(200).send({ ok: true });
  });

  fastify.get('/faculty', async (_request, reply) => {
    const rows = await query<{ id: string; name: string; code_id: string; email: string; department: string | null; is_active: boolean }>(
      `SELECT u.id, u.name, u.code_id, u.email, d.name AS department, u.is_active
       FROM users u
       LEFT JOIN departments d ON d.head_id = u.id
       WHERE u.role_type = 'faculty'
       ORDER BY u.name`
    );

    const assignRows = await query<{ faculty_id: string; code: string; name: string }>(
      `SELECT fca.faculty_id, c.code, c.name
       FROM faculty_course_assignments fca JOIN courses c ON c.id = fca.course_id`
    );
    const coursesByFaculty = new Map<string, { code: string; name: string }[]>();
    for (const a of assignRows) {
      const list = coursesByFaculty.get(a.faculty_id) ?? [];
      if (!list.some((x) => x.code === a.code)) list.push({ code: a.code, name: a.name });
      coursesByFaculty.set(a.faculty_id, list);
    }

    const enrollRows = await query<{ faculty_id: string; count: string }>(
      `SELECT fca.faculty_id, COUNT(e.id)::text AS count
       FROM faculty_course_assignments fca
       LEFT JOIN enrollments e ON e.course_id = fca.course_id AND e.status != 'DROPPED'
       GROUP BY fca.faculty_id`
    );
    const studentsByFaculty = new Map<string, number>();
    for (const e of enrollRows) studentsByFaculty.set(e.faculty_id, Number(e.count));

    const faculty = rows.map((f) => {
      const courses = coursesByFaculty.get(f.id) ?? [];
      return {
        id: f.id,
        name: escapeHtml(f.name),
        codeId: f.code_id,
        department: escapeHtml(f.department ?? 'CS Dept'),
        title: f.name.startsWith('Dr.') ? 'Ass. Professor' : 'Lecturer',
        coursesCount: courses.length,
        studentsCount: studentsByFaculty.get(f.id) ?? 0,
        loadHours: courses.length * 3,
        status: f.is_active ? 'ACTIVE' : 'ON LEAVE',
        email: escapeHtml(f.email),
        phone: '+20 102 345 6789',
        assignedCourses: courses.map((c) => escapeHtml(`${c.code} ${c.name}`)),
        leaveHistory: 'No leave on record',
        payrollSummary: 'Standard band',
        performanceRating: 4.8,
      };
    });

    return reply.status(200).send(faculty);
  });

  fastify.post('/faculty', async (request, reply) => {
    const body = facultyCreateSchema.parse(request.body);
    const tempPassword = genPassword();
    const passwordHash = await bcrypt.hash(tempPassword, config.bcryptRounds);
    const email = body.email ?? `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@nilebyte.edu`;
    const username = email.split('@')[0];
    const codeId = `FAC-${randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const res = await pool.query<{ id: string }>(
      `INSERT INTO users (name, email, username, password_hash, role_type, code_id, avatar_url, message_badge)
       VALUES ($1, $2, $3, $4, 'faculty', $5, '', 0) RETURNING id`,
      [body.name, email, username, passwordHash, codeId]
    );
    await logActivity(request.user.id, 'New faculty created', { facultyId: res.rows[0].id, codeId });
    return reply.status(200).send({
      id: res.rows[0].id,
      name: body.name,
      codeId,
      department: body.department ?? 'CS Dept',
      title: body.title ?? 'Lecturer',
      email,
      phone: body.phone ?? '+20 100 000 0001',
      tempPassword,
    });
  });

  fastify.get('/staff', async (_request, reply) => {
    const rows = await query<{ id: string; name: string; code_id: string; email: string; department: string | null; role_label: string | null; shift: string | null; is_active: boolean }>(
      `SELECT u.id, u.name, u.code_id, u.email, s.department, s.role_label, s.shift, u.is_active
       FROM staff s JOIN users u ON u.id = s.user_id
       ORDER BY u.name`
    );
    return reply.status(200).send(rows.map((s) => ({
      id: s.id,
      name: escapeHtml(s.name),
      codeId: s.code_id,
      department: escapeHtml(s.department ?? ''),
      role: escapeHtml(s.role_label ?? ''),
      shift: escapeHtml(s.shift ?? ''),
      status: s.is_active ? 'ACTIVE' : 'ON LEAVE',
      email: escapeHtml(s.email),
      phone: '+20 100 111 2222',
    })));
  });

  fastify.get('/leave-requests', async (_request, reply) => {
    const rows = await query<{ id: string; name: string; department: string | null; leave_type: string; from_date: string; to_date: string; status: string }>(
      `SELECT lr.id, u.name, lr.department, lr.leave_type, lr.from_date, lr.to_date, lr.status
       FROM leave_requests lr JOIN users u ON u.id = lr.user_id
       ORDER BY lr.created_at DESC`
    );
    return reply.status(200).send(rows.map((l) => ({
      id: l.id,
      name: escapeHtml(l.name),
      department: escapeHtml(l.department ?? ''),
      leaveType: escapeHtml(l.leave_type),
      from: fmtDate(l.from_date),
      to: fmtDate(l.to_date),
      status: l.status,
    })));
  });

  fastify.patch('/leave-requests/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: unknown };
    const parsedStatus = leaveStatusSchema.parse(status);

    const existing = await pool.query<{ id: string }>(
      `SELECT id FROM leave_requests WHERE id = $1 LIMIT 1`,
      [id]
    );
    if (!existing.rows[0]) {
      return reply.status(404).send({ error: 'Leave request not found' });
    }

    await pool.query(`UPDATE leave_requests SET status = $1 WHERE id = $2`, [parsedStatus, id]);
    return reply.status(200).send({ ok: true, status: parsedStatus });
  });

  fastify.get('/enrollment', async (_request, reply) => {
    const courseRows = await query<{ id: string; name: string; code: string; department: string | null; faculty: string | null; credits: number; capacity: number | null; enrolled: string }>(
      `SELECT c.id, c.name, c.code, d.name AS department, u.name AS faculty, c.credits, c.capacity,
              (SELECT COUNT(*)::text FROM enrollments e WHERE e.course_id = c.id AND e.status != 'DROPPED') AS enrolled
       FROM courses c
       LEFT JOIN departments d ON d.id = c.department_id
       LEFT JOIN users u ON u.id = c.faculty_id
       WHERE c.is_active = true
       ORDER BY c.code`
    );

    const rosterRows = await query<{ course_id: string; id: string; name: string; code_id: string; enrolled_at: string | null }>(
      `SELECT e.course_id, u.id, u.name, u.code_id, e.enrolled_at
       FROM enrollments e JOIN users u ON u.id = e.student_id
       WHERE e.status != 'DROPPED'`
    );
    const rosterByCourse = new Map<string, { id: string; name: string; studentId: string; date: string }[]>();
    for (const r of rosterRows) {
      const list = rosterByCourse.get(r.course_id) ?? [];
      list.push({ id: r.id, name: r.name, studentId: r.code_id, date: r.enrolled_at ? fmtDate(r.enrolled_at) : '—' });
      rosterByCourse.set(r.course_id, list);
    }

    const waitlistRows = await query<{ course_id: string; id: string; name: string; code_id: string; enrolled_at: string | null }>(
      `SELECT e.course_id, u.id, u.name, u.code_id, e.enrolled_at
       FROM enrollments e JOIN users u ON u.id = e.student_id
       WHERE e.status = 'WAITLISTED'
       ORDER BY e.enrolled_at DESC`
    );
    const waitlistByCourse = new Map<string, { id: string; name: string; studentId: string; position: number }[]>();
    for (const w of waitlistRows) {
      const list = waitlistByCourse.get(w.course_id) ?? [];
      list.push({ id: w.id, name: w.name, studentId: w.code_id, position: list.length + 1 });
      waitlistByCourse.set(w.course_id, list);
    }

    const courses = courseRows.map((c) => {
      const enrolled = Number(c.enrolled);
      const capacity = c.capacity ?? 70;
      return {
        id: c.id,
        name: escapeHtml(c.name),
        code: escapeHtml(c.code),
        department: escapeHtml(c.department ?? 'CS Dept'),
        faculty: escapeHtml(c.faculty ?? 'Unassigned'),
        enrolled,
        capacity,
        waitlisted: (waitlistByCourse.get(c.id) ?? []).length,
        status: enrolled >= capacity ? 'FULL' : 'OPEN',
        roster: (rosterByCourse.get(c.id) ?? []).map((s) => ({
          ...s,
          name: escapeHtml(s.name),
        })),
        waitlistStudents: (waitlistByCourse.get(c.id) ?? []).map((s) => ({
          ...s,
          name: escapeHtml(s.name),
        })),
      };
    });

    return reply.status(200).send(courses);
  });

  fastify.post('/enrollment', async (request, reply) => {
    const body = enrollmentSchema.parse(request.body);
    const { studentId, courseId } = body;

    const studentCheck = await pool.query<{ role_type: string }>(
      `SELECT role_type FROM users WHERE id = $1 LIMIT 1`,
      [studentId]
    );
    if (studentCheck.rows[0]?.role_type !== 'student') {
      return reply.status(400).send({ error: 'Target user is not a student' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const cap = await client.query<{ capacity: number | null; enrolled: string }>(
        `SELECT c.capacity, (SELECT COUNT(*)::text FROM enrollments e WHERE e.course_id = c.id AND e.status != 'DROPPED') AS enrolled
         FROM courses c WHERE c.id = $1
         FOR UPDATE`,
        [courseId]
      );
      if (!cap.rows[0]) {
        await client.query('ROLLBACK');
        return reply.status(404).send({ error: 'Course not found' });
      }
      if (Number(cap.rows[0].enrolled) >= (cap.rows[0].capacity ?? 70)) {
        await client.query('ROLLBACK');
        return reply.status(409).send({ error: 'Course is full' });
      }
      const res = await client.query<{ id: string }>(
        `INSERT INTO enrollments (student_id, course_id, status, attendance_pct)
         VALUES ($1, $2, 'IN PROGRESS', 0) RETURNING id`,
        [studentId, courseId]
      );
      await client.query('COMMIT');
      return reply.status(200).send({ id: res.rows[0].id, studentId, courseId });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  });

  fastify.delete('/enrollment/:enrollmentId', async (request, reply) => {
    const { enrollmentId } = request.params as { enrollmentId: string };
    await pool.query(`UPDATE enrollments SET status = 'DROPPED' WHERE id = $1`, [enrollmentId]);
    return reply.status(200).send({ ok: true });
  });

  fastify.get('/finance', async (_request, reply) => {
    const rows = await query<{ id: string; name: string | null; code_id: string | null; invoice_no: string; type: string; amount_cents: number; due_date: string; paid_date: string | null; status: string; reminder_sent: boolean }>(
      `SELECT i.id, u.name, u.code_id, i.invoice_no, i.type, i.amount_cents, i.due_date, i.paid_date, i.status, i.reminder_sent
       FROM invoices i LEFT JOIN users u ON u.id = i.student_id
       ORDER BY i.created_at DESC`
    );

    const transactions = rows.map((t) => ({
      id: t.id,
      name: escapeHtml(t.name ?? 'Unknown'),
      studentId: escapeHtml(t.code_id ?? '—'),
      invoiceNo: escapeHtml(t.invoice_no),
      type: escapeHtml(t.type),
      amount: fmtMoney(t.amount_cents),
      dueDate: fmtDate(t.due_date),
      paidDate: t.paid_date ? fmtDate(t.paid_date) : '—',
      status: t.status,
      reminderSent: t.reminder_sent,
    }));

    const monthlyCollections = [
      { month: 'Feb', amount: 180, label: '$180k' },
      { month: 'Mar', amount: 210, label: '$210k' },
      { month: 'Apr', amount: 195, label: '$195k' },
      { month: 'May', amount: 240, label: '$240k' },
      { month: 'Jun', amount: 265, label: '$265k' },
      { month: 'Jul', amount: 290, label: '$290k' },
    ];

    const totalRevenue = rows.filter((r) => r.status === 'PAID').reduce((s, r) => s + r.amount_cents, 0);
    const overdueAmount = rows.filter((r) => r.status === 'OVERDUE').reduce((s, r) => s + r.amount_cents, 0);
    const paidCount = rows.filter((r) => r.status === 'PAID').length;
    const overdueCount = rows.filter((r) => r.status === 'OVERDUE').length;

    return reply.status(200).send({
      transactions,
      monthlyCollections,
      summary: {
        totalRevenue: fmtMoney(totalRevenue),
        overdueAmount: fmtMoney(overdueAmount),
        paidCount,
        overdueCount,
      },
    });
  });

  fastify.post('/finance/reminder/:invoiceId', async (request, reply) => {
    const { invoiceId } = request.params as { invoiceId: string };
    await pool.query(`UPDATE invoices SET reminder_sent = true WHERE id = $1`, [invoiceId]);
    await logActivity(request.user.id, 'Invoice reminder sent', { invoiceId });
    return reply.status(200).send({ ok: true });
  });

  fastify.post('/finance/reminder/bulk', async (request, reply) => {
    const res = await pool.query(`UPDATE invoices SET reminder_sent = true WHERE status = 'OVERDUE' AND reminder_sent = false`);
    await logActivity(request.user.id, 'Invoice batch sent', { count: res.rowCount });
    return reply.status(200).send({ sent: res.rowCount ?? 0 });
  });

  fastify.post('/finance/invoice', async (request, reply) => {
    const body = request.body as { studentId: string; type: string; amountCents: number; dueDate: string };
    const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
    const res = await pool.query<{ id: string }>(
      `INSERT INTO invoices (student_id, invoice_no, type, amount_cents, due_date, status)
       VALUES ($1, $2, $3, $4, $5, 'OVERDUE') RETURNING id`,
      [body.studentId, invoiceNo, body.type, body.amountCents, body.dueDate]
    );
    return reply.status(200).send({
      id: res.rows[0].id,
      invoiceNo,
      type: body.type,
      amount: fmtMoney(body.amountCents),
      dueDate: fmtDate(body.dueDate),
      status: 'OVERDUE',
    });
  });

  fastify.get('/exams', async (_request, reply) => {
    const rows = await query<{ id: string; course: string | null; code: string | null; exam_date: string; time_slot: string; room: string | null; invigilator: string | null; status: string; students: string }>(
      `SELECT es.id, c.name AS course, c.code, es.exam_date, es.time_slot, r.name AS room, u.name AS invigilator, es.status,
              (SELECT COUNT(*)::text FROM enrollments e WHERE e.course_id = es.course_id AND e.status != 'DROPPED') AS students
       FROM exam_schedule es
       LEFT JOIN courses c ON c.id = es.course_id
       LEFT JOIN exam_rooms r ON r.id = es.room_id
       LEFT JOIN users u ON u.id = es.invigilator_id
       ORDER BY es.exam_date, es.time_slot`
    );

    const exams = rows.map((e) => ({
      id: e.id,
      course: escapeHtml(e.course ?? 'Unknown'),
      code: escapeHtml(e.code ?? '—'),
      date: fmtDate(e.exam_date),
      time: escapeHtml(e.time_slot),
      room: escapeHtml(e.room ?? 'Unassigned'),
      invigilator: escapeHtml(e.invigilator ?? 'Unassigned'),
      students: Number(e.students),
      status: e.status,
    }));

    const conflictRows = await query<{ id: string; conflict_type: string; description: string; resolved: boolean }>(
      `SELECT id, conflict_type, description, resolved FROM exam_conflicts WHERE resolved = false ORDER BY detected_at DESC`
    );
    const conflicts = conflictRows.map((c) => ({ id: c.id, type: escapeHtml(c.conflict_type), text: escapeHtml(c.description), resolved: c.resolved }));

    const roomRows = await query<{ id: string; name: string; capacity: number }>(`SELECT id, name, capacity FROM exam_rooms ORDER BY name`);
    const days = ['mon', 'tue', 'wed', 'thu', 'fri'];
    const bookings = await query<{ room_id: string; exam_date: string }>(`SELECT room_id, exam_date FROM exam_schedule`);
    const bookedSet = new Set(bookings.map((b) => `${b.room_id}|${new Date(b.exam_date).getUTCDay()}`));
    const roomSchedule = roomRows.map((r) => {
      const row: Record<string, string | number> = { room: escapeHtml(r.name), capacity: r.capacity };
      days.forEach((d, i) => {
        const jsDay = i === 6 ? 0 : i + 1;
        row[d] = bookedSet.has(`${r.id}|${jsDay}`) ? 'BOOKED' : 'FREE';
      });
      return row;
    });

    return reply.status(200).send({ exams, conflicts, roomSchedule });
  });

  fastify.post('/exams', async (request, reply) => {
    const body = request.body as { courseId: string; roomId: string; invigilatorId: string; examDate: string; timeSlot: string };
    const existing = await query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM exam_schedule WHERE room_id = $1 AND exam_date = $2 AND time_slot = $3`,
      [body.roomId, body.examDate, body.timeSlot]
    );
    if (Number(existing[0].count) > 0) {
      await pool.query(
        `INSERT INTO exam_conflicts (conflict_type, description, resolved) VALUES ('critical', $1, false)`,
        [`Room double-booked on ${fmtDate(body.examDate)} at ${body.timeSlot}`]
      );
    }
    const res = await pool.query<{ id: string }>(
      `INSERT INTO exam_schedule (course_id, room_id, invigilator_id, exam_date, time_slot, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING') RETURNING id`,
      [body.courseId, body.roomId, body.invigilatorId, body.examDate, body.timeSlot]
    );
    await logActivity(request.user.id, 'Exam published', { examId: res.rows[0].id });
    return reply.status(200).send({ id: res.rows[0].id, status: 'PENDING' });
  });

  fastify.patch('/exams/conflicts/:conflictId/resolve', async (request, reply) => {
    const { conflictId } = request.params as { conflictId: string };
    await pool.query(`UPDATE exam_conflicts SET resolved = true WHERE id = $1`, [conflictId]);
    return reply.status(200).send({ ok: true });
  });

  fastify.patch('/exams/:examId', async (request, reply) => {
    const { examId } = request.params as { examId: string };
    const body = request.body as { examDate?: string; timeSlot?: string; roomId?: string; status?: string };
    const fields: string[] = [];
    const values: unknown[] = [];
    if (body.examDate) { fields.push(`exam_date = $${fields.length + 1}`); values.push(body.examDate); }
    if (body.timeSlot) { fields.push(`time_slot = $${fields.length + 1}`); values.push(body.timeSlot); }
    if (body.roomId) { fields.push(`room_id = $${fields.length + 1}`); values.push(body.roomId); }
    if (body.status) { fields.push(`status = $${fields.length + 1}`); values.push(body.status); }
    if (fields.length === 0) return reply.status(400).send({ error: 'No fields to update' });
    values.push(examId);
    await pool.query(`UPDATE exam_schedule SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
    return reply.status(200).send({ ok: true });
  });

  fastify.get('/analytics', async (_request, reply) => {
    const enrollmentTrend = [
      { term: 'F20', count: 3950, label: '3,950' },
      { term: 'S21', count: 4100, label: '4,100' },
      { term: 'F21', count: 4250, label: '4,250' },
      { term: 'S22', count: 4400, label: '4,400' },
      { term: 'F22', count: 4520, label: '4,520' },
      { term: 'S23', count: 4680, label: '4,680' },
      { term: 'F23', count: 4750, label: '4,750' },
      { term: 'S24', count: 4821, label: '4,821' },
    ];
    const gpaRanges = [
      { range: '0–1.0', count: 120, pct: 2.5 },
      { range: '1.0–2.0', count: 480, pct: 10.0 },
      { range: '2.0–3.0', count: 1680, pct: 34.8 },
      { range: '3.0–4.0', count: 2541, pct: 52.7 },
    ];
    const attendanceDepts = [
      { dept: 'CS Dept', rate: 86 },
      { dept: 'Engineering', rate: 82 },
      { dept: 'Business', rate: 79 },
      { dept: 'Medicine', rate: 88 },
      { dept: 'Law', rate: 81 },
    ];
    const passFailDepts = [
      { dept: 'CS Dept', rate: 89 },
      { dept: 'Engineering', rate: 84 },
      { dept: 'Business', rate: 91 },
      { dept: 'Medicine', rate: 94 },
      { dept: 'Law', rate: 87 },
    ];
    return reply.status(200).send({ enrollmentTrend, gpaRanges, attendanceDepts, passFailDepts });
  });

  fastify.get('/reports', async (_request, reply) => {
    const rows = await query<{ id: string; name: string; report_type: string; generated_at: string; generated_by: string; is_ai: boolean; format: string; summary: string | null }>(
      `SELECT id, name, report_type, generated_at, generated_by, is_ai, format, summary
       FROM reports ORDER BY generated_at ASC, name ASC`
    );
    return reply.status(200).send(rows.map((r) => ({
      id: r.id,
      name: escapeHtml(r.name),
      type: escapeHtml(r.report_type),
      generatedDate: fmtDate(r.generated_at),
      generatedBy: escapeHtml(r.generated_by),
      isAi: r.is_ai,
      format: escapeHtml(r.format),
      summary: escapeHtml(r.summary ?? ''),
    })));
  });

  fastify.post('/reports/generate', async (request, reply) => {
    const body = request.body as { name: string; type: string; format: string };
    const admin = await query<{ name: string }>(`SELECT name FROM users WHERE id = $1`, [request.user.id]);
    const generatedBy = admin[0]?.name ?? 'Admin';
    const res = await pool.query<{ id: string }>(
      `INSERT INTO reports (name, report_type, format, generated_by, is_ai, summary)
       VALUES ($1, $2, $3, $4, false, $5) RETURNING id`,
      [body.name, body.type, body.format, generatedBy, `Generated report: ${body.name}`]
    );
    return reply.status(200).send({
      id: res.rows[0].id,
      name: body.name,
      type: body.type,
      format: body.format,
      generatedBy,
      isAi: false,
    });
  });

  fastify.patch('/registrations/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: string };
    const reg = await query<{ name: string; program: string }>(`SELECT name, program FROM registrations WHERE id = $1`, [id]);
    if (!reg[0]) return reply.status(404).send({ error: 'Registration not found' });
    await pool.query(`UPDATE registrations SET status = $1 WHERE id = $2`, [status, id]);
    if (status === 'APPROVED') {
      await createStudentUser(reg[0].name, undefined, reg[0].program, 'CS Dept');
      await logActivity(request.user.id, 'Registration approved', { registrationId: id });
    } else {
      await logActivity(request.user.id, 'Registration rejected', { registrationId: id });
    }
    return reply.status(200).send({ id, status });
  });
}