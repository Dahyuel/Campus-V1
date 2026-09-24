import { v4 as uuidv4 } from 'uuid';
import { FastifyInstance } from 'fastify';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  SeededUser,
  TokenPair,
} from './types.js';
import { config } from './config.js';
import { stripSensitive } from './data/users.js';
import { redis, refreshKey, refreshFamilyKey, revokedFamilyKey } from './redis.js';
import { logRefreshToken } from './db/activity.js';

export async function generateTokenPair(
  fastify: FastifyInstance,
  user: SeededUser
): Promise<TokenPair> {
  const accessJti = uuidv4();
  const refreshJti = uuidv4();

  const now = Math.floor(Date.now() / 1000);

  const accessPayload: AccessTokenPayload = {
    sub: user.id,
    roleType: user.roleType,
    jti: accessJti,
    type: 'access',
  };

  const refreshPayload: RefreshTokenPayload = {
    sub: user.id,
    jti: refreshJti,
    type: 'refresh',
  };

  const accessToken = fastify.jwt.access.sign(accessPayload);
  const refreshToken = fastify.jwt.refresh.sign(refreshPayload);

  await redis.setex(refreshKey(refreshJti), config.jwt.refreshTtlSeconds, user.id);
  await redis.setex(refreshFamilyKey(refreshJti), config.jwt.refreshTtlSeconds, refreshJti);
  await logRefreshToken(
    user.id,
    refreshJti,
    new Date((now + config.jwt.refreshTtlSeconds) * 1000)
  );

  return {
    accessToken,
    refreshToken,
    accessExpiresIn: now + config.jwt.accessTtlSeconds,
    refreshExpiresIn: now + config.jwt.refreshTtlSeconds,
  };
}

export function verifyAccessToken(
  fastify: FastifyInstance,
  token: string
): AccessTokenPayload {
  const payload = fastify.jwt.access.verify<AccessTokenPayload>(token);
  if (payload.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return payload;
}

export function verifyRefreshToken(
  fastify: FastifyInstance,
  token: string
): RefreshTokenPayload {
  const payload = fastify.jwt.refresh.verify<RefreshTokenPayload>(token);
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return payload;
}

export async function rotateRefreshToken(
  fastify: FastifyInstance,
  oldRefreshJti: string,
  user: SeededUser
): Promise<TokenPair> {
  await redis.del(refreshKey(oldRefreshJti));
  return generateTokenPair(fastify, user);
}

export async function getFamilyId(jti: string): Promise<string | null> {
  return redis.get(refreshFamilyKey(jti));
}

export async function revokeFamily(familyId: string): Promise<void> {
  await redis.setex(revokedFamilyKey(familyId), config.jwt.refreshTtlSeconds, '1');
}

export async function isFamilyRevoked(familyId: string): Promise<boolean> {
  return (await redis.get(revokedFamilyKey(familyId))) !== null;
}

export function buildAuthResponse(user: SeededUser, accessToken: string) {
  return {
    accessToken,
    user: stripSensitive(user),
  };
}
