import { NextRequest, NextResponse } from "next/server";
import {
  loadWorkspaceState,
  saveWorkspaceState,
  clearWorkspaceState,
} from "@/lib/redis";

// GET /api/workspace/[id] — load persisted workspace state
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const state = await loadWorkspaceState(projectId);
    if (!state) {
      return NextResponse.json({ state: null });
    }
    return NextResponse.json({ state });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Workspace load error:", msg);
    return NextResponse.json(
      { error: "Failed to load workspace", detail: msg },
      { status: 500 }
    );
  }
}

// PUT /api/workspace/[id] — save workspace state
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await req.json();
    const { sources, widgets } = body;

    if (!Array.isArray(sources) || !Array.isArray(widgets)) {
      return NextResponse.json(
        { error: "Invalid payload: sources and widgets must be arrays" },
        { status: 400 }
      );
    }

    await saveWorkspaceState(projectId, {
      sources,
      widgets,
      savedAt: Date.now(),
    });

    return NextResponse.json({ saved: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Workspace save error:", msg);
    return NextResponse.json(
      { error: "Failed to save workspace", detail: msg },
      { status: 500 }
    );
  }
}

// DELETE /api/workspace/[id] — clear workspace state
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    await clearWorkspaceState(projectId);
    return NextResponse.json({ cleared: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Workspace clear error:", msg);
    return NextResponse.json(
      { error: "Failed to clear workspace", detail: msg },
      { status: 500 }
    );
  }
}
