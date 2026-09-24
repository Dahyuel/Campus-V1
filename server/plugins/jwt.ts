import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import { config } from '../config.js';

export default fp(async function jwtPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(jwt, {
    namespace: 'access',
    secret: config.jwt.accessSecret,
    sign: { expiresIn: config.jwt.accessTtlSeconds, algorithm: 'HS256' },
    verify: { algorithms: ['HS256'] },
  });

  await fastify.register(jwt, {
    namespace: 'refresh',
    secret: config.jwt.refreshSecret,
    sign: { expiresIn: config.jwt.refreshTtlSeconds, algorithm: 'HS256' },
    verify: { algorithms: ['HS256'] },
  });
});
