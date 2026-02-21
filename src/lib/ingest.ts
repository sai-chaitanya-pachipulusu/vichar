import { v4 as uuid } from "uuid";
import { storeChunks, storeSource, storeEmbedding, type Chunk } from "./redis";

export async function parseFile(file: File): Promise<string> {
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    const buffer = Buffer.from(await file.arrayBuffer());
    // pdf-parse v1 — synchronous Node.js compatible, no web worker needed
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  }
  // Plain text / markdown / csv
  return await file.text();
}

export function chunkText(
  text: string,
  chunkSize = 1000,
  overlap = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

async function getEmbedding(text: string): Promise<number[]> {
  // Use Anthropic's message API to generate a simple embedding proxy
  // For MVP, we use a hash-based approach since Anthropic doesn't have an embedding API
  // In production, swap for a dedicated embedding model
  const hash = simpleHash(text);
  return hash;
}

function simpleHash(text: string): number[] {
  // Simple deterministic vector for MVP — in production use a real embedding model
  const dim = 256;
  const vec = new Array(dim).fill(0);
  for (let i = 0; i < text.length; i++) {
    vec[i % dim] += text.charCodeAt(i) / 1000;
  }
  // Normalize
  const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return magnitude > 0 ? vec.map((v) => v / magnitude) : vec;
}

export async function ingestFile(
  projectId: string,
  file: File
): Promise<{ sourceId: string; chunkCount: number }> {
  const sourceId = uuid();
  const text = await parseFile(file);
  const textChunks = chunkText(text);

  const chunks: Chunk[] = textChunks.map((t, i) => ({
    id: uuid(),
    text: t,
    sourceId,
    sourceName: file.name,
    index: i,
  }));

  await storeChunks(projectId, chunks);
  await storeSource(projectId, {
    id: sourceId,
    name: file.name,
    type: file.type || "text/plain",
    chunkCount: chunks.length,
  });

  // Store embeddings for semantic search (non-fatal — vector store is optional)
  await Promise.allSettled(
    chunks.map(async (chunk) => {
      try {
        const embedding = await getEmbedding(chunk.text);
        await storeEmbedding(chunk.id, embedding, {
          projectId,
          sourceId,
          sourceName: file.name,
          text: chunk.text.slice(0, 500),
        });
      } catch (err) {
        console.warn("Vector store failed for chunk (non-fatal):", (err as Error).message);
      }
    })
  );

  return { sourceId, chunkCount: chunks.length };
}

export function getFullTextFromChunks(chunks: string[]): string {
  // Reconstruct approximate full text from overlapping chunks
  return chunks.join("\n\n");
}
