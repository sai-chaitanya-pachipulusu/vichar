import { NextRequest, NextResponse } from "next/server";
import { searchSimilar } from "@/lib/redis";

function simpleHash(text: string): number[] {
  const dim = 256;
  const vec = new Array(dim).fill(0);
  for (let i = 0; i < text.length; i++) {
    vec[i % dim] += text.charCodeAt(i) / 1000;
  }
  const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return magnitude > 0 ? vec.map((v) => v / magnitude) : vec;
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, query } = await req.json();

    if (!projectId || !query) {
      return NextResponse.json(
        { error: "Missing projectId or query" },
        { status: 400 }
      );
    }

    const queryEmbedding = simpleHash(query);
    const results = await searchSimilar(queryEmbedding, projectId, 5);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
