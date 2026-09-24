import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../middleware/requireAuth.js';
import { query, pool } from '../db/client.js';
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

async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(request, reply);
  if (reply.sent) return;
  if (request.user?.roleType !== 'admin') {
    return reply.status(403).send({ error: 'Forbidden' });
  }
}

const CHANNEL_META: Array<{
  id: string;
  name: string;
  channelType: string;
  iconType: 'students' | 'faculty' | 'heads' | 'at-risk';
}> = [
  { id: 'ch-students', name: 'All Students', channelType: 'all_students', iconType: 'students' },
  { id: 'ch-faculty', name: 'All Faculty', channelType: 'all_faculty', iconType: 'faculty' },
  { id: 'ch-heads', name: 'Department Heads', channelType: 'dept_heads', iconType: 'heads' },
  { id: 'ch-at-risk', name: 'At-Risk Students', channelType: 'at_risk', iconType: 'at-risk' },
];

export default async function adminMessagesRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireAdmin);

  fastify.get('/messages/channels', async (_request, reply) => {
    const counts = await query<{
      students: string;
      faculty: string;
      heads: string;
      at_risk: string;
    }>(
      `SELECT
        (SELECT COUNT(*)::text FROM users WHERE role_type = 'student' AND is_active = true) AS students,
        (SELECT COUNT(*)::text FROM users WHERE role_type = 'faculty' AND is_active = true) AS faculty,
        (SELECT COUNT(*)::text FROM users WHERE role_type = 'dept-head' AND is_active = true) AS heads,
        (SELECT COUNT(DISTINCT student_id)::text FROM at_risk_flags WHERE resolved = false) AS at_risk`
    );
    const c = counts[0];
    const countMap: Record<string, number> = {
      all_students: Number(c.students),
      all_faculty: Number(c.faculty),
      dept_heads: Number(c.heads),
      at_risk: Number(c.at_risk),
    };

    const lastBroadcasts = await query<{
      channel_type: string;
      body: string;
      sent_at: string;
    }>(
      `SELECT DISTINCT ON (channel_type) channel_type, body, sent_at
       FROM broadcast_messages
       ORDER BY channel_type, sent_at DESC`
    );
    const lastMap = new Map<string, { body: string; sent_at: string }>();
    for (const b of lastBroadcasts) lastMap.set(b.channel_type, b);

    return reply.status(200).send(
      CHANNEL_META.map((ch) => {
        const last = lastMap.get(ch.channelType);
        return {
          id: ch.id,
          name: ch.name,
          recipients: `${countMap[ch.channelType].toLocaleString()} recipients`,
          count: countMap[ch.channelType],
          lastBroadcast: escapeHtml(last?.body ?? ''),
          time: last ? timeAgo(last.sent_at) : 'Never',
          iconType: ch.iconType,
        };
      })
    );
  });

  fastify.post('/messages/broadcast', async (request, reply) => {
    const senderId = request.user!.id;
    const { channelType, body } = request.body as { channelType: string; body: string };

    const inserted = await query<{ id: string }>(
      `INSERT INTO broadcast_messages (sender_id, channel_type, body) VALUES ($1, $2, $3) RETURNING id`,
      [senderId, channelType, body]
    );

    try {
      await fastify.amqp.publish('admin.broadcast.sent', {
        channelType,
        body,
        senderName: request.user!.name,
        senderId,
      });
    } catch (err) {
      fastify.log.error({ err }, 'failed to publish broadcast event');
    }

    // Compute recipient count for response
    let count = 0;
    if (channelType === 'all_students') {
      const r = await query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM users WHERE role_type = 'student' AND is_active = true`);
      count = Number(r[0].count);
    } else if (channelType === 'all_faculty') {
      const r = await query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM users WHERE role_type = 'faculty' AND is_active = true`);
      count = Number(r[0].count);
    } else if (channelType === 'dept_heads') {
      const r = await query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM users WHERE role_type = 'dept-head' AND is_active = true`);
      count = Number(r[0].count);
    } else if (channelType === 'at_risk') {
      const r = await query<{ count: string }>(`SELECT COUNT(DISTINCT student_id)::text AS count FROM at_risk_flags WHERE resolved = false`);
      count = Number(r[0].count);
    }

    return reply.status(200).send({ sent: count, messageId: inserted[0].id });
  });

  fastify.get('/messages/direct', async (request, reply) => {
    const adminId = request.user!.id;
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
      [adminId]
    );

    return reply.status(200).send(
      rows.map((r, idx) => ({
        id: `dir-${idx + 1}`,
        userId: r.other_id,
        name: escapeHtml(r.other_name),
        role: escapeHtml(r.other_role),
        department: '',
        avatar: undefined,
        online: true,
        lastMessage: escapeHtml(r.body),
        time: formatTime(r.sent_at),
      }))
    );
  });

  fastify.get('/messages/direct/:userId', async (request, reply) => {
    const adminId = request.user!.id;
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
      [adminId, userId]
    );
    await query(
      `UPDATE messages SET read_at = NOW() WHERE recipient_id = $1 AND sender_id = $2 AND read_at IS NULL`,
      [adminId, userId]
    );
    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        sender: r.sender_id === adminId ? ('me' as const) : ('them' as const),
        text: escapeHtml(r.body),
        time: formatTime(r.sent_at),
      }))
    );
  });

  fastify.post('/messages/direct/:userId', async (request, reply) => {
    const adminId = request.user!.id;
    const { userId } = request.params as { userId: string };
    const { body } = request.body as { body: string };
    const inserted = await query<{ id: string; sent_at: string }>(
      `INSERT INTO messages (sender_id, recipient_id, body) VALUES ($1, $2, $3) RETURNING id, sent_at`,
      [adminId, userId, body]
    );
    return reply.status(200).send({
      id: inserted[0].id,
      sender: 'me' as const,
      text: escapeHtml(body),
      time: formatTime(inserted[0].sent_at),
    });
  });
}
