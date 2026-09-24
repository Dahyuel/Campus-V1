import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
// AUDIT C.2: bcryptjs (pure JS) is an intentional choice; functionally equivalent to bcrypt.
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import {
  LoginBody,
  LoginResponse,
  RefreshResponse,
  ErrorResponse,
  PublicUser,
  AccessTokenPayload,
  RefreshTokenPayload,
  AuthenticatedRequest,
} from '../types.js';
import { config } from '../config.js';
import { findUserByIdentifier, findUserById } from '../data/users.js';
import {
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  rotateRefreshToken,
  buildAuthResponse,
  getFamilyId,
  revokeFamily,
  isFamilyRevoked,
} from '../auth.js';
import { redis, refreshKey } from '../redis.js';
import { logActivity, revokeRefreshToken } from '../db/activity.js';

const ACCESS_TOKEN_PREFIX = 'Bearer ';

const DUMMY_PASSWORD_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEeO6zZ0s0jK8fW9jVnL3qY5mR8tP2xQ4uW';

function parseBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  if (!header.startsWith(ACCESS_TOKEN_PREFIX)) return null;
  return header.slice(ACCESS_TOKEN_PREFIX.length).trim();
}

function setRefreshCookie(reply: FastifyReply, token: string, maxAgeSeconds: number): void {
  reply.setCookie(config.jwt.refreshCookieName, token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAgeSeconds * 1000,
  });
}

function clearRefreshCookie(reply: FastifyReply): void {
  reply.clearCookie(config.jwt.refreshCookieName, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

async function authenticateRequest(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const token = parseBearerToken(request.headers.authorization);
  if (!token) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  try {
    const payload = verifyAccessToken(request.server, token);
    const user = await findUserById(payload.sub);
    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    if (user.isActive === false) {
      return reply.status(403).send({ error: 'Account deactivated' });
    }
    (request as AuthenticatedRequest).user = {
      id: user.id,
      name: user.name,
      role: user.role,
      roleType: user.roleType,
      email: user.email,
      codeId: user.codeId,
      avatarUrl: user.avatarUrl,
      messageBadge: user.messageBadge,
    };
  } catch {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
}

export default async function authRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: LoginBody; Reply: LoginResponse | ErrorResponse }>(
    '/auth/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
          keyGenerator: (request) => {
            const body = request.body as { identifier?: string } | undefined;
            const identifier = (body?.identifier ?? '').toString().trim().toLowerCase();
            return `${request.ip}:${identifier}`;
          },
        },
      },
    },
    async (request, reply) => {
      const { identifier, password } = request.body;

      if (!identifier) {
        return reply.status(400).send({ error: 'Identifier and password are required' });
      }
      if (!password) {
        return reply.status(400).send({ error: 'Identifier and password are required' });
      }

      const user = await findUserByIdentifier(identifier);
      if (!user) {
        await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      if (user.isActive === false) {
        return reply.status(403).send({ error: 'Account deactivated' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        void logActivity(user.id, 'login_failed');
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const tokens = await generateTokenPair(fastify, user);
      setRefreshCookie(reply, tokens.refreshToken, config.jwt.refreshTtlSeconds);
      void logActivity(user.id, 'login');

      return reply.status(200).send(buildAuthResponse(user, tokens.accessToken));
    }
  );

  fastify.get<{ Reply: PublicUser | ErrorResponse }>(
    '/auth/me',
    { preValidation: authenticateRequest },
    async (request, reply) => {
      const authReq = request as AuthenticatedRequest;
      return reply.status(200).send(authReq.user);
    }
  );

  fastify.post<{ Reply: RefreshResponse | ErrorResponse }>(
    '/auth/refresh',
    {
      config: {
        rateLimit: {
          max: 30,
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
    const refreshToken = request.cookies[config.jwt.refreshCookieName];
    if (!refreshToken) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    let payload: RefreshTokenPayload | undefined;
    try {
      payload = verifyRefreshToken(fastify, refreshToken);
    } catch {
      clearRefreshCookie(reply);
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    if (!payload) {
      clearRefreshCookie(reply);
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const storedUserId = await redis.get(refreshKey(payload.jti));
    if (!storedUserId) {
      const familyId = await getFamilyId(payload.jti);
      if (familyId) {
        await revokeFamily(familyId);
      }
      clearRefreshCookie(reply);
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const familyId = await getFamilyId(payload.jti);
    if (familyId && (await isFamilyRevoked(familyId))) {
      clearRefreshCookie(reply);
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const user = await findUserById(storedUserId);
    if (!user) {
      clearRefreshCookie(reply);
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    if (user.isActive === false) {
      clearRefreshCookie(reply);
      return reply.status(403).send({ error: 'Account deactivated' });
    }

    const tokens = await rotateRefreshToken(fastify, payload.jti, user);
    setRefreshCookie(reply, tokens.refreshToken, config.jwt.refreshTtlSeconds);

    return reply.status(200).send({ accessToken: tokens.accessToken });
  });

  fastify.post<{ Reply: { message: string } | ErrorResponse }>(
    '/auth/logout',
    { preValidation: authenticateRequest },
    async (request, reply) => {
      const authReq = request as AuthenticatedRequest;
      const refreshToken = request.cookies[config.jwt.refreshCookieName];
      if (refreshToken) {
        try {
          const payload = verifyRefreshToken(fastify, refreshToken);
          await redis.del(refreshKey(payload.jti));
          await revokeRefreshToken(payload.jti);
        } catch {
        }
      }

      clearRefreshCookie(reply);
      void logActivity(authReq.user.id, 'logout');
      return reply.status(200).send({ message: 'Logged out' });
    }
  );
}
