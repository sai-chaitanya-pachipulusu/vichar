import { NextRequest, NextResponse } from "next/server";
import { ingestFile } from "@/lib/ingest";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;

    if (!file || !projectId) {
      return NextResponse.json(
        { error: "Missing file or projectId" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "text/csv",
    ];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF, TXT, or MD files." },
        { status: 400 }
      );
    }

    const result = await ingestFile(projectId, file);

    return NextResponse.json({
      sourceId: result.sourceId,
      chunkCount: result.chunkCount,
      fileName: file.name,
      status: "ingested",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Ingest error:", msg);
    return NextResponse.json(
      { error: "Failed to ingest file", detail: msg },
      { status: 500 }
    );
  }
}
