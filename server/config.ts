import 'dotenv/config';
import { ServerConfig } from './types.js';

const DEFAULT_ACCESS_TTL = 15 * 60; // 15 minutes
const DEFAULT_REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
}

function requireSecret(key: string): string {
  const value = requireEnv(key);
  if (value.length < 32) {
    throw new Error(`${key} must be at least 32 characters long`);
  }
  return value;
}

function warnIfPlaceholder(key: string, value: string): void {
  if (value.toLowerCase().includes('change_me') || value.toLowerCase().includes('change-me')) {
    console.warn(`WARNING: ${key} appears to be a placeholder. Set a strong secret before deploying.`);
  }
}

const jwtSecret = requireSecret('JWT_SECRET');
warnIfPlaceholder('JWT_SECRET', jwtSecret);

const jwtAccessSecret = requireSecret('JWT_ACCESS_SECRET');
warnIfPlaceholder('JWT_ACCESS_SECRET', jwtAccessSecret);

const jwtRefreshSecret = requireSecret('JWT_REFRESH_SECRET');
warnIfPlaceholder('JWT_REFRESH_SECRET', jwtRefreshSecret);

const databaseUrl = requireEnv('DATABASE_URL');
const redisUrl = requireEnv('REDIS_URL');

export const config: ServerConfig = {
  port: Number(process.env.PORT ?? 4000),
  host: process.env.HOST ?? '127.0.0.1',
  appUrl: process.env.APP_URL ?? 'http://localhost:3000',
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
  jwt: {
    secret: jwtSecret,
    accessSecret: jwtAccessSecret,
    refreshSecret: jwtRefreshSecret,
    accessTtlSeconds: Number(process.env.JWT_ACCESS_TTL_SECONDS ?? DEFAULT_ACCESS_TTL),
    refreshTtlSeconds: Number(process.env.JWT_REFRESH_TTL_SECONDS ?? DEFAULT_REFRESH_TTL),
    refreshCookieName: process.env.REFRESH_COOKIE_NAME ?? 'campus_refresh',
  },
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
  redisUrl,
  databaseUrl,
  minio: {
    endpoint: requireEnv('MINIO_ENDPOINT'),
    accessKey: requireEnv('MINIO_ACCESS_KEY'),
    secretKey: requireEnv('MINIO_SECRET_KEY'),
    bucket: process.env.MINIO_BUCKET ?? 'campus-materials',
  },
};
