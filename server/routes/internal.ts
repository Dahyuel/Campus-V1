import { FastifyInstance } from 'fastify';
import { QdrantClient } from '@qdrant/js-client-rest';
import { getEmbedding, ensureCourseCollection } from '../lib/rag.js';

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL ?? 'http://localhost:6333' });

interface IndexChunkBody {
  recordingId: string;
  courseCode: string;
  text: string;
  startTime: number;
  endTime: number;
  source: string;
}

export default async function internalRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/rag/index-chunk', async (request, reply) => {
    const secret = request.headers['x-internal-secret'];
    const expected = process.env.INTERNAL_SECRET;
    if (expected && secret !== expected) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const body = request.body as IndexChunkBody;
    if (!body?.recordingId || !body?.text || !body?.courseCode) {
      return reply.status(400).send({ error: 'Bad request' });
    }

    const embedding = await getEmbedding(body.text);
    const collectionName = `course_${body.courseCode.toLowerCase().replace(/-/g, '_')}`;
    await ensureCourseCollection(collectionName);

    const minutes = Math.floor(body.startTime / 60);
    const seconds = String(Math.round(body.startTime % 60)).padStart(2, '0');

    await qdrant.upsert(collectionName, {
      points: [
        {
          id: `rec_${body.recordingId}_${Math.round(body.startTime)}`,
          vector: embedding,
          payload: {
            text: body.text,
            source: 'lecture_recording',
            recordingId: body.recordingId,
            lectureLabel: `Recording at ${minutes}:${seconds}`,
            slideNum: Math.round(body.startTime),
          },
        },
      ],
    });

    return reply.status(200).send({ ok: true });
  });
}