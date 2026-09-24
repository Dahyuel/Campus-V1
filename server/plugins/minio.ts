import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { S3Client, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { config } from '../config.js';

export const MATERIALS_BUCKET = config.minio.bucket;

export const s3 = new S3Client({
  endpoint: config.minio.endpoint,
  region: 'us-east-1',
  forcePathStyle: true,
  credentials: {
    accessKeyId: config.minio.accessKey,
    secretAccessKey: config.minio.secretKey,
  },
});

async function ensureBucket(): Promise<void> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: MATERIALS_BUCKET }));
  } catch {
    try {
      await s3.send(new CreateBucketCommand({ Bucket: MATERIALS_BUCKET }));
      console.log(`Created MinIO bucket ${MATERIALS_BUCKET}`);
    } catch (err) {
      console.warn('Could not ensure MinIO bucket:', (err as Error).message);
    }
  }
}

export default fp(async function minioPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.decorate('minio', s3);
  fastify.addHook('onReady', async () => {
    await ensureBucket();
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    minio: S3Client;
  }
}
