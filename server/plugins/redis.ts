import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { redis, refreshKey } from '../redis.js';

export default fp(async function redisPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.decorate('redis', redis);
  fastify.decorate('refreshKey', refreshKey);
});
