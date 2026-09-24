import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../middleware/requireAuth.js';
import { query } from '../db/client.js';
import { escapeHtml } from '../lib/sanitize.js';
import { getEmbedding, queryQdrant } from '../lib/rag.js';
import OpenAI from 'openai';

const openaiClient = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL,
  apiKey: process.env.DEEPSEEK_API_KEY,
});

function timeAgo(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  if (hours < 48) return 'Yesterday';
  return `${Math.floor(hours / 24)} days ago`;
}

async function requireStudent(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(request, reply);
  if (reply.sent) return;
  if (request.user?.roleType !== 'student') {
    return reply.status(403).send({ error: 'Forbidden' });
  }
}

async function assertEnrolled(studentId: string, courseCode: string): Promise<string | null> {
  const rows = await query<{ id: string }>(
    `SELECT c.id FROM courses c
     JOIN enrollments e ON e.course_id = c.id
     WHERE e.student_id = $1 AND c.code = $2
     LIMIT 1`,
    [studentId, courseCode]
  );
  return rows[0]?.id ?? null;
}

async function generateAiAnswer(courseCode: string, courseName: string, title: string, body: string): Promise<{ answer: string; citation: string } | null> {
  try {
    const embedding = await getEmbedding(`${title}\n${body}`);
    const contextResults = await queryQdrant(courseCode, embedding, 3);
    const context = contextResults.map((r) => r.text).join('\n\n');
    const top = contextResults[0];

    const prompt = `
You are an AI course assistant for ${courseName}. Answer the student's question briefly and accurately using only the course material below.
If the answer is not in the material, say you need more information.

COURSE MATERIAL CONTEXT:
${context || 'No specific material indexed yet.'}

QUESTION TITLE: ${title}
QUESTION BODY: ${body}

Provide a concise 2-4 sentence answer. End with a short citation referencing the lecture/slide if possible.
`;

    const res = await openaiClient.chat.completions.create({
      model: 'deepseek-reasoner',
      messages: [{ role: 'user', content: prompt }],
    });
    const answer = res.choices[0]?.message?.content ?? '';
    const citation = top
      ? `Source: ${top.metadata.lectureLabel}, Slide ${top.metadata.slideNum} — ${courseName}`
      : `Source: ${courseName} Course Material`;
    return { answer, citation };
  } catch {
    return null;
  }
}

