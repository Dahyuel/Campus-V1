import { FastifyRequest, FastifyReply } from 'fastify';
import { AccessTokenPayload } from '../types.js';
import { verifyAccessToken } from '../auth.js';
import { findUserById } from '../data/users.js';

const ACCESS_TOKEN_PREFIX = 'Bearer ';

export function parseBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  if (!header.startsWith(ACCESS_TOKEN_PREFIX)) return null;
  return header.slice(ACCESS_TOKEN_PREFIX.length).trim();
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const token = parseBearerToken(request.headers.authorization);
  if (!token) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  let payload: AccessTokenPayload;
  try {
    payload = verifyAccessToken(request.server, token);
  } catch {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  if (user.isActive === false) {
    return reply.status(401).send({ error: 'Account deactivated' });
  }

  request.user = {
    id: user.id,
    name: user.name,
    role: user.role,
    roleType: user.roleType,
    email: user.email,
    codeId: user.codeId,
    avatarUrl: user.avatarUrl,
    messageBadge: user.messageBadge,
  };
}
