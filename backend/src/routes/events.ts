import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { events, passes } from '../db/schema.js';
import { config } from '../config.js';

// Trim an incoming array to non-empty strings, or null if not a usable list.
const cleanList = (v: unknown): string[] | null => {
  if (!Array.isArray(v)) return null;
  const items = v.map((s) => String(s).trim()).filter(Boolean);
  return items.length ? items : null;
};

// Parse an incoming reveal value to a real Date, or null if absent/unparseable.
const parseReveal = (v: unknown): Date | null => {
  if (!v) return null;
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? null : d;
};

// Accept only image URLs that point at our own GCS bucket (as returned by the
// upload endpoint) — anything else is dropped rather than stored.
const cleanImageUrl = (v: unknown): string | null => {
  if (typeof v !== 'string') return null;
  const url = v.trim();
  if (!url) return null;
  return url.startsWith(`https://storage.googleapis.com/${config.GCS_EVENT_IMAGES_BUCKET}/`) ? url : null;
};

export async function eventRoutes(fastify: FastifyInstance) {
  // Pre-handler hook for auth
  fastify.addHook('preHandler', fastify.authenticate);

  // GET /api/v1/collectives/:id/events
  fastify.get('/:id/events', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: collectiveId } = request.params as any;

    try {
      const eventsList = await db.select()
        .from(events)
        .where(eq(events.collectiveId, collectiveId))
        .orderBy(desc(events.createdAt));

      if (eventsList.length === 0) {
        return reply.send({ data: [] });
      }

      const eventIds = eventsList.map((e) => e.id);
      
      // Fetch all passes for these events
      const passesList = await db.select({
        eventId: passes.eventId,
        userId: passes.userId,
        qrToken: passes.qrToken,
        qrSignature: passes.qrSignature,
        status: passes.status,
        usedAt: passes.usedAt,
      })
      .from(passes)
      .where(inArray(passes.eventId, eventIds));

      // Group passes by event ID
      const passMap: Record<string, string[]> = {};
      for (const p of passesList) {
        if (!passMap[p.eventId]) {
          passMap[p.eventId] = [];
        }
        passMap[p.eventId].push(p.userId);
      }

      // Map back to events
      const result = eventsList.map((e) => ({
        ...e,
        passHolders: passMap[e.id] || [],
        passes: passesList.filter((p) => p.eventId === e.id),
      }));

      return reply.send({ data: result });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to list events' }
      });
    }
  });

  // POST /api/v1/collectives/:id/events
  fastify.post('/:id/events', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: collectiveId } = request.params as any;
    const { name, date, time, endTime, venue, venueAddress, status, capacity, description, imageUrl, addressRevealAt, lineup, genres } = request.body as any;

    if (!name || !date || !time || !venue || capacity === undefined) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Missing required event fields' }
      });
    }

    const eventStatus = status || 'draft';
    if (!['published', 'draft'].includes(eventStatus)) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Status must be published or draft' }
      });
    }

    const parsedCap = parseInt(capacity);
    if (Number.isNaN(parsedCap) || parsedCap <= 0) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Capacity must be a positive number' }
      });
    }

    try {
      const [newEvent] = await db.insert(events).values({
        collectiveId,
        name: name.trim(),
        date: date.trim(),
        time: time.trim(),
        endTime: (typeof endTime === 'string' && endTime.trim()) || null,
        venue: venue.trim(),
        venueAddress: (typeof venueAddress === 'string' && venueAddress.trim()) || null,
        status: eventStatus,
        capacity: parsedCap,
        description: description?.trim() || null,
        imageUrl: cleanImageUrl(imageUrl),
        addressRevealAt: parseReveal(addressRevealAt),
        lineup: cleanList(lineup),
        genres: cleanList(genres),
      }).returning();

      return reply.status(201).send({ data: newEvent });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create event' }
      });
    }
  });

  // PATCH /api/v1/collectives/:id/events/:eventId — edit an existing event's details
  fastify.patch('/:id/events/:eventId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: collectiveId, eventId } = request.params as any;
    const { name, date, time, endTime, venue, venueAddress, status, capacity, description, imageUrl, addressRevealAt, lineup, genres } = request.body as any;

    if (!name || !date || !time || !venue || capacity === undefined) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Missing required event fields' }
      });
    }

    try {
      // Event must exist and belong to this collective.
      const existing = await db.select().from(events)
        .where(and(eq(events.id, eventId), eq(events.collectiveId, collectiveId)))
        .limit(1);
      const ev = existing[0];
      if (!ev) {
        return reply.status(404).send({
          error: { code: 'NOT_FOUND', message: 'Event not found' }
        });
      }

      const eventStatus = status || ev.status;
      if (!['published', 'draft'].includes(eventStatus)) {
        return reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: 'Status must be published or draft' }
        });
      }

      // Capacity must be a positive number and can't drop below the passes
      // already issued. (parseInt(...) || fallback would wrongly treat 0 as
      // "unset", so parse explicitly.)
      const parsedCap = parseInt(capacity);
      const capNum = Number.isNaN(parsedCap) ? ev.capacity : parsedCap;
      if (capNum <= 0) {
        return reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: 'Capacity must be a positive number' }
        });
      }
      if (capNum < ev.passesIssued) {
        return reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: `Capacity cannot be below passes already issued (${ev.passesIssued})` }
        });
      }

      const [updated] = await db.update(events).set({
        name: name.trim(),
        date: date.trim(),
        time: time.trim(),
        endTime: (typeof endTime === 'string' && endTime.trim()) || null,
        venue: venue.trim(),
        venueAddress: (typeof venueAddress === 'string' && venueAddress.trim()) || null,
        status: eventStatus,
        capacity: capNum,
        description: description?.trim() || null,
        imageUrl: cleanImageUrl(imageUrl),
        addressRevealAt: parseReveal(addressRevealAt),
        lineup: cleanList(lineup),
        genres: cleanList(genres),
        updatedAt: new Date(),
      })
        .where(and(eq(events.id, eventId), eq(events.collectiveId, collectiveId)))
        .returning();

      return reply.send({ data: updated });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update event' }
      });
    }
  });
}