export default async function studentCommunityRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireStudent);

  fastify.get('/community', async (request, reply) => {
    const studentId = request.user!.id;
    const { courseCode } = request.query as { courseCode?: string };

    let courseFilter = '';
    const params: unknown[] = [studentId];
    if (courseCode) {
      courseFilter = 'AND c.code = $2';
      params.push(courseCode);
    }

    const rows = await query<{
      id: string;
      post_type: string;
      course_name: string;
      course_code: string;
      author_name: string | null;
      created_at: string;
      title: string;
      content: string;
      upvotes: number;
      is_pinned: boolean;
      ai_answer: string | null;
      ai_citation: string | null;
      ai_status: string | null;
    }>(
      `SELECT cp.id, cp.post_type, c.name AS course_name, c.code AS course_code,
              u.name AS author_name, cp.created_at, cp.title, cp.content,
              cp.upvotes, cp.is_pinned, cp.ai_answer, cp.ai_citation, cp.ai_status
       FROM community_posts cp
       JOIN courses c ON c.id = cp.course_id
       LEFT JOIN users u ON u.id = cp.author_id
       WHERE cp.is_flagged = false
         AND cp.course_id IN (
           SELECT e.course_id FROM enrollments e WHERE e.student_id = $1
         )
         ${courseFilter}
       ORDER BY cp.is_pinned DESC, cp.created_at DESC`,
      params
    );

    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        type: r.post_type,
        course: escapeHtml(r.course_name),
        courseCode: escapeHtml(r.course_code),
        author: escapeHtml(r.author_name ?? 'Anonymous'),
        authorRole: 'Student',
        authorAvatar: undefined,
        avatarUrl: undefined,
        isAnonymous: r.author_name === null,
        timePosted: timeAgo(r.created_at),
        title: escapeHtml(r.title),
        body: escapeHtml(r.content),
        upvotes: r.upvotes,
        repliesCount: 0,
        isPinned: r.is_pinned,
        aiResponse: r.ai_answer
          ? {
              answer: escapeHtml(r.ai_answer),
              citation: escapeHtml(r.ai_citation ?? ''),
              isFacultyApproved: r.ai_status === 'approved',
            }
          : undefined,
      }))
    );
  });

  fastify.post('/community', async (request, reply) => {
    const studentId = request.user!.id;
    const { courseCode, type, title, body, isAnonymous } = request.body as {
      courseCode: string;
      type: string;
      title: string;
      body: string;
      isAnonymous: boolean;
    };

    const courseId = await assertEnrolled(studentId, courseCode);
    if (!courseId) {
      return reply.status(403).send({ error: 'Not enrolled in this course' });
    }

    const content = `${title.trim()}\n${body.trim()}`;
    const inserted = await query<{
      id: string;
      post_type: string;
      created_at: string;
      upvotes: number;
      is_pinned: boolean;
      ai_answer: string | null;
      ai_citation: string | null;
      ai_status: string | null;
      course_name: string;
      title: string;
    }>(
      `INSERT INTO community_posts (course_id, author_id, post_type, title, content, upvotes, is_pinned, ai_answer, ai_citation, ai_status)
       VALUES ($1, $2, $3, $4, $5, 0, false, NULL, NULL, NULL)
       RETURNING id, post_type, title, created_at, upvotes, is_pinned, ai_answer, ai_citation, ai_status,
                (SELECT name FROM courses WHERE id = $1) AS course_name`,
      [courseId, isAnonymous ? null : studentId, type, title.trim(), content]
    );
    const post = inserted[0];

    // Trigger AI auto-answer async
    void (async () => {
      const courseName = post.course_name;
      const answer = await generateAiAnswer(courseCode, courseName, title, body);
      if (answer) {
        await query(
          `UPDATE community_posts SET ai_answer = $1, ai_citation = $2, ai_status = 'awaiting_approval' WHERE id = $3`,
          [answer.answer, answer.citation, post.id]
        );
      }
    })();

    return reply.status(200).send({
      id: post.id,
      type: post.post_type,
      course: escapeHtml(post.course_name),
      courseCode: escapeHtml(courseCode),
      author: isAnonymous ? 'Anonymous' : escapeHtml(request.user!.name),
      authorRole: 'Student',
      authorAvatar: undefined,
      avatarUrl: undefined,
      isAnonymous,
      timePosted: timeAgo(post.created_at),
      title: escapeHtml(post.title),
      body: escapeHtml(body.trim()),
      upvotes: post.upvotes,
      repliesCount: 0,
      isPinned: post.is_pinned,
    });
  });

  fastify.post('/community/:postId/upvote', async (request, reply) => {
    const studentId = request.user!.id;
    const { postId } = request.params as { postId: string };

    const enrolled = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM community_posts cp
       JOIN enrollments e ON e.course_id = cp.course_id
       WHERE cp.id = $1 AND e.student_id = $2`,
      [postId, studentId]
    );
    if (Number(enrolled[0]?.count ?? 0) === 0) {
      return reply.status(403).send({ error: 'Post not found or not enrolled in course' });
    }

    const rows = await query<{ upvotes: number }>(
      `UPDATE community_posts SET upvotes = upvotes + 1 WHERE id = $1 RETURNING upvotes`,
      [postId]
    );
    if (!rows[0]) {
      return reply.status(404).send({ error: 'Post not found' });
    }
    return reply.status(200).send({ upvotes: rows[0].upvotes });
  });
}
