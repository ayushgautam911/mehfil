import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, collectives, memberships } from '../db/schema.js';

export async function authRoutes(fastify: FastifyInstance) {
  // POST /api/v1/auth/signup
  fastify.post('/signup', async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password, displayName, collectiveName, collectiveHandle, location, founded } = request.body as any;

    if (!email || !password || !collectiveName || !collectiveHandle) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Missing required signup fields' }
      });
    }

    // Display name is no longer collected on the form — default it to the
    // part of the email before the '@' (column is NOT NULL in the schema).
    const resolvedDisplayName = displayName?.trim() || email.split('@')[0];

    try {
      // Check if email already registered
      const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
      if (existingUser.length > 0) {
        return reply.status(409).send({
          error: { code: 'DUPLICATE_USER', message: 'User with this email already exists' }
        });
      }

      // Check if collective handle already exists
      const cleanHandle = collectiveHandle.startsWith('@') ? collectiveHandle : `@${collectiveHandle.toLowerCase().trim()}`;
      const existingCollective = await db.select().from(collectives).where(eq(collectives.handle, cleanHandle)).limit(1);
      if (existingCollective.length > 0) {
        return reply.status(409).send({
          error: { code: 'DUPLICATE_COLLECTIVE', message: 'Collective handle is already taken' }
        });
      }

      // Hash password and perform transaction
      const passwordHash = await bcrypt.hash(password, 10);
      const result = await db.transaction(async (tx) => {
        const [newUser] = await tx.insert(users).values({
          email: email.toLowerCase().trim(),
          displayName: resolvedDisplayName,
          passwordHash,
          role: 'admin',
        }).returning();

        const [newCollective] = await tx.insert(collectives).values({
          name: collectiveName.trim(),
          handle: cleanHandle,
          location: (location || '').trim(),
          founded: (founded || '').trim(),
        }).returning();

        await tx.insert(memberships).values({
          userId: newUser.id,
          collectiveId: newCollective.id,
          role: 'admin',
          status: 'active',
        });

        return { user: newUser, collective: newCollective };
      });

      const token = fastify.jwt.sign({ sub: result.user.id, email: result.user.email });

      return reply.status(201).send({
        data: {
          token,
          user: {
            id: result.user.id,
            email: result.user.email,
            displayName: result.user.displayName,
          },
          collective: result.collective
        }
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create account' }
      });
    }
  });

  // POST /api/v1/auth/login
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
      });
    }

    try {
      const usersFound = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
      const user = usersFound[0];

      if (!user || !user.passwordHash) {
        return reply.status(401).send({
          error: { code: 'TOKEN_INVALID', message: 'Invalid email or password' }
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return reply.status(401).send({
          error: { code: 'TOKEN_INVALID', message: 'Invalid email or password' }
        });
      }

      // Fetch collective
      const userMemberships = await db.select({
        collective: collectives
      })
      .from(memberships)
      .innerJoin(collectives, eq(memberships.collectiveId, collectives.id))
      .where(eq(memberships.userId, user.id))
      .limit(1);

      const token = fastify.jwt.sign({ sub: user.id, email: user.email });

      return reply.send({
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
          },
          collective: userMemberships[0]?.collective || null
        }
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to log in' }
      });
    }
  });
}
