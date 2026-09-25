import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/requireAuth.js';
import { query } from '../db/client.js';

interface TodoRow extends Record<string, unknown> {
  id: string;
  title: string;
  course_code: string | null;
  due_date: string | null;
  priority: string;
  status: string;
  is_suggested: boolean;
  suggestion_reason: string | null;
}

interface SuggestedTodo {
  title: string;
  courseCode: string | null;
  priority: string;
  isSuggested: boolean;
  suggestionReason: string;
}

function mapTodo(row: TodoRow) {
  return {
    id: row.id,
    title: row.title,
    courseCode: row.course_code,
    dueDate: row.due_date,
    priority: row.priority,
    status: row.status,
    isSuggested: row.is_suggested,
    suggestionReason: row.suggestion_reason,
  };
}

async function computeSuggestions(userId: string, roleType: string): Promise<SuggestedTodo[]> {
  const suggestions: SuggestedTodo[] = [];

  if (roleType === 'student') {
    const assessments = await query<{
      title: string;
      weight_pct: string;
      out_of: number | null;
      grade: string | null;
      grade_status: string | null;
      course_name: string;
      course_code: string;
    }>(
      `SELECT a.title, a.weight_pct, a.out_of,
              g.grade, g.status AS grade_status,
              c.name AS course_name, c.code AS course_code
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       JOIN assessments a ON a.course_id = c.id
       LEFT JOIN grades g ON g.assessment_id = a.id AND g.student_id = e.student_id
       WHERE e.student_id = $1 AND (g.status IS NULL OR g.status = 'PENDING')`,
      [userId]
    );

    for (const row of assessments) {
      const weight = parseFloat(row.weight_pct) / 100;
      const currentGrade = row.grade === null ? 0 : Number(row.grade);
      const maxGrade = row.out_of ?? 100;
      const gradeRatio = maxGrade > 0 ? currentGrade / maxGrade : 0;
      const score = weight * (1 - gradeRatio);
      const priority = score > 0.15 ? 'high' : score > 0.07 ? 'medium' : 'low';

      suggestions.push({
        title: `Prepare for ${row.title} — ${row.course_name}`,
        courseCode: row.course_code,
        priority,
        isSuggested: true,
        suggestionReason: `Worth ${row.weight_pct} of grade — ${row.grade_status === 'PENDING' ? 'not yet graded' : 'improve score'}`,
      });
    }

    const atRisk = await query<{ code: string; name: string; attendance_pct: number }>(
      `SELECT c.code, c.name, e.attendance_pct
       FROM enrollments e JOIN courses c ON c.id = e.course_id
       WHERE e.student_id = $1 AND e.attendance_pct < 75`,
      [userId]
    );

    for (const row of atRisk) {
      suggestions.push({
        title: `Attend next lecture — ${row.name}`,
        courseCode: row.code,
        priority: row.attendance_pct < 60 ? 'high' : 'medium',
        isSuggested: true,
        suggestionReason: `Attendance at ${row.attendance_pct}% — below 75% threshold`,
      });
    }

    const events = await query<{ type: string; title: string; date_label: string }>(
      `SELECT type, title, date_label FROM upcoming_events
       WHERE student_id = $1 AND type IN ('EXAM', 'DEADLINE')`,
      [userId]
    );

    for (const ev of events) {
      if (ev.type === 'EXAM') {
        suggestions.push({
          title: `Review material for ${ev.title}`,
          courseCode: null,
          priority: 'high',
          isSuggested: true,
          suggestionReason: `Exam coming: ${ev.date_label}`,
        });
      }
    }
  }

  const existing = await query<{ title: string }>(
    `SELECT title FROM todos WHERE user_id = $1 AND status = 'pending'`,
    [userId]
  );
  const existingTitles = new Set(existing.map((t) => t.title));

  return suggestions.filter((s) => !existingTitles.has(s.title)).slice(0, 8);
}

export default async function todoRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireAuth);

  fastify.get('/', async (request, reply) => {
    const userId = request.user!.id;
    const roleType = request.user!.roleType;

    const rows = await query<TodoRow>(
      `SELECT id, title, course_code, due_date::text AS due_date, priority, status, is_suggested, suggestion_reason
       FROM todos WHERE user_id = $1 ORDER BY status ASC, created_at DESC`,
      [userId]
    );
    const suggestions = await computeSuggestions(userId, roleType);

    return reply.status(200).send({
      todos: rows.map(mapTodo),
      suggestions,
    });
  });

  fastify.post('/', async (request, reply) => {
    const userId = request.user!.id;
    const body = request.body as {
      title?: string;
      courseCode?: string | null;
      dueDate?: string | null;
      priority?: string;
    };
    if (!body.title || !body.title.trim()) {
      return reply.status(400).send({ error: 'Title is required' });
    }
    const rows = await query<TodoRow>(
      `INSERT INTO todos (user_id, title, course_code, due_date, priority)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, course_code, due_date::text AS due_date, priority, status, is_suggested, suggestion_reason`,
      [userId, body.title.trim(), body.courseCode ?? null, body.dueDate ?? null, body.priority ?? 'medium']
    );
    return reply.status(200).send(mapTodo(rows[0]));
  });

  fastify.patch('/:id', async (request, reply) => {
    const userId = request.user!.id;
    const { id } = request.params as { id: string };
    const body = request.body as {
      title?: string;
      priority?: string;
      dueDate?: string | null;
      status?: string;
    };

    const rows = await query<TodoRow>(
      `UPDATE todos SET
         title = COALESCE($3, title),
         priority = COALESCE($4, priority),
         due_date = COALESCE($5, due_date),
         status = COALESCE($6, status)
       WHERE id = $1 AND user_id = $2
       RETURNING id, title, course_code, due_date::text AS due_date, priority, status, is_suggested, suggestion_reason`,
      [id, userId, body.title ?? null, body.priority ?? null, body.dueDate ?? null, body.status ?? null]
    );
    if (!rows[0]) return reply.status(404).send({ error: 'Todo not found' });
    return reply.status(200).send(mapTodo(rows[0]));
  });

  fastify.patch('/:id/done', async (request, reply) => {
    const userId = request.user!.id;
    const { id } = request.params as { id: string };
    const rows = await query<TodoRow>(
      `UPDATE todos SET status = 'done', completed_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, title, course_code, due_date::text AS due_date, priority, status, is_suggested, suggestion_reason`,
      [id, userId]
    );
    if (!rows[0]) return reply.status(404).send({ error: 'Todo not found' });
    return reply.status(200).send(mapTodo(rows[0]));
  });

  fastify.delete('/:id', async (request, reply) => {
    const userId = request.user!.id;
    const { id } = request.params as { id: string };
    await query(`DELETE FROM todos WHERE id = $1 AND user_id = $2`, [id, userId]);
    return reply.status(200).send({ ok: true });
  });

  fastify.post('/accept-suggestion', async (request, reply) => {
    const userId = request.user!.id;
    const body = request.body as {
      title?: string;
      courseCode?: string | null;
      priority?: string;
      suggestionReason?: string;
    };
    if (!body.title) return reply.status(400).send({ error: 'Title is required' });
    const rows = await query<TodoRow>(
      `INSERT INTO todos (user_id, title, course_code, priority, is_suggested, suggestion_reason)
       VALUES ($1, $2, $3, $4, true, $5)
       RETURNING id, title, course_code, due_date::text AS due_date, priority, status, is_suggested, suggestion_reason`,
      [userId, body.title, body.courseCode ?? null, body.priority ?? 'medium', body.suggestionReason ?? null]
    );
    return reply.status(200).send(mapTodo(rows[0]));
  });
}