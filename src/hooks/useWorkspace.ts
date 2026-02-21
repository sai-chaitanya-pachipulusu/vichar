"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ToolName, WidgetData } from "@/lib/tools";

export interface Source {
  id: string;
  name: string;
  type: string;
  chunkCount: number;
}

export interface WidgetDecision {
  id: string;
  tool: ToolName;
  data: WidgetData;
  priority: number;
}

type PersistenceStatus = "idle" | "loading" | "saving" | "loaded" | "error";

export function useWorkspace(projectId?: string) {
  const [sources, setSources] = useState<Source[]>([]);
  const [widgets, setWidgets] = useState<WidgetDecision[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [thinkingMessages, setThinkingMessages] = useState<string[]>([]);
  const [persistenceStatus, setPersistenceStatus] =
    useState<PersistenceStatus>("idle");

  // Track whether we've completed initial load so we don't
  // save an empty state before the load finishes.
  const hasLoadedRef = useRef(false);
  // Debounce timer for saves
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load saved state on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;
    setPersistenceStatus("loading");

    (async () => {
      try {
        const res = await fetch(`/api/workspace/${projectId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { state } = await res.json();

        if (cancelled) return;

        if (state && Array.isArray(state.sources) && Array.isArray(state.widgets)) {
          setSources(state.sources);
          setWidgets(state.widgets);
          setPersistenceStatus("loaded");
        } else {
          setPersistenceStatus("idle");
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("Could not load workspace state:", err);
          setPersistenceStatus("error");
        }
      } finally {
        if (!cancelled) {
          hasLoadedRef.current = true;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // ── Auto-save whenever sources or widgets change (debounced 800ms) ─────────
  useEffect(() => {
    // Don't save until after we've done the initial load
    if (!projectId || !hasLoadedRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      setPersistenceStatus("saving");
      try {
        await fetch(`/api/workspace/${projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sources, widgets }),
        });
        setPersistenceStatus("idle");
      } catch (err) {
        console.warn("Could not save workspace state:", err);
        setPersistenceStatus("error");
      }
    }, 800);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [sources, widgets, projectId]);

  // ── State mutators ─────────────────────────────────────────────────────────
  const addSource = useCallback((source: Source) => {
    setSources((prev: Source[]) => [...prev, source]);
  }, []);

  const addWidget = useCallback((widget: WidgetDecision) => {
    setWidgets((prev: WidgetDecision[]) => [...prev, widget]);
  }, []);

  const addThinkingMessage = useCallback((message: string) => {
    setThinkingMessages((prev: string[]) => [...prev, message]);
  }, []);

  const clearThinking = useCallback(() => {
    setThinkingMessages([]);
  }, []);

  const clearWorkspace = useCallback(async () => {
    setSources([]);
    setWidgets([]);
    setThinkingMessages([]);
    setIsAnalyzing(false);

    // Also clear the persisted state in Redis
    if (projectId) {
      try {
        await fetch(`/api/workspace/${projectId}`, { method: "DELETE" });
      } catch (err) {
        console.warn("Could not clear workspace state:", err);
      }
    }
  }, [projectId]);

  return {
    sources,
    widgets,
    isAnalyzing,
    thinkingMessages,
    persistenceStatus,
    setIsAnalyzing,
    addSource,
    addWidget,
    addThinkingMessage,
    clearThinking,
    clearWorkspace,
  };
}
