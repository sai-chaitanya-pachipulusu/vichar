"use client";

import { useState, useCallback } from "react";
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

export function useWorkspace() {
  const [sources, setSources] = useState<Source[]>([]);
  const [widgets, setWidgets] = useState<WidgetDecision[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [thinkingMessages, setThinkingMessages] = useState<string[]>([]);

  const addSource = useCallback((source: Source) => {
    setSources((prev) => [...prev, source]);
  }, []);

  const addWidget = useCallback((widget: WidgetDecision) => {
    setWidgets((prev) => [...prev, widget]);
  }, []);

  const addThinkingMessage = useCallback((message: string) => {
    setThinkingMessages((prev) => [...prev, message]);
  }, []);

  const clearThinking = useCallback(() => {
    setThinkingMessages([]);
  }, []);

  const clearWorkspace = useCallback(() => {
    setSources([]);
    setWidgets([]);
    setThinkingMessages([]);
    setIsAnalyzing(false);
  }, []);

  return {
    sources,
    widgets,
    isAnalyzing,
    thinkingMessages,
    setIsAnalyzing,
    addSource,
    addWidget,
    addThinkingMessage,
    clearThinking,
    clearWorkspace,
  };
}
