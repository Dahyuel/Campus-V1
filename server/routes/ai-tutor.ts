import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../middleware/requireAuth.js';
import { query } from '../db/client.js';
import { TUTOR_SYSTEM_PROMPT } from '../lib/tutor-prompt.js';
import { getEmbedding, queryQdrant } from '../lib/rag.js';
import { escapeHtml } from '../lib/sanitize.js';
import { config } from '../config.js';
import OpenAI from 'openai';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const openaiClient = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL,
  apiKey: process.env.DEEPSEEK_API_KEY,
});

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dateLabel(d: Date): string {
  const now = new Date();
  if (isSameDay(d, now)) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, yesterday)) return 'Yesterday';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function formatTime(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

async function requireStudent(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(request, reply);
  if (reply.sent) return;
  if (request.user?.roleType !== 'student') {
    return reply.status(403).send({ error: 'Forbidden' });
  }
}

async function assertEnrolled(studentId: string, courseCode: string): Promise<{ id: string; name: string } | null> {
  const rows = await query<{ id: string; name: string }>(
    `SELECT c.id, c.name FROM courses c
     JOIN enrollments e ON e.course_id = c.id
     WHERE e.student_id = $1 AND c.code = $2
     LIMIT 1`,
    [studentId, courseCode]
  );
  return rows[0] ?? null;
}

export default async function aiTutorRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireStudent);

  fastify.get('/sessions', async (request, reply) => {
    const studentId = request.user!.id;
    const sessionRows = await query<{
      id: string;
      course_name: string;
      course_code: string;
      date_label: string;
      preview: string | null;
      exchanges_count: number;
      updated_at: string;
    }>(
      `SELECT id, course_name, course_code, date_label, preview, exchanges_count, updated_at
       FROM tutor_sessions WHERE student_id = $1 ORDER BY updated_at DESC`,
      [studentId]
    );

    const sessions = [];
    for (const s of sessionRows) {
      const messageRows = await query<{
        id: string;
        sender: string;
        text: string;
        citation: string | null;
        created_at: string;
      }>(
        `SELECT id, sender, text, citation, created_at FROM tutor_messages
         WHERE session_id = $1 ORDER BY created_at ASC`,
        [s.id]
      );
      sessions.push({
        id: s.id,
        course: escapeHtml(s.course_name),
        courseCode: escapeHtml(s.course_code),
        dateLabel: escapeHtml(s.date_label),
        preview: escapeHtml(s.preview ?? ''),
        exchangesCount: s.exchanges_count,
        messages: messageRows.map((m) => ({
          id: m.id,
          sender: m.sender,
          text: escapeHtml(m.text),
          citation: escapeHtml(m.citation ?? ''),
          time: formatTime(new Date(m.created_at)),
        })),
      });
    }

    return reply.status(200).send(sessions);
  });

  fastify.post('/sessions', async (request, reply) => {
    const studentId = request.user!.id;
    const { courseCode } = request.body as { courseCode: string };

    const course = await assertEnrolled(studentId, courseCode);
    if (!course) {
      return reply.status(403).send({ error: 'Not enrolled in this course' });
    }

    const sessionResult = await query<{
      id: string;
      course_name: string;
      course_code: string;
      date_label: string;
      preview: string | null;
      exchanges_count: number;
      updated_at: string;
    }>(
      `INSERT INTO tutor_sessions (student_id, course_id, course_name, course_code, date_label, preview)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [studentId, course.id, course.name, courseCode, dateLabel(new Date()), 'New tutoring discussion started...']
    );
    const session = sessionResult[0];

    const welcomeText = `Welcome to your 1-on-1 tutoring session for ${course.name}. What concept, problem set, or lecture topic would you like to explore today?`;
    const citation = `Source: ${course.name} Course Syllabus & Lecture 1 Overview`;
    const msgRows = await query<{
      id: string;
      sender: string;
      text: string;
      citation: string | null;
      created_at: string;
    }>(
      `INSERT INTO tutor_messages (session_id, sender, text, citation) VALUES ($1, $2, $3, $4) RETURNING *`,
      [session.id, 'ai', welcomeText, citation]
    );

    return reply.status(200).send({
      id: session.id,
      course: escapeHtml(session.course_name),
      courseCode: escapeHtml(session.course_code),
      dateLabel: escapeHtml(session.date_label),
      preview: escapeHtml(session.preview ?? ''),
      exchangesCount: 0,
      messages: msgRows.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: escapeHtml(m.text),
        citation: escapeHtml(m.citation ?? ''),
        time: formatTime(new Date(m.created_at)),
      })),
    });
  });

  fastify.post('/sessions/:sessionId/message', async (request, reply) => {
    const studentId = request.user!.id;
    const { sessionId } = request.params as { sessionId: string };
    const { text } = request.body as { text: string };

    const trimmedText = text.trim();
    if (!trimmedText) {
      return reply.status(400).send({ error: 'Message text is required' });
    }

    const sessionRows = await query<{
      id: string;
      course_name: string;
      course_code: string;
      student_id: string;
    }>(
      `SELECT id, course_name, course_code, student_id FROM tutor_sessions WHERE id = $1 LIMIT 1`,
      [sessionId]
    );
    const session = sessionRows[0];
    if (!session || session.student_id !== studentId) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    // 1. Save student message
    await query(
      'INSERT INTO tutor_messages (session_id, sender, text) VALUES ($1, $2, $3)',
      [sessionId, 'student', trimmedText]
    );

    // 2. RAG context
    let context = '';
    try {
      const embedding = await getEmbedding(trimmedText);
      const results = await queryQdrant(session.course_code, embedding, 3);
      context = results.map((r) => r.text).join('\n\n');
    } catch (err) {
      fastify.log.warn({ err }, 'RAG query failed, continuing without context');
    }

    // 3. Build conversation history (last 6 messages)
    const historyRows = await query<{
      sender: string;
      text: string;
    }>(
      `SELECT sender, text FROM tutor_messages
       WHERE session_id = $1 ORDER BY created_at DESC LIMIT 6`,
      [sessionId]
    );
    const history = historyRows.reverse();

    const systemContent = TUTOR_SYSTEM_PROMPT(session.course_name, context);
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemContent },
      ...history.map((m) => ({
        role: m.sender === 'student' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      })),
      { role: 'user' as const, content: trimmedText },
    ];

    // Start SSE stream
    const origin = request.headers.origin;
    const allowedOrigin = config.frontendOrigin || config.appUrl;
    reply.hijack();
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...(origin && origin === allowedOrigin
        ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true' }
        : {}),
    });

    let fullText = '';
    let streamFailed = false;

    try {
      const stream = await openaiClient.chat.completions.create({
        model: 'deepseek-reasoner',
        stream: true,
        messages,
      });

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token) {
          fullText += token;
          reply.raw.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
        }
      }
    } catch (err) {
      fastify.log.warn({ err }, 'DeepSeek stream failed, using fallback');
      streamFailed = true;
      const fallback = `That is an interesting question about ${session.course_name}. Before we dive in, what do you already know about the core concepts involved, and what do you think might be the first step toward solving it?`;
      fullText = fallback;
      reply.raw.write(`data: ${JSON.stringify({ type: 'token', content: fallback })}\n\n`);
    }

    // 5. Save AI message
    const topResult = context
      ? { metadata: { lectureLabel: 'Indexed Course Material', slideNum: 1 } }
      : null;
    const citation = topResult
      ? `Source: ${topResult.metadata.lectureLabel}, Slide ${topResult.metadata.slideNum} — ${session.course_name}`
      : `Source: ${session.course_name} Course Material`;

    const aiMsgRows = await query<{ id: string }>(
      'INSERT INTO tutor_messages (session_id, sender, text, citation) VALUES ($1, $2, $3, $4) RETURNING id',
      [sessionId, 'ai', fullText, citation]
    );

    // 6. Update session stats
    await query(
      'UPDATE tutor_sessions SET exchanges_count = exchanges_count + 2, preview = $1, updated_at = NOW() WHERE id = $2',
      [trimmedText.substring(0, 80), sessionId]
    );

    reply.raw.write(
      `data: ${JSON.stringify({ type: 'done', messageId: aiMsgRows[0].id, citation })}\n\n`
    );
    reply.raw.end();
  });
}
