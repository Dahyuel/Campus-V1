import { Redis } from 'ioredis';
import { config } from './config.js';

const client = new Redis(config.redisUrl, {
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
});

client.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

export const redis = client;

export function refreshKey(jti: string): string {
  return `refresh:${jti}`;
}

export function refreshFamilyKey(jti: string): string {
  return `refresh_family:${jti}`;
}

export function revokedFamilyKey(jti: string): string {
  return `refresh_revoked:${jti}`;
}
