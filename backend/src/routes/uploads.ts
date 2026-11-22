import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { imageStorageConfigured, validateEventImage, uploadEventImage, MAX_IMAGE_BYTES } from '../storage.js';

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  // POST /api/v1/uploads/event-image — multipart upload of one image file.
  // Returns { data: { url } }; the client then sets that URL as the event's
  // imageUrl on create/edit.
  fastify.post('/event-image', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!imageStorageConfigured) {
      return reply.status(503).send({
        error: { code: 'NOT_CONFIGURED', message: 'Image storage is not configured on this server (set GCS_EVENT_IMAGES_BUCKET)' }
      });
    }

    const file = await (request as any).file({ limits: { fileSize: MAX_IMAGE_BYTES } });
    if (!file) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'No file provided' }
      });
    }

    let buffer: Buffer;
    try {
      buffer = await file.toBuffer();
    } catch {
      // @fastify/multipart throws once the stream exceeds the size limit.
      return reply.status(413).send({
        error: { code: 'VALIDATION_ERROR', message: `Image is too large — max ${MAX_IMAGE_BYTES / (1024 * 1024)} MB` }
      });
    }

    const invalid = validateEventImage(file.mimetype, buffer.length);
    if (invalid) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: invalid }
      });
    }

    try {
      const url = await uploadEventImage(buffer, file.mimetype);
      return reply.status(201).send({ data: { url } });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to store image' }
      });
    }
  });
}
