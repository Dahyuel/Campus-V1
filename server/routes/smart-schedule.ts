import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/requireAuth.js';
import { query } from '../db/client.js';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

function slotToTime(slot: number): string {
  const hours = Math.floor(slot / 2);
  const mins = slot % 2 === 0 ? '00' : '30';
  return `${String(hours).padStart(2, '0')}:${mins}`;
}

function parseTimeToSlot(label: string): number | null {
  const match = label.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  const mins = Number(match[2]);
  return hours * 2 + (mins >= 30 ? 1 : 0);
}

function dayOfWeekIndex(date: Date): number {
  const jsDay = date.getUTCDay();
  return jsDay === 5 ? 0 : jsDay === 6 ? 1 : jsDay === 0 ? 2 : jsDay === 1 ? 3 : jsDay === 2 ? 4 : jsDay === 3 ? 5 : 5;
}

function mondayOfWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

interface PrefsRow extends Record<string, unknown> {
  blocked_slots: unknown;
  preferred_study: string;
  max_study_block: number;
  personal_events: unknown;
}

interface SessionRow extends Record<string, unknown> {
  day_of_week: string;
  time_slot: string;
  name: string | null;
  code: string;
  course_name: string;
}

interface DeadlineRow extends Record<string, unknown> {
  type: string;
  title: string;
  date_label: string;
  course_code: string | null;
}

