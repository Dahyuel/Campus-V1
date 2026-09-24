import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import amqp, { Channel, ChannelModel } from 'amqplib';
import { query } from '../db/client.js';

const EXCHANGE = 'campus.events';

export interface AmqpClient {
  channel: Channel;
  publish: (routingKey: string, payload: Record<string, unknown>) => Promise<void>;
}

interface GradeReleasedPayload {
  courseId: string;
  courseName: string;
  assessmentTitle: string;
  departmentId: string | null;
  studentGrades: Array<{ studentId: string }>;
}

interface AttendanceClosedPayload {
  sessionId: string;
  courseId: string;
  courseName: string;
  departmentId: string | null;
  date: string;
  absentStudentIds: string[];
}

interface UserCreatedPayload {
  name: string;
  adminId: string;
}

interface BroadcastSentPayload {
  channelType: string;
  body: string;
  senderName: string;
  senderId: string;
}

async function refreshDeptStats(deptId: string | null): Promise<void> {
  if (!deptId) return;

  const atRiskRows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM at_risk_flags arf
     JOIN courses c ON c.id = arf.course_id
     WHERE c.department_id = $1 AND arf.resolved = false`,
    [deptId]
  );
  const atRiskCount = Number(atRiskRows[0]?.count ?? 0);

  const passRows = await query<{ pass_rate: string | null }>(
    `WITH avgs AS (
       SELECT e.student_id, e.course_id,
              COALESCE(SUM(CASE WHEN g.status = 'RELEASED' AND g.grade IS NOT NULL AND a.out_of IS NOT NULL
                 THEN ROUND((g.grade / a.out_of) * 100) * NULLIF(REPLACE(a.weight_pct, '%', '')::int, 0) END)
                 / NULLIF(SUM(CASE WHEN g.status = 'RELEASED' AND g.grade IS NOT NULL AND a.out_of IS NOT NULL
                 THEN NULLIF(REPLACE(a.weight_pct, '%', '')::int, 0) END), 0), 0) AS avg
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN assessments a ON a.course_id = e.course_id
       LEFT JOIN grades g ON g.assessment_id = a.id AND g.student_id = e.student_id
       WHERE c.department_id = $1
       GROUP BY e.student_id, e.course_id
     )
     SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE avg >= 60) / NULLIF(COUNT(*), 0), 2)::text AS pass_rate
     FROM avgs`,
    [deptId]
  );
  const passRate = Number(passRows[0]?.pass_rate ?? 0);

  const attRows = await query<{ avg_attendance: string | null }>(
    `SELECT ROUND(AVG(e.attendance_pct), 2)::text AS avg_attendance
     FROM enrollments e JOIN courses c ON c.id = e.course_id
     WHERE c.department_id = $1`,
    [deptId]
  );
  const avgAttendance = Number(attRows[0]?.avg_attendance ?? 0);

  await query(
    `INSERT INTO dept_stats (department_id, at_risk_count, pass_rate, avg_attendance, refreshed_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (department_id) DO UPDATE SET at_risk_count = EXCLUDED.at_risk_count,
       pass_rate = EXCLUDED.pass_rate, avg_attendance = EXCLUDED.avg_attendance, refreshed_at = NOW()`,
    [deptId, atRiskCount, passRate, avgAttendance]
  );
}

async function computeStudentAverage(studentId: string, courseId: string): Promise<number> {
  const rows = await query<{ avg: string | null }>(
    `SELECT COALESCE(SUM(CASE WHEN g.status = 'RELEASED' AND g.grade IS NOT NULL AND a.out_of IS NOT NULL
                THEN ROUND((g.grade / a.out_of) * 100) * NULLIF(REPLACE(a.weight_pct, '%', '')::int, 0) END)
                / NULLIF(SUM(CASE WHEN g.status = 'RELEASED' AND g.grade IS NOT NULL AND a.out_of IS NOT NULL
                THEN NULLIF(REPLACE(a.weight_pct, '%', '')::int, 0) END), 0), 0) AS avg
     FROM assessments a
     LEFT JOIN grades g ON g.assessment_id = a.id AND g.student_id = $1
     WHERE a.course_id = $2`,
    [studentId, courseId]
  );
  return Math.round(Number(rows[0]?.avg ?? 0));
}

async function evaluateGradeAtRisk(payload: GradeReleasedPayload): Promise<void> {
  for (const sg of payload.studentGrades) {
    const avg = await computeStudentAverage(sg.studentId, payload.courseId);
    const existing = await query<{ id: string; resolved: boolean }>(
      `SELECT id, resolved FROM at_risk_flags WHERE student_id = $1 AND course_id = $2 LIMIT 1`,
      [sg.studentId, payload.courseId]
    );

    if (avg < 60) {
      await query(
        `INSERT INTO at_risk_flags (student_id, course_id, risk_level, signal)
         VALUES ($1, $2, 'Critical', $3)
         ON CONFLICT (student_id, course_id) DO UPDATE SET risk_level = 'Critical', signal = EXCLUDED.signal, resolved = false`,
        [sg.studentId, payload.courseId, 'Grade average dropped below 60%']
      );
    } else if (avg < 70) {
      await query(
        `INSERT INTO at_risk_flags (student_id, course_id, risk_level, signal)
         VALUES ($1, $2, 'High', $3)
         ON CONFLICT (student_id, course_id) DO UPDATE SET risk_level = 'High', signal = EXCLUDED.signal, resolved = false`,
        [sg.studentId, payload.courseId, 'Grade average below 70%']
      );
    } else if (existing[0] && !existing[0].resolved) {
      await query(`UPDATE at_risk_flags SET resolved = true WHERE id = $1`, [existing[0].id]);
    }
  }
  await refreshDeptStats(payload.departmentId);
}

async function evaluateAttendanceAtRisk(payload: AttendanceClosedPayload): Promise<void> {
  for (const studentId of payload.absentStudentIds) {
    const rows = await query<{ present: string; total: string }>(
      `SELECT COUNT(*) FILTER (WHERE ar.status = 'PRESENT')::text AS present, COUNT(*)::text AS total
       FROM attendance_records ar
       JOIN attendance_sessions s ON s.id = ar.session_id
       WHERE s.course_id = $1 AND ar.student_id = $2`,
      [payload.courseId, studentId]
    );
    const present = Number(rows[0]?.present ?? 0);
    const total = Number(rows[0]?.total ?? 0);
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    const existing = await query<{ id: string; resolved: boolean }>(
      `SELECT id, resolved FROM at_risk_flags WHERE student_id = $1 AND course_id = $2 LIMIT 1`,
      [studentId, payload.courseId]
    );

    if (rate < 60) {
      await query(
        `INSERT INTO at_risk_flags (student_id, course_id, risk_level, signal)
         VALUES ($1, $2, 'Critical', $3)
         ON CONFLICT (student_id, course_id) DO UPDATE SET risk_level = 'Critical', signal = EXCLUDED.signal, resolved = false`,
        [studentId, payload.courseId, 'Attendance dropped below 60%']
      );
    } else if (rate < 75) {
      await query(
        `INSERT INTO at_risk_flags (student_id, course_id, risk_level, signal)
         VALUES ($1, $2, 'High', $3)
         ON CONFLICT (student_id, course_id) DO UPDATE SET risk_level = 'High', signal = EXCLUDED.signal, resolved = false`,
        [studentId, payload.courseId, 'Attendance below 75% threshold']
      );
    } else if (existing[0] && !existing[0].resolved) {
      await query(`UPDATE at_risk_flags SET resolved = true WHERE id = $1`, [existing[0].id]);
    }
  }
  await refreshDeptStats(payload.departmentId);
}

async function notifyStudent(userId: string, title: string, body: string, type: string): Promise<void> {
  await query(
    `INSERT INTO notifications (user_id, title, body, type) VALUES ($1, $2, $3, $4)`,
    [userId, title, body, type]
  );
  await query(`UPDATE users SET message_badge = COALESCE(message_badge, 0) + 1 WHERE id = $1`, [userId]);
}

export default fp(async function rabbitMQPlugin(fastify: FastifyInstance): Promise<void> {
  const url = process.env.RABBITMQ_URL ?? 'amqp://campus:campus@localhost:5672';
  let connection: ChannelModel | null = null;
  let channel: Channel;

  try {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

    await channel.assertQueue('notifications.queue', { durable: true });
    await channel.bindQueue('notifications.queue', EXCHANGE, '*.grade.released');
    await channel.bindQueue('notifications.queue', EXCHANGE, '*.attendance.closed');
    await channel.bindQueue('notifications.queue', EXCHANGE, '*.user.created');
    await channel.bindQueue('notifications.queue', EXCHANGE, 'admin.broadcast.*');

    await channel.assertQueue('atrisk.queue', { durable: true });
    await channel.bindQueue('atrisk.queue', EXCHANGE, '*.grade.released');
    await channel.bindQueue('atrisk.queue', EXCHANGE, '*.attendance.closed');

    await channel.consume('notifications.queue', (msg) => {
      if (!msg) return;
      void (async () => {
        try {
          const routingKey = msg.fields.routingKey;
          const payload = JSON.parse(msg.content.toString());
          if (routingKey.endsWith('grade.released')) {
            const p = payload as GradeReleasedPayload;
            for (const sg of p.studentGrades) {
              await notifyStudent(
                sg.studentId,
                `Grade Released for ${p.assessmentTitle}`,
                `Your grade for ${p.assessmentTitle} in ${p.courseName} has been released.`,
                'grade'
              );
            }
          } else if (routingKey.endsWith('attendance.closed')) {
            const p = payload as AttendanceClosedPayload;
            for (const studentId of p.absentStudentIds) {
              await notifyStudent(
                studentId,
                'Attendance Alert',
                `You were marked absent in ${p.courseName} on ${p.date}. Contact your faculty if this is incorrect.`,
                'attendance'
              );
            }
          } else if (routingKey.endsWith('user.created')) {
            const p = payload as UserCreatedPayload;
            await query(
              `INSERT INTO notifications (user_id, title, body, type) VALUES ($1, $2, $3, 'info')`,
              [p.adminId, 'New user created', `${p.name} has been added to the system.`]
            );
          } else if (routingKey.startsWith('admin.broadcast.')) {
            const p = payload as BroadcastSentPayload;
            let userIds: string[] = [];
            if (p.channelType === 'all_students') {
              const r = await query<{ id: string }>(`SELECT id FROM users WHERE role_type = 'student' AND is_active = true`);
              userIds = r.map((u) => u.id);
            } else if (p.channelType === 'all_faculty') {
              const r = await query<{ id: string }>(`SELECT id FROM users WHERE role_type = 'faculty' AND is_active = true`);
              userIds = r.map((u) => u.id);
            } else if (p.channelType === 'dept_heads') {
              const r = await query<{ id: string }>(`SELECT id FROM users WHERE role_type = 'dept-head' AND is_active = true`);
              userIds = r.map((u) => u.id);
            } else if (p.channelType === 'at_risk') {
              const r = await query<{ id: string }>(`SELECT DISTINCT student_id AS id FROM at_risk_flags WHERE resolved = false`);
              userIds = r.map((u) => u.id);
            }
            for (const userId of userIds) {
              await notifyStudent(userId, 'Announcement from Admin', p.body, 'info');
            }
          }
          channel.ack(msg);
        } catch (err) {
          fastify.log.error({ err }, 'notifications consumer failed');
          channel.nack(msg, false, false);
        }
      })();
    });

    await channel.consume('atrisk.queue', (msg) => {
      if (!msg) return;
      void (async () => {
        try {
          const routingKey = msg.fields.routingKey;
          const payload = JSON.parse(msg.content.toString());
          if (routingKey.endsWith('grade.released')) {
            await evaluateGradeAtRisk(payload as GradeReleasedPayload);
          } else if (routingKey.endsWith('attendance.closed')) {
            await evaluateAttendanceAtRisk(payload as AttendanceClosedPayload);
          }
          channel.ack(msg);
        } catch (err) {
          fastify.log.error({ err }, 'atrisk consumer failed');
          channel.nack(msg, false, false);
        }
      })();
    });

    const publish = async (routingKey: string, payload: Record<string, unknown>): Promise<void> => {
      channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), { persistent: true });
    };

    fastify.decorate('amqp', { channel, publish });

    fastify.addHook('onClose', async () => {
      try {
        await channel.close();
        if (connection) await connection.close();
      } catch (err) {
        fastify.log.error({ err }, 'failed to close rabbitmq connection');
      }
    });

    fastify.log.info('RabbitMQ connected, queues asserted');
  } catch (err) {
    fastify.log.error({ err }, 'RabbitMQ connection failed; events disabled');
    fastify.decorate('amqp', {
      channel: null as unknown as Channel,
      publish: async () => {},
    });
  }
});

declare module 'fastify' {
  interface FastifyInstance {
    amqp: AmqpClient;
  }
}
