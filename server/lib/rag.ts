import OpenAI from 'openai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { createHash } from 'node:crypto';
import { query } from '../db/client.js';

const openaiClient = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL,
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL ?? 'http://localhost:6333' });

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const res = await openaiClient.embeddings.create({
      model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
      input: text,
    });
    return res.data[0].embedding;
  } catch {
    // Fallback: return a 1536-dim zero vector with a small deterministic perturbation
    const vec = new Array(1536).fill(0);
    for (let i = 0; i < text.length && i < 1536; i++) {
      vec[i] = text.charCodeAt(i) / 1000;
    }
    return vec;
  }
}

export async function ensureCourseCollection(courseCode: string): Promise<string> {
  const collectionName = `course_${courseCode.toLowerCase().replace(/-/g, '_')}`;
  const existsRes = await qdrant.collectionExists(collectionName);
  if (!existsRes.exists) {
    await qdrant.createCollection(collectionName, {
      vectors: { size: 1536, distance: 'Cosine' },
    });
  }
  return collectionName;
}

function deterministicPointId(materialId: string, chunkIndex: number): string {
  const hash = createHash('sha1').update(`${materialId}:${chunkIndex}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

interface SyntheticChunk {
  text: string;
  lectureLabel: string;
  slideNum: number;
}

function generateSyntheticChunks(fileName: string, courseCode: string): SyntheticChunk[] {
  const lectureMatch = fileName.match(/[Ll]ecture(\d+)/);
  const lectureNum = lectureMatch ? parseInt(lectureMatch[1]) : 1;
  const topic = fileName
    .replace(/[_\-]/g, ' ')
    .replace(/\.pdf/g, '')
    .replace(/CS\d+/g, '')
    .replace(/MATH\d+/g, '')
    .replace(/ENG\d+/g, '')
    .trim();

  return [
    { text: `${topic}: introduction and motivation. Key concepts covered in this lecture.`, lectureLabel: `Lecture ${lectureNum}`, slideNum: 1 },
    { text: `${topic}: core algorithm and implementation details. Time complexity analysis.`, lectureLabel: `Lecture ${lectureNum}`, slideNum: 6 },
    { text: `${topic}: worked examples and edge cases. Common pitfalls and how to avoid them.`, lectureLabel: `Lecture ${lectureNum}`, slideNum: 12 },
  ];
}

export async function indexMaterial(material: {
  id: string;
  courseCode: string;
  fileName: string;
  fileKey: string;
}): Promise<void> {
  const collectionName = await ensureCourseCollection(material.courseCode);
  const chunks = generateSyntheticChunks(material.fileName, material.courseCode);

  const points = await Promise.all(
    chunks.map(async (chunk, i) => ({
      id: deterministicPointId(material.id, i),
      vector: await getEmbedding(chunk.text),
      payload: {
        materialId: material.id,
        courseCode: material.courseCode,
        text: chunk.text,
        lectureLabel: chunk.lectureLabel,
        slideNum: chunk.slideNum,
      },
    }))
  );

  await qdrant.upsert(collectionName, { points });

  await query(
    'INSERT INTO rag_index_log (material_id, chunk_count) VALUES ($1, $2) ON CONFLICT (material_id) DO UPDATE SET indexed_at = NOW(), chunk_count = $2',
    [material.id, points.length]
  );
}

export async function queryQdrant(
  courseCode: string,
  embedding: number[],
  topK = 3
): Promise<Array<{ text: string; metadata: { lectureLabel: string; slideNum: number }; score: number }>> {
  try {
    const collectionName = `course_${courseCode.toLowerCase().replace(/-/g, '_')}`;
    const existsRes = await qdrant.collectionExists(collectionName);
    if (!existsRes.exists) return [];

    const response = await qdrant.query(collectionName, {
      query: { nearest: embedding },
      limit: topK,
      with_payload: true,
    });

    return (response.points ?? []).map((r) => ({
      text: (r.payload?.text as string) ?? '',
      metadata: {
        lectureLabel: (r.payload?.lectureLabel as string) ?? '',
        slideNum: (r.payload?.slideNum as number) ?? 0,
      },
      score: r.score,
    }));
  } catch {
    return [];
  }
}
