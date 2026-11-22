import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { config } from './config.js';
import { authRoutes } from './routes/auth.js';
import { collectiveRoutes } from './routes/collectives.js';
import { eventRoutes } from './routes/events.js';
import { passRoutes } from './routes/passes.js';
import { uploadRoutes } from './routes/uploads.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const server = Fastify({
  logger: true,
});

// Configure CORS
await server.register(cors, {
  origin: '*',
});

// Configure JWT
await server.register(jwt, {
  secret: config.JWT_SECRET,
});

// Multipart uploads (event images)
await server.register(multipart);

// Register authenticate decorator
server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({
      error: { code: 'TOKEN_INVALID', message: 'Unauthorized or invalid token' }
    });
  }
});

// Register API routes
await server.register(authRoutes, { prefix: '/api/v1/auth' });
await server.register(collectiveRoutes, { prefix: '/api/v1/collectives' });
await server.register(eventRoutes, { prefix: '/api/v1/collectives' });
await server.register(passRoutes, { prefix: '/api/v1' });
await server.register(uploadRoutes, { prefix: '/api/v1/uploads' });

// Health check endpoint
server.get('/health', async () => {
  return { status: 'OK' };
});

const start = async () => {
  try {
    await server.listen({ port: config.PORT, host: '0.0.0.0' });
    console.log(`Server listening on port ${config.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
