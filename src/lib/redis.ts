import { Redis } from "@upstash/redis";
import { Index } from "@upstash/vector";

let _redis: Redis | null = null;
let _vectorIndex: Index | null = null;

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

function getVectorIndex(): Index {
  if (!_vectorIndex) {
    _vectorIndex = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });
  }
  return _vectorIndex;
}

export interface Chunk {
  id: string;
  text: string;
  sourceId: string;
  sourceName: string;
  index: number;
}

export async function storeChunks(projectId: string, chunks: Chunk[]) {
  const redis = getRedis();
  const pipeline = redis.pipeline();
  for (const chunk of chunks) {
    pipeline.hset(`project:${projectId}:chunk:${chunk.id}`, {
      text: chunk.text,
      sourceId: chunk.sourceId,
      sourceName: chunk.sourceName,
      index: chunk.index,
    });
    pipeline.sadd(`project:${projectId}:chunks`, chunk.id);
  }
  await pipeline.exec();
}

export async function storeSource(
  projectId: string,
  source: { id: string; name: string; type: string; chunkCount: number }
) {
  const redis = getRedis();
  await redis.hset(`project:${projectId}:source:${source.id}`, source);
  await redis.sadd(`project:${projectId}:sources`, source.id);
}

export async function getSources(projectId: string) {
  const redis = getRedis();
  const sourceIds = await redis.smembers(`project:${projectId}:sources`);
  if (!sourceIds.length) return [];
  const pipeline = redis.pipeline();
  for (const id of sourceIds) {
    pipeline.hgetall(`project:${projectId}:source:${id}`);
  }
  return pipeline.exec();
}

export async function storeEmbedding(
  id: string,
  embedding: number[],
  metadata: { projectId: string; sourceId: string; sourceName: string; text: string }
) {
  const vectorIndex = getVectorIndex();
  await vectorIndex.upsert({
    id,
    vector: embedding,
    metadata,
  });
}

export async function searchSimilar(
  query: number[],
  projectId: string,
  topK = 5
) {
  const vectorIndex = getVectorIndex();
  const results = await vectorIndex.query({
    vector: query,
    topK,
    includeMetadata: true,
    filter: `projectId = '${projectId}'`,
  });
  return results;
}
