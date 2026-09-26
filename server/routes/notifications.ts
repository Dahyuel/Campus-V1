import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../middleware/requireAuth.js';
import { query } from '../db/client.js';
import { escapeHtml } from '../lib/sanitize.js';
import { normalizePreferences } from '../lib/preferences.js';

function timeAgo(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(1, mins)} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  if (hours < 48) return 'Yesterday';
  return `${Math.floor(hours / 24)} days ago`;
}

// Types the user switched off in Settings; they stay stored but are hidden.
async function mutedTypes(userId: string): Promise<string[]> {
  const rows = await query<{ preferences: unknown }>(`SELECT preferences FROM users WHERE id = $1`, [userId]);
  return normalizePreferences(rows[0]?.preferences).mutedNotificationTypes;
}

async function requireAnyAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(request, reply);
}

export default async function notificationRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireAnyAuth);

  fastify.get('/', async (request, reply) => {
    const rows = await query<{
      id: string;
      title: string;
      body: string | null;
      type: string;
      read_at: string | null;
      created_at: string;
    }>(
      `SELECT id, title, body, type, read_at, created_at FROM notifications
       WHERE user_id = $1 AND COALESCE(type, 'info') <> ALL($2::text[])
       ORDER BY created_at DESC LIMIT 20`,
      [request.user!.id, await mutedTypes(request.user!.id)]
    );
    return reply.status(200).send(
      rows.map((n) => ({
        id: n.id,
        title: escapeHtml(n.title),
        body: escapeHtml(n.body ?? ''),
        type: n.type,
        unread: n.read_at === null,
        time: timeAgo(n.created_at),
      }))
    );
  });

  fastify.get('/unread-count', async (request, reply) => {
    const rows = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM notifications
       WHERE user_id = $1 AND read_at IS NULL AND COALESCE(type, 'info') <> ALL($2::text[])`,
      [request.user!.id, await mutedTypes(request.user!.id)]
    );
    return reply.status(200).send({ count: Number(rows[0]?.count ?? 0) });
  });

  // Unread direct messages for the signed-in user, for the sidebar badge.
  // Role-agnostic: the messages table is shared by every role.
  fastify.get('/unread-messages', async (request, reply) => {
    const rows = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM messages
       WHERE recipient_id = $1 AND read_at IS NULL`,
      [request.user!.id]
    );
    return reply.status(200).send({ count: Number(rows[0]?.count ?? 0) });
  });

  fastify.patch('/read-all', async (request, reply) => {
    const rows = await query<{ id: string }>(
      `UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL RETURNING id`,
      [request.user!.id]
    );
    await query(`UPDATE users SET message_badge = 0 WHERE id = $1`, [request.user!.id]);
    return reply.status(200).send({ marked: rows.length });
  });

  fastify.patch('/:id/read', async (request, reply) => {
    const { id } = request.params as { id: string };
    const rows = await query<{ id: string }>(
      `UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2 AND read_at IS NULL RETURNING id`,
      [id, request.user!.id]
    );
    if (rows.length > 0) {
      await query(
        `UPDATE users SET message_badge = GREATEST(COALESCE(message_badge, 0) - 1, 0) WHERE id = $1`,
        [request.user!.id]
      );
    }
    return reply.status(200).send({ ok: true });
  });
}
