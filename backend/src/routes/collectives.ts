import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, collectives, memberships, templates, events, passes } from '../db/schema.js';
import { sendCustomEmail } from '../email.js';

export async function collectiveRoutes(fastify: FastifyInstance) {
  // Pre-handler hook for auth
  fastify.addHook('preHandler', fastify.authenticate);

  // GET /api/v1/collectives/mine
  fastify.get('/mine', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request.user as any).sub;

    try {
      const userMemberships = await db.select({
        collective: collectives
      })
      .from(memberships)
      .innerJoin(collectives, eq(memberships.collectiveId, collectives.id))
      .where(and(
        eq(memberships.userId, userId),
        eq(memberships.role, 'admin')
      ))
      .limit(1);

      if (userMemberships.length === 0) {
        return reply.status(404).send({
          error: { code: 'NOT_FOUND', message: 'No collective found for this administrator' }
        });
      }

      return reply.send({ data: userMemberships[0].collective });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve collective' }
      });
    }
  });

  // GET /api/v1/collectives/:id/members
  fastify.get('/:id/members', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: collectiveId } = request.params as any;

    try {
      const membersList = await db.select({
        id: users.id,
        displayName: users.displayName,
        email: users.email,
        phone: users.phone,
        role: memberships.role,
        status: memberships.status,
        joinedAt: memberships.joinedAt,
      })
      .from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(eq(memberships.collectiveId, collectiveId))
      // Stable, deterministic order (earliest joiners first). Without this,
      // Postgres may return rows in a different order after an UPDATE (e.g.
      // block/unblock), which would shuffle the list. A fixed order means an
      // unblocked member returns to exactly the position they held before.
      .orderBy(asc(memberships.joinedAt), asc(users.id));

      return reply.send({ data: membersList });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to list members' }
      });
    }
  });

  // POST /api/v1/collectives/:id/members
  fastify.post('/:id/members', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: collectiveId } = request.params as any;
    const { displayName, email, phone } = request.body as any;

    if (!displayName || !email) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'DisplayName and Email are required' }
      });
    }

    try {
      // Check if user already exists
      const cleanEmail = email.toLowerCase().trim();
      const existingUsers = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);

      let targetUser = existingUsers[0];

      if (targetUser) {
        // User exists, check if already in collective
        const existingMemberships = await db.select().from(memberships).where(and(
          eq(memberships.userId, targetUser.id),
          eq(memberships.collectiveId, collectiveId)
        )).limit(1);

        if (existingMemberships.length > 0) {
          return reply.status(409).send({
            error: { code: 'DUPLICATE_MEMBERSHIP', message: 'User is already a member of this collective' }
          });
        }
      }

      // Add to database
      const result = await db.transaction(async (tx) => {
        if (!targetUser) {
          const [newUser] = await tx.insert(users).values({
            email: cleanEmail,
            displayName: displayName.trim(),
            phone: phone ? phone.trim() : null,
            role: 'member',
          }).returning();
          targetUser = newUser;
        }

        const [newMembership] = await tx.insert(memberships).values({
          userId: targetUser.id,
          collectiveId,
          role: 'member',
          status: 'active',
        }).returning();

        return {
          id: targetUser.id,
          displayName: targetUser.displayName,
          email: targetUser.email,
          phone: targetUser.phone,
          role: newMembership.role,
          status: newMembership.status,
          joinedAt: newMembership.joinedAt,
        };
      });

      return reply.status(201).send({ data: result });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to add member' }
      });
    }
  });

  // PATCH /api/v1/collectives/:id/members/:uid
  fastify.patch('/:id/members/:uid', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: collectiveId, uid: userId } = request.params as any;
    const { status } = request.body as any;

    if (!status || !['active', 'blocked'].includes(status)) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Status must be active or blocked' }
      });
    }

    try {
      const updated = await db.update(memberships)
        .set({ status })
        .where(and(
          eq(memberships.userId, userId),
          eq(memberships.collectiveId, collectiveId)
        ))
        .returning();

      if (updated.length === 0) {
        return reply.status(404).send({
          error: { code: 'NOT_FOUND', message: 'Membership not found' }
        });
      }

      return reply.send({ data: updated[0] });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update member status' }
      });
    }
  });

  // GET /api/v1/collectives/:id/templates
  fastify.get('/:id/templates', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: collectiveId } = request.params as any;

    try {
      const defaultTemplates = [
        { name: 'Announcement', subject: "you're on the list — {event}", body: "<p>{event} is happening.</p><p>{date} · {time}<br>{venue}</p><p>watch your inbox — your entry pass and the address drop closer to the date.</p><p>— {collective}</p>" },
        { name: 'Pass Sent', subject: 'your pass for {event} is live', body: "<p>you're in for {event}.</p><p>{date} · {time}</p><p>your entry pass is now in the M3hfil app under PASSES. present the QR at the door — it's non-transferable and the code rotates.</p><p>— {collective}</p>" },
        { name: 'Address Reveal', subject: '{event}: the address', body: "<p>{event}.</p><p>{date} · {time}<br>{venue}</p><p>doors are tight — arrive early. no phones on the floor.</p><p>— {collective}</p>" },
        { name: 'Reminder', subject: 'tonight: {event}', body: "<p>quick reminder — {event} is tonight.</p><p>{date} · {time}<br>{venue}</p><p>bring your pass. see you on the floor.</p><p>— {collective}</p>" },
        { name: 'Cancellation', subject: '{event}: cancelled', body: "<p>{event} ({date} · {time}) has been cancelled.</p><p>any issued passes are now void. we'll be back soon — keep an eye on your inbox.</p><p>— {collective}</p>" },
      ];

      let dbTemplates = await db.select().from(templates).where(eq(templates.collectiveId, collectiveId));
      if (dbTemplates.length === 0) {
        dbTemplates = await db.insert(templates).values(
          defaultTemplates.map(t => ({
            collectiveId,
            name: t.name,
            subject: t.subject,
            body: t.body,
          }))
        ).returning();
      }

      return reply.send({ data: dbTemplates });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve templates' }
      });
    }
  });

  // POST /api/v1/collectives/:id/templates
  fastify.post('/:id/templates', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: collectiveId } = request.params as any;
    const { name, subject, body } = request.body as any;

    if (!name || !subject || !body) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Name, Subject, and Body are required' }
      });
    }

    try {
      const [newTemplate] = await db.insert(templates).values({
        collectiveId,
        name: name.trim(),
        subject: subject.trim(),
        body: body.trim(),
      }).returning();

      return reply.status(201).send({ data: newTemplate });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create template' }
      });
    }
  });

  // PATCH /api/v1/collectives/:id/templates/:templateId
  fastify.patch('/:id/templates/:templateId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: collectiveId, templateId } = request.params as any;
    const { name, subject, body } = request.body as any;

    try {
      const updated = await db.update(templates)
        .set({
          ...(name !== undefined && { name: name.trim() }),
          ...(subject !== undefined && { subject: subject.trim() }),
          ...(body !== undefined && { body: body.trim() }),
          updatedAt: new Date(),
        })
        .where(and(
          eq(templates.id, templateId),
          eq(templates.collectiveId, collectiveId)
        ))
        .returning();

      if (updated.length === 0) {
        return reply.status(404).send({
          error: { code: 'NOT_FOUND', message: 'Template not found' }
        });
      }

      return reply.send({ data: updated[0] });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update template' }
      });
    }
  });

  // DELETE /api/v1/collectives/:id/templates/:templateId
  fastify.delete('/:id/templates/:templateId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: collectiveId, templateId } = request.params as any;

    try {
      const deleted = await db.delete(templates)
        .where(and(
          eq(templates.id, templateId),
          eq(templates.collectiveId, collectiveId)
        ))
        .returning();

      if (deleted.length === 0) {
        return reply.status(404).send({
          error: { code: 'NOT_FOUND', message: 'Template not found' }
        });
      }

      return reply.send({ data: { id: templateId } });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete template' }
      });
    }
  });

  // POST /api/v1/collectives/:id/email/send
  fastify.post('/:id/email/send', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: collectiveId } = request.params as any;
    const { subject, bodyHtml, recipientGroup, eventId } = request.body as any;

    if (!subject || !bodyHtml || !recipientGroup || !eventId) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Subject, bodyHtml, recipientGroup, and eventId are required' }
      });
    }

    try {
      // 1. Fetch event and collective details for token replacement
      const [eventDetail] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
      const [col] = await db.select().from(collectives).where(eq(collectives.id, collectiveId)).limit(1);

      if (!eventDetail || !col) {
        return reply.status(404).send({
          error: { code: 'NOT_FOUND', message: 'Event or Collective not found' }
        });
      }

      const vars: Record<string, string> = {
        event: eventDetail.name,
        date: eventDetail.date,
        time: eventDetail.time,
        venue: eventDetail.venue,
        collective: col.name,
      };

      const replaceTokens = (str: string) => {
        return str.replace(/\{(\w+)\}/g, (_, key: string) => (vars[key] != null ? vars[key] : `{${key}}`));
      };

      // Compile final subject and body html
      const finalSubject = replaceTokens(subject);
      const finalBodyHtml = replaceTokens(bodyHtml);

      // Create a plaintext fallback by stripping HTML tag patterns
      const finalBodyText = finalBodyHtml
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '');

      // 2. Fetch eligible active members
      const activeMembers = await db.select({
        id: users.id,
        email: users.email,
        displayName: users.displayName
      })
      .from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(and(
        eq(memberships.collectiveId, collectiveId),
        eq(memberships.status, 'active')
      ));

      // 3. Filter based on recipientGroup
      let recipients = activeMembers;
      if (recipientGroup !== 'ALL') {
        const eventPasses = await db.select({
          userId: passes.userId
        })
        .from(passes)
        .where(and(
          eq(passes.eventId, eventId),
          eq(passes.status, 'issued')
        ));
        const passHolderUserIds = eventPasses.map(p => p.userId);

        if (recipientGroup === 'SENT') {
          recipients = activeMembers.filter(m => passHolderUserIds.includes(m.id));
        } else if (recipientGroup === 'NOT_SENT') {
          recipients = activeMembers.filter(m => !passHolderUserIds.includes(m.id));
        }
      }

      // Filter out empty/invalid emails
      const emailRecipients = recipients.filter(m => m.email && m.email.includes('@'));

      if (emailRecipients.length === 0) {
        return reply.send({ data: { sentCount: 0, status: 'no_recipients' } });
      }

      // 4. Send emails (sending in parallel or sequential, in dev mode SMTP logs)
      let sentCount = 0;
      let errorCount = 0;
      let lastError: string | undefined;

      // Wrap inside HTML layout matching M3HFIL aesthetics
      const styledHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="dark">
  </head>
  <body style="margin:0;padding:0;background:#000000;color:#e8e8e8;font-family:'Helvetica Neue',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#000000" style="background:#000000;">
      <tr>
        <td align="center" bgcolor="#000000" style="padding:32px 16px;background:#000000;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0d0d0d" style="max-width:480px;background:#0d0d0d;border:1px solid #1a1a1a;">
            <tr>
              <td style="padding:24px 28px;border-bottom:1px solid #1a1a1a;">
                <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;font-size:18px;letter-spacing:6px;color:#e8e8e8;">M<span style="color:#00ff41;">3</span>HFIL</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;font-size:14px;line-height:1.6;color:#a0a0a0;">
                ${finalBodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;border-top:1px solid #1a1a1a;">
                <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:2px;color:#333333;">PRIVATE EVENT · CURATED ACCESS</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

      for (const recipient of emailRecipients) {
        const result = await sendCustomEmail({
          to: recipient.email,
          subject: finalSubject,
          html: styledHtml,
          text: finalBodyText,
        });

        if (result.sent || !result.configured) {
          sentCount++;
        } else {
          errorCount++;
          lastError = result.error;
        }
      }

      return reply.send({
        data: {
          sentCount,
          errorCount,
          totalEligible: emailRecipients.length,
          lastError,
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to send template email' }
      });
    }
  });
}

