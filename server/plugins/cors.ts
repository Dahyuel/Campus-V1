import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { FastifyInstance } from 'fastify';
import { config } from '../config.js';

function parseOrigin(origin: string): string | RegExp {
  if (origin.includes('*')) {
    return new RegExp(origin.replace(/\*/g, '.*'));
  }
  return origin;
}

export default fp(async function corsPlugin(fastify: FastifyInstance): Promise<void> {
  const allowedOrigin = config.frontendOrigin || config.appUrl;
  if (!allowedOrigin) {
    throw new Error('CORS origin is not configured. Set FRONTEND_ORIGIN or APP_URL.');
  }

  await fastify.register(cors, {
    origin: parseOrigin(allowedOrigin),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
});
