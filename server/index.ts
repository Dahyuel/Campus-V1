import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { randomUUID } from 'node:crypto';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import facultyRoutes from './routes/faculty.js';
import adminRoutes from './routes/admin.js';
import jwtPlugin from './plugins/jwt.js';
import redisPlugin from './plugins/redis.js';
import corsPlugin from './plugins/cors.js';
import minioPlugin from './plugins/minio.js';
import rabbitMQPlugin from './plugins/rabbitmq.js';
import deptheadRoutes from './routes/depthead.js';
import deanRoutes from './routes/dean.js';
import taRoutes from './routes/ta.js';
import notificationRoutes from './routes/notifications.js';
import aiTutorRoutes from './routes/ai-tutor.js';
import studentMessagesRoutes from './routes/student-messages.js';
import studentCommunityRoutes from './routes/student-community.js';
import adminMessagesRoutes from './routes/admin-messages.js';
import smartScheduleRoutes from './routes/smart-schedule.js';
import todoRoutes from './routes/todos.js';
import recordingRoutes from './routes/recordings.js';
import internalRoutes from './routes/internal.js';
import avatarRoutes from './routes/avatars.js';
import multipart from '@fastify/multipart';
import { redis } from './redis.js';

async function main(): Promise<void> {
  const app = Fastify({
    logger: {
      level: 'info',
    },
  });

  // Security headers
  app.addHook('onSend', async (_request, reply, payload) => {
    reply.removeHeader('x-powered-by');
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header(
      'Content-Security-Policy',
      "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self'; " +
        "connect-src 'self' " +
        config.frontendOrigin +
        ' ' +
        config.appUrl +
        ';'
    );
    return payload;
  });

  await app.register(corsPlugin);

  await app.register(cookie, {
    parseOptions: {},
  });

  await app.register(multipart, {
    limits: { fileSize: 50 * 1024 * 1024 },
  });
  await app.register(jwtPlugin);
  await app.register(redisPlugin);
  await app.register(minioPlugin);
  await app.register(rabbitMQPlugin);

  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    redis,
    nameSpace: 'ratelimit:',
    keyGenerator: (request) => request.ip,
    // The plugin throws this object, so it must carry the status code or the
    // error handler turns it into a 500.
    errorResponseBuilder: (_req, context) => ({
      statusCode: context.statusCode,
      error: 'Too many requests',
      retryAfter: context.after,
    }),
  });

  await app.register(authRoutes, { prefix: '/' });

  await app.register(studentRoutes, { prefix: '/student' });
  await app.register(studentMessagesRoutes, { prefix: '/student' });
  await app.register(studentCommunityRoutes, { prefix: '/student' });

  await app.register(facultyRoutes, { prefix: '/faculty' });

  await app.register(taRoutes, { prefix: '/ta' });

  await app.register(adminRoutes, { prefix: '/admin' });
  await app.register(adminMessagesRoutes, { prefix: '/admin' });

  await app.register(deptheadRoutes, { prefix: '/depthead' });

  await app.register(deanRoutes, { prefix: '/dean' });

  await app.register(aiTutorRoutes, { prefix: '/ai' });

  await app.register(notificationRoutes, { prefix: '/notifications' });

  await app.register(smartScheduleRoutes, { prefix: '/schedule-ai' });
  await app.register(todoRoutes, { prefix: '/todos' });
  await app.register(recordingRoutes);
  await app.register(internalRoutes, { prefix: '/internal' });
  await app.register(avatarRoutes);

  app.get('/health', async (_request, reply) => {
    return reply.status(200).send({ status: 'ok' });
  });

  app.setErrorHandler((error: Error & { validation?: unknown; statusCode?: number; retryAfter?: string }, _request, reply) => {
    if (error.statusCode === 429) {
      return reply.status(429).send({ error: 'Too many requests', retryAfter: error.retryAfter });
    }

    const errorId = randomUUID();
    app.log.error({ err: { message: error.message, stack: error.stack }, errorId });

    if (error.validation) {
      return reply.status(400).send({ error: 'Bad request', errorId });
    }

    const statusCode = error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
    return reply.status(statusCode).send({ error: 'Internal server error', errorId });
  });

  try {
    await app.listen({ port: config.port, host: config.host });
    app.log.info(`Server listening on http://${config.host}:${config.port}`);
    app.log.info(`CORS configured for ${config.frontendOrigin || config.appUrl}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void main();
