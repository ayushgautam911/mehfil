import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { eq, and, sql, lt } from 'drizzle-orm';
import { db } from '../db/index.js';
import { events, passes, users, memberships } from '../db/schema.js';
import { sendPassEmail, emailConfigured } from '../email.js';
import { generateQrToken, signQrToken, verifyQrPayload } from '../qr.js';

export async function passRoutes(fastify: FastifyInstance) {
  // GET /api/v1/passes/:id - Public route to view pass details and display QR
  fastify.get('/passes/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: passId } = request.params as any;

    try {
      const passRecords = await db.select({
        pass: passes,
        user: users,
        event: events
      })
      .from(passes)
      .innerJoin(users, eq(passes.userId, users.id))
      .innerJoin(events, eq(passes.eventId, events.id))
      .where(eq(passes.id, passId))
      .limit(1);

      const record = passRecords[0];
      if (!record) {
        return reply.status(404).send({
          error: { code: 'NOT_FOUND', message: 'Pass not found' }
        });
      }

      const qrPayload = `${record.pass.qrToken}:${record.pass.qrSignature}`;

      return reply.send({
        data: {
          id: record.pass.id,
          status: record.pass.status,
          issuedAt: record.pass.issuedAt,
          usedAt: record.pass.usedAt,
          qrPayload,
          user: {
            displayName: record.user.displayName,
            email: record.user.email,
          },
          event: {
            id: record.event.id,
            name: record.event.name,
            date: record.event.date,
            time: record.event.time,
            venue: record.event.venue,
          }
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve pass' }
      });
    }
  });

  // Protected routes below
  fastify.register(async (protectedContext) => {
    protectedContext.addHook('preHandler', fastify.authenticate);

    // POST /api/v1/events/:id/passes/send - Send/Issue pass to a member
    protectedContext.post('/events/:id/passes/send', async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: eventId } = request.params as any;
      const { memberId } = request.body as any;

      if (!memberId) {
        return reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: 'MemberId is required' }
        });
      }

      try {
        // 1. Verify event exists
        const eventRecords = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
        const event = eventRecords[0];
        if (!event) {
          return reply.status(404).send({
            error: { code: 'NOT_FOUND', message: 'Event not found' }
          });
        }

        // 2. Verify member belongs to collective and is active (not blocked)
        const membershipRecords = await db.select().from(memberships)
          .where(and(
            eq(memberships.userId, memberId),
            eq(memberships.collectiveId, event.collectiveId)
          ))
          .limit(1);
        
        const membership = membershipRecords[0];
        if (!membership) {
          return reply.status(403).send({
            error: { code: 'INSUFFICIENT_ROLE', message: 'User is not a member of this collective' }
          });
        }
        if (membership.status === 'blocked') {
          return reply.status(403).send({
            error: { code: 'MEMBER_BLOCKED', message: 'Member is blocked' }
          });
        }

        // 3. Perform atomic capacity check + pass issuance inside transaction
        const result = await db.transaction(async (tx) => {
          // Increment event passes_issued and verify capacity
          const updatedEvents = await tx.update(events)
            .set({ passesIssued: sql`${events.passesIssued} + 1` })
            .where(and(
              eq(events.id, eventId),
              lt(events.passesIssued, events.capacity)
            ))
            .returning();

          if (updatedEvents.length === 0) {
            throw new Error('EVENT_AT_CAPACITY');
          }

          // Generate secure QR token & signature
          const qrToken = generateQrToken();
          const qrSignature = signQrToken(qrToken);

          // Insert pass
          const [newPass] = await tx.insert(passes).values({
            userId: memberId,
            eventId,
            status: 'issued',
            qrToken,
            qrSignature,
          }).returning();

          return newPass;
        });

        // 4. Email the pass to the member. Failures here must not roll back the
        //    issued pass — report status instead.
        const memberRecords = await db.select({
          email: users.email,
          displayName: users.displayName,
        }).from(users).where(eq(users.id, memberId)).limit(1);
        const member = memberRecords[0];

        let emailStatus: { configured: boolean; sent: boolean; error?: string } = {
          configured: emailConfigured,
          sent: false,
        };
        if (member?.email) {
          emailStatus = await sendPassEmail({
            to: member.email,
            memberName: member.displayName,
            qrPayload: `${result.qrToken}:${result.qrSignature}`,
            event: { name: event.name, date: event.date, time: event.time, venue: event.venue },
          });
        } else {
          emailStatus.error = 'no_email_on_file';
        }

        return reply.status(201).send({
          data: {
            ...result,
            email: { to: member?.email ?? null, ...emailStatus },
          },
        });
      } catch (error: any) {
        if (error.message === 'EVENT_AT_CAPACITY') {
          return reply.status(409).send({
            error: { code: 'EVENT_AT_CAPACITY', message: 'This event has reached maximum capacity.' }
          });
        }

        // Handle unique constraint violation (member already has active pass for this event)
        if (error.code === '23505') {
          return reply.status(409).send({
            error: { code: 'DUPLICATE_PASS_REQUEST', message: 'User has already been issued a pass for this event' }
          });
        }

        fastify.log.error(error);
        return reply.status(500).send({
          error: { code: 'INTERNAL_ERROR', message: 'Failed to issue pass' }
        });
      }
    });

    // POST /api/v1/passes/scan - Gate ticket scan
    protectedContext.post('/passes/scan', async (request: FastifyRequest, reply: FastifyReply) => {
      const { qrPayload } = request.body as any;

      // 1. Validate format + signature (constant-time) via the shared util
      const verification = verifyQrPayload(qrPayload);
      if (verification.reason === 'malformed') {
        return reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: 'Invalid QR payload format' }
        });
      }
      if (!verification.valid || !verification.token) {
        return reply.status(400).send({
          error: { code: 'INVALID_QR', message: 'Invalid QR signature' }
        });
      }
      const qrToken = verification.token;

      try {
        // 2. Fetch pass (+ event so we know which collective to check blocks in)
        const passRecords = await db.select({
          pass: passes,
          user: users,
          event: events
        })
        .from(passes)
        .innerJoin(users, eq(passes.userId, users.id))
        .innerJoin(events, eq(passes.eventId, events.id))
        .where(eq(passes.qrToken, qrToken))
        .limit(1);

        const record = passRecords[0];
        if (!record) {
          return reply.status(404).send({
            error: { code: 'INVALID_QR', message: 'Pass not found' }
          });
        }

        const pass = record.pass;

        // 3. Check status
        if (pass.status === 'used') {
          return reply.status(409).send({
            error: {
              code: 'ALREADY_SCANNED',
              message: 'This pass has already been scanned.',
              details: { scanned_at: pass.usedAt }
            }
          });
        }

        if (pass.status !== 'issued') {
          return reply.status(409).send({
            error: { code: 'PASS_NOT_VALID', message: `Pass is in ${pass.status} state` }
          });
        }

        // 3b. Deny entry if the member is blocked in this event's collective.
        //     The pass is NOT consumed here — once the member is unblocked the
        //     same (still 'issued') pass admits again, and single-use still holds.
        const membershipRecords = await db.select({ status: memberships.status })
          .from(memberships)
          .where(and(
            eq(memberships.userId, pass.userId),
            eq(memberships.collectiveId, record.event.collectiveId)
          ))
          .limit(1);

        const membership = membershipRecords[0];
        if (!membership || membership.status === 'blocked') {
          return reply.status(403).send({
            error: { code: 'ACCESS_DENIED', message: 'Access denied — member is blocked.' }
          });
        }

        // 4. Mark as used atomically
        const updated = await db.update(passes)
          .set({ status: 'used', usedAt: new Date() })
          .where(and(
            eq(passes.id, pass.id),
            eq(passes.status, 'issued')
          ))
          .returning();

        if (updated.length === 0) {
          return reply.status(409).send({
            error: { code: 'ALREADY_SCANNED', message: 'Pass checked in concurrently.' }
          });
        }

        return reply.send({
          data: {
            valid: true,
            memberName: record.user.displayName,
            eventId: pass.eventId,
            scannedAt: updated[0].usedAt,
          }
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: { code: 'INTERNAL_ERROR', message: 'Scan validation failed' }
        });
      }
    });
  });
}
