"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  useCopilotAction,
  useCopilotChat,
  useCopilotAdditionalInstructions,
} from "@copilotkit/react-core";
import {
  TextMessage,
  Role,
} from "@copilotkit/runtime-client-gql";
import { v4 as uuid } from "uuid";
import { Plus, FileText, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BentoGrid from "@/components/canvas/BentoGrid";
import DropZone from "@/components/upload/DropZone";
import ThinkingStream from "@/components/widgets/ThinkingStream";
import {
  TOOL_NAMES,
  toolParameterDefinitions,
  type ToolName,
} from "@/lib/tools";
import { SYSTEM_PROMPT } from "@/lib/claude";
import type { useWorkspace } from "@/hooks/useWorkspace";

interface WorkspaceContentProps {
  projectId: string;
  title: string;
  workspace: ReturnType<typeof useWorkspace>;
}

export default function WorkspaceContent({
  projectId,
  title,
  workspace,
}: WorkspaceContentProps) {
  const {
    sources,
    widgets,
    isAnalyzing,
    thinkingMessages,
    setIsAnalyzing,
    addSource,
    addWidget,
    addThinkingMessage,
    clearThinking,
  } = workspace;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inject the Vichar system prompt into every CopilotKit request
  useCopilotAdditionalInstructions({ instructions: SYSTEM_PROMPT });

  const { appendMessage, visibleMessages, isLoading } = useCopilotChat();

  // Track thinking from visible messages
  const prevMsgCountRef = useRef(0);
  useEffect(() => {
    if (!visibleMessages?.length) return;
    // Only process new messages
    const newMessages = visibleMessages.slice(prevMsgCountRef.current);
    prevMsgCountRef.current = visibleMessages.length;
    for (const msg of newMessages) {
      if (msg.isTextMessage() && msg.role === Role.Assistant && msg.content) {
        addThinkingMessage(msg.content);
      }
    }
  }, [visibleMessages, addThinkingMessage]);

  // Helper to register a single widget action
  function useWidgetAction(name: ToolName, description: string, priority: number) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useCopilotAction({
      name,
      description,
      parameters: toolParameterDefinitions[name] as unknown as [],
      handler: async (args: Record<string, unknown>) => {
        addWidget({ id: uuid(), tool: name, data: args as never, priority });
        return `${name} rendered`;
      },
    } as Parameters<typeof useCopilotAction>[0]);
  }

  useWidgetAction(TOOL_NAMES.MIND_MAP, "Render a mind map for a source. Call once per source for mind-mappable content.", 10);
  useWidgetAction(TOOL_NAMES.KNOWLEDGE_GRAPH, "Render a knowledge graph showing entity relationships across sources.", 9);
  useWidgetAction(TOOL_NAMES.TIMELINE, "Render a timeline of chronological events found in the sources.", 7);
  useWidgetAction(TOOL_NAMES.CONCEPT_TREE, "Render a hierarchical concept tree/outline of the research corpus.", 6);
  useWidgetAction(TOOL_NAMES.SUMMARY_CARD, "Render a summary card with key takeaways. Call once per source.", 8);
  useWidgetAction(TOOL_NAMES.STATS_CARD, "Render a stats/metrics card with numeric data from sources.", 5);
  useWidgetAction(TOOL_NAMES.CONFLICT, "Render a conflict card highlighting contradictions between sources.", 4);
  useWidgetAction(TOOL_NAMES.COMPARISON, "Render a comparison table for side-by-side analysis across sources.", 5);
  useWidgetAction(TOOL_NAMES.QUOTE, "Render a quote card with an impactful direct excerpt from a source.", 3);

  // Trigger analysis when new files are uploaded
  const triggerAnalysis = useCallback(
    async (newSource: { sourceId: string; fileName: string; chunkCount: number }) => {
      addSource({
        id: newSource.sourceId,
        name: newSource.fileName,
        type: "file",
        chunkCount: newSource.chunkCount,
      });

      setIsAnalyzing(true);
      clearThinking();

      // Build context about all sources for Claude
      const sourceList = [
        ...sources,
        { id: newSource.sourceId, name: newSource.fileName },
      ]
        .map((s) => `- ${s.name} (ID: ${s.id})`)
        .join("\n");

      const message = `New source uploaded: "${newSource.fileName}" (${newSource.chunkCount} chunks, ID: ${newSource.sourceId}).

All sources in this workspace:
${sourceList}

Analyze the newly uploaded content and create appropriate visual widgets. For this source, consider creating:
1. A mind map of the key concepts
2. A summary card with main takeaways
3. Any other widgets that fit the content (timeline, stats, knowledge graph, etc.)

Use the source IDs provided when referencing sources in your widget calls.`;

      try {
        await appendMessage(
          new TextMessage({
            id: uuid(),
            role: Role.User,
            content: message,
          })
        );
      } catch (error) {
        console.error("Analysis error:", error);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [sources, addSource, setIsAnalyzing, clearThinking, appendMessage]
  );

  const hasContent = sources.length > 0 || widgets.length > 0;
  const isProcessing = isAnalyzing || isLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Vichar wordmark */}
            <span className="text-sm font-bold text-primary tracking-tight shrink-0">
              Vichar
            </span>
            <Separator orientation="vertical" className="h-4" />
            {/* Project title */}
            <h1 className="text-sm font-medium text-foreground/80 truncate">
              {title}
            </h1>
            {/* Source count badge */}
            {sources.length > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] h-5 px-1.5 shrink-0"
              >
                <Layers className="w-2.5 h-2.5 mr-1" />
                {sources.length} {sources.length === 1 ? "source" : "sources"}
              </Badge>
            )}
            {/* Widget count badge */}
            {widgets.length > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] h-5 px-1.5 shrink-0 text-muted-foreground"
              >
                {widgets.length} {widgets.length === 1 ? "widget" : "widgets"}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Analysis indicator */}
            {isProcessing && (
              <div className="flex items-center gap-1.5 text-xs text-primary">
                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Analyzing…</span>
              </div>
            )}
            {hasContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5 h-8 text-xs"
                id="add-source-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Source
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hidden file input for header button */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.txt,.md,.csv"
        multiple
        onChange={async (e) => {
          if (!e.target.files) return;
          for (const file of Array.from(e.target.files)) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("projectId", projectId);
            try {
              const res = await fetch("/api/ingest", {
                method: "POST",
                body: formData,
              });
              if (res.ok) {
                const result = await res.json();
                triggerAnalysis(result);
              }
            } catch (err) {
              console.error("Upload error:", err);
            }
          }
          e.target.value = "";
        }}
      />

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 pb-24">
        {/* Drop zone — shows full empty state or invisible drag target */}
        <DropZone
          projectId={projectId}
          onFileIngested={triggerAnalysis}
          hasContent={hasContent}
        />

        {/* Analyzing spinner when no widgets yet */}
        {sources.length > 0 && widgets.length === 0 && isProcessing && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-2 border-primary/30 rounded-full" />
              <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">
                Vichar is analyzing your content
              </p>
              <p className="text-xs text-muted-foreground">
                Building your visual workspace…
              </p>
            </div>
          </div>
        )}

        {/* Widget bento grid */}
        <BentoGrid widgets={widgets} />

        {/* Source pills at the bottom */}
        {sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-4 border-t border-border/30">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 self-center">
              Sources
            </span>
            {sources.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-1.5 text-xs text-muted-foreground bg-accent/40 px-2.5 py-1 rounded-full"
              >
                <FileText className="w-3 h-3" />
                {s.name}
                {s.chunkCount && (
                  <span className="text-[10px] text-muted-foreground/50">
                    · {s.chunkCount} chunks
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Thinking stream */}
      <ThinkingStream
        messages={thinkingMessages}
        isActive={isProcessing}
      />
    </div>
  );
}
