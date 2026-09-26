import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../middleware/requireAuth.js';
import { query } from '../db/client.js';

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

async function requireStudent(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(request, reply);
  if (reply.sent) return;
  if (request.user?.roleType !== 'student') {
    return reply.status(403).send({ error: 'Forbidden' });
  }
}

const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  faculty: 'Faculty',
  admin: 'Admin',
  'dept-head': 'Dept. Head',
  dean: 'Dean',
};

export default async function studentMessagesRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireStudent);

  fastify.get('/messages', async (request, reply) => {
    const studentId = request.user!.id;
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
      [studentId]
    );

    return reply.status(200).send(
      rows.map((r, idx) => {
        const roleLabel = ROLE_LABELS[r.other_role] ?? r.other_role;
        return {
          id: `conv-${idx + 1}`,
          userId: r.other_id,
          senderName: r.other_name,
          senderRole: roleLabel,
          avatarUrl: undefined,
          lastMessage: r.body,
          timestamp: formatTime(r.sent_at),
          unreadCount: r.read_at === null && r.sender_id !== studentId ? 1 : 0,
          isOnline: true,
        };
      })
    );
  });

  fastify.get('/messages/:userId', async (request, reply) => {
    const studentId = request.user!.id;
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
      [studentId, userId]
    );
    await query(
      `UPDATE messages SET read_at = NOW() WHERE recipient_id = $1 AND sender_id = $2 AND read_at IS NULL`,
      [studentId, userId]
    );

    const otherName = await query<{ name: string }>(`SELECT name FROM users WHERE id = $1 LIMIT 1`, [userId]);
    const otherNameStr = otherName[0]?.name ?? 'Unknown';

    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        sender: r.sender_id === studentId ? ('me' as const) : ('them' as const),
        senderName: r.sender_id === studentId ? 'Me' : otherNameStr,
        text: r.body,
        time: formatTime(r.sent_at),
      }))
    );
  });

  fastify.post('/messages/:userId', async (request, reply) => {
    const studentId = request.user!.id;
    const { userId } = request.params as { userId: string };
    const { body } = request.body as { body: string };
    const inserted = await query<{ id: string; sent_at: string }>(
      `INSERT INTO messages (sender_id, recipient_id, body) VALUES ($1, $2, $3) RETURNING id, sent_at`,
      [studentId, userId, body]
    );
    return reply.status(200).send({
      id: inserted[0].id,
      sender: 'me' as const,
      senderName: 'Me',
      text: body,
      time: formatTime(inserted[0].sent_at),
    });
  });
}
