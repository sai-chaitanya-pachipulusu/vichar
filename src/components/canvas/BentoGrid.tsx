"use client";

import { TOOL_NAMES } from "@/lib/tools";
import type { WidgetDecision } from "@/hooks/useWorkspace";
import WidgetCard from "./WidgetCard";

// Widgets that get larger cards
const LARGE_WIDGETS: Set<string> = new Set([
  TOOL_NAMES.MIND_MAP,
  TOOL_NAMES.KNOWLEDGE_GRAPH,
  TOOL_NAMES.COMPARISON,
]);

const MEDIUM_WIDGETS: Set<string> = new Set([
  TOOL_NAMES.TIMELINE,
  TOOL_NAMES.CONCEPT_TREE,
  TOOL_NAMES.STATS_CARD,
]);

function getSpanClass(tool: string): string {
  if (LARGE_WIDGETS.has(tool)) {
    return "col-span-1 md:col-span-2 row-span-1";
  }
  if (MEDIUM_WIDGETS.has(tool)) {
    return "col-span-1 row-span-1";
  }
  return "col-span-1 row-span-1";
}

interface BentoGridProps {
  widgets: WidgetDecision[];
}

export default function BentoGrid({ widgets }: BentoGridProps) {
  if (widgets.length === 0) return null;

  // Sort by priority (higher priority first)
  const sorted = [...widgets].sort((a, b) => b.priority - a.priority);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
      {sorted.map((widget, i) => (
        <div key={widget.id} className={getSpanClass(widget.tool)}>
          <WidgetCard widget={widget} index={i} />
        </div>
      ))}
    </div>
  );
}
