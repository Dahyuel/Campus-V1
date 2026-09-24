import { FastifyRequest } from 'fastify';
import { RoleType } from '../src/types.js';

// AUDIT-FIX: single shared declaration of the authenticated request shape.
export interface AuthenticatedRequest extends FastifyRequest {
  user: PublicUser;
}

export interface PublicUser {
  id: string;
  name: string;
  role: string;
  roleType: RoleType;
  email: string;
  codeId: string;
  avatarUrl: string;
  messageBadge?: number;
}

export interface SeededUser extends PublicUser {
  username: string;
  passwordHash: string;
  isActive?: boolean;
}

export interface AccessTokenPayload {
  sub: string;
  roleType: RoleType;
  jti: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

export interface LoginBody {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: PublicUser;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface ErrorResponse {
  error: string;
}

export interface JwtConfig {
  secret: string;
  accessSecret: string;
  refreshSecret: string;
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
  refreshCookieName: string;
}

export interface ServerConfig {
  port: number;
  host: string;
  appUrl: string;
  frontendOrigin: string;
  jwt: JwtConfig;
  bcryptRounds: number;
  redisUrl: string;
  databaseUrl: string;
  minio: MinioConfig;
}

export interface MinioConfig {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
}