export default async function smartScheduleRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireAuth);

  function ensureRole(request: { user?: { roleType: string } }, reply: { status: (n: number) => { send: (b: unknown) => unknown } }): boolean {
    const role = request.user?.roleType;
    if (role !== 'student' && role !== 'faculty') {
      void reply.status(403).send({ error: 'Forbidden' });
      return false;
    }
    return true;
  }

  fastify.get('/preferences', async (request, reply) => {
    if (!ensureRole(request, reply)) return;
    const userId = request.user!.id;
    const rows = await query<PrefsRow>(
      `SELECT blocked_slots, preferred_study, max_study_block, personal_events
       FROM schedule_preferences WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    if (!rows[0]) {
      return reply.status(200).send({
        blockedSlots: [],
        preferredStudy: 'morning',
        maxStudyBlock: 90,
        personalEvents: [],
      });
    }
    return reply.status(200).send({
      blockedSlots: rows[0].blocked_slots,
      preferredStudy: rows[0].preferred_study,
      maxStudyBlock: rows[0].max_study_block,
      personalEvents: rows[0].personal_events,
    });
  });

  fastify.post('/preferences', async (request, reply) => {
    if (!ensureRole(request, reply)) return;
    const userId = request.user!.id;
    const body = request.body as {
      blockedSlots?: unknown[];
      preferredStudy?: string;
      maxStudyBlock?: number;
      personalEvents?: unknown[];
    };
    const blockedSlots = JSON.stringify(body.blockedSlots ?? []);
    const personalEvents = JSON.stringify(body.personalEvents ?? []);
    const preferredStudy = body.preferredStudy ?? 'morning';
    const maxStudyBlock = body.maxStudyBlock ?? 90;

    const rows = await query<PrefsRow>(
      `INSERT INTO schedule_preferences (user_id, blocked_slots, preferred_study, max_study_block, personal_events, updated_at)
       VALUES ($1, $2::jsonb, $3, $4, $5::jsonb, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         blocked_slots = EXCLUDED.blocked_slots,
         preferred_study = EXCLUDED.preferred_study,
         max_study_block = EXCLUDED.max_study_block,
         personal_events = EXCLUDED.personal_events,
         updated_at = NOW()
       RETURNING blocked_slots, preferred_study, max_study_block, personal_events`,
      [userId, blockedSlots, preferredStudy, maxStudyBlock, personalEvents]
    );
    const row = rows[0];
    return reply.status(200).send({
      blockedSlots: row.blocked_slots,
      preferredStudy: row.preferred_study,
      maxStudyBlock: row.max_study_block,
      personalEvents: row.personal_events,
    });
  });

  fastify.post('/generate', async (request, reply) => {
    if (!ensureRole(request, reply)) return;
    const userId = request.user!.id;
    const roleType = request.user!.roleType;

    const prefsRows = await query<PrefsRow>(
      `SELECT blocked_slots, preferred_study, max_study_block, personal_events
       FROM schedule_preferences WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    const prefs = prefsRows[0] ?? {
      blocked_slots: [],
      preferred_study: 'morning',
      max_study_block: 90,
      personal_events: [],
    };

    let courseCodes: string[] = [];
    if (roleType === 'student') {
      const courseRows = await query<{ code: string }>(
        `SELECT c.code FROM enrollments e JOIN courses c ON c.id = e.course_id
         WHERE e.student_id = $1`,
        [userId]
      );
      courseCodes = courseRows.map((r) => r.code);
    } else {
      const courseRows = await query<{ code: string }>(
        `SELECT c.code FROM faculty_course_assignments fca JOIN courses c ON c.id = fca.course_id
         WHERE fca.faculty_id = $1`,
        [userId]
      );
      courseCodes = courseRows.map((r) => r.code);
    }

    const sessionRows = await query<SessionRow>(
      `SELECT ss.day_of_week, ss.time_slot, ss.name, c.code, c.name AS course_name
       FROM schedule_slots ss JOIN courses c ON c.id = ss.course_id
       WHERE c.code = ANY($1::text[])`,
      [courseCodes]
    );

    const deadlineRows = await query<DeadlineRow>(
      `SELECT ue.type, ue.title, ue.date_label, c.code AS course_code
       FROM upcoming_events ue LEFT JOIN courses c ON c.id = ue.course_id
       WHERE ue.student_id = $1 AND ue.type IN ('EXAM', 'DEADLINE')`,
      [userId]
    );

    const courseSessions = sessionRows
      .map((r) => {
        const range = r.time_slot.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        if (!range) return null;
        const startSlot = parseTimeToSlot(range[1]);
        const endSlot = parseTimeToSlot(range[2]);
        if (startSlot === null || endSlot === null) return null;
        return {
          day: r.day_of_week,
          startSlot,
          endSlot,
          courseCode: r.code,
          courseName: r.name ?? r.course_name,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const now = new Date();
    const deadlines = deadlineRows.map((r) => ({
      dayIndex: dayOfWeekIndex(now),
      label: r.course_code ? `${r.course_code} ${r.title}` : r.title,
    }));

    const payload = {
      userId,
      courseSessions,
      deadlines,
      blockedSlots: prefs.blocked_slots ?? [],
      personalEvents: prefs.personal_events ?? [],
      preferredStudy: prefs.preferred_study ?? 'morning',
      maxStudyBlockSlots: Math.max(1, Math.round((prefs.max_study_block ?? 90) / 30)),
      coursesToStudy: courseCodes,
    };

    let generated: { slots: Array<Record<string, unknown>>; status: string };
    try {
      const res = await fetch(`${process.env.SMART_SCHEDULE_URL ?? 'http://localhost:5001'}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`schedule service responded ${res.status}`);
      generated = (await res.json()) as { slots: Array<Record<string, unknown>>; status: string };
    } catch {
      return reply.status(502).send({ error: 'Schedule service unavailable' });
    }

    const slots = (generated.slots ?? []).map((s) => ({
      ...s,
      startTime: slotToTime(Number(s.startSlot)),
      endTime: slotToTime(Number(s.endSlot)),
    }));

    const weekStart = mondayOfWeek(now);
    await query(
      `INSERT INTO smart_schedules (user_id, week_start, slots, generated_at)
       VALUES ($1, $2, $3::jsonb, NOW())
       ON CONFLICT (user_id, week_start) DO UPDATE SET slots = EXCLUDED.slots, generated_at = NOW()`,
      [userId, weekStart, JSON.stringify(slots)]
    );

    return reply.status(200).send({ weekStart, slots });
  });

  fastify.get('/cached', async (request, reply) => {
    if (!ensureRole(request, reply)) return;
    const userId = request.user!.id;
    const weekStart = mondayOfWeek(new Date());
    const rows = await query<{ slots: unknown; week_start: string }>(
      `SELECT slots, week_start FROM smart_schedules WHERE user_id = $1 AND week_start = $2 LIMIT 1`,
      [userId, weekStart]
    );
    if (!rows[0]) return reply.status(200).send(null);
    return reply.status(200).send({
      weekStart: rows[0].week_start,
      slots: rows[0].slots,
    });
  });
}

export { DAYS };