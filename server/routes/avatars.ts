import { FastifyInstance } from 'fastify';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import { query } from '../db/client.js';
import { MATERIALS_BUCKET } from '../plugins/minio.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Public on purpose: profile photos are shown in <img> tags, which can't send
// the bearer token. Only uploaded photos are served, looked up by user id.
export default async function avatarRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/avatars/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    if (!UUID_RE.test(userId)) return reply.status(404).send({ error: 'Not found' });

    const rows = await query<{ avatar_key: string | null }>(
      `SELECT avatar_key FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );
    const key = rows[0]?.avatar_key;
    if (!key) return reply.status(404).send({ error: 'Not found' });

    try {
      const obj = await fastify.minio.send(new GetObjectCommand({ Bucket: MATERIALS_BUCKET, Key: key }));
      reply.header('Content-Type', obj.ContentType ?? 'application/octet-stream');
      reply.header('Cache-Control', 'public, max-age=86400');
      return reply.send(obj.Body as Readable);
    } catch (err) {
      fastify.log.warn({ err }, 'avatar fetch failed');
      return reply.status(404).send({ error: 'Not found' });
    }
  });
}
