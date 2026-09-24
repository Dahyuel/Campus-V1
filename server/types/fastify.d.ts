import 'fastify';
import '@fastify/jwt';
import { PublicUser } from '../types.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    namespaces: 'access' | 'refresh';
    user: PublicUser;
  }
}

export {};
