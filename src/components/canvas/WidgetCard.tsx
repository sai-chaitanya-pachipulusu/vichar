"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Maximize2 } from "lucide-react";
import { motion } from "framer-motion";
import { TOOL_NAMES } from "@/lib/tools";
import type { WidgetDecision } from "@/hooks/useWorkspace";
import type {
  MindMapData,
  KnowledgeGraphData,
  TimelineData,
  ConceptTreeData,
  SummaryCardData,
  StatsCardData,
  ConflictData,
  ComparisonData,
  QuoteData,
} from "@/lib/tools";

// Dynamic imports for heavy widgets (SSR disabled)
const MindMapWidget = dynamic(
  () => import("@/components/widgets/MindMapWidget"),
  { ssr: false }
);
const KnowledgeGraphWidget = dynamic(
  () => import("@/components/widgets/KnowledgeGraphWidget"),
  { ssr: false }
);

// Direct imports for lighter widgets
import TimelineWidget from "@/components/widgets/TimelineWidget";
import ConceptTreeWidget from "@/components/widgets/ConceptTreeWidget";
import SummaryCard from "@/components/widgets/SummaryCard";
import StatsCard from "@/components/widgets/StatsCard";
import ConflictCard from "@/components/widgets/ConflictCard";
import ComparisonTable from "@/components/widgets/ComparisonTable";
import QuoteCard from "@/components/widgets/QuoteCard";

const TOOL_LABELS: Record<string, string> = {
  [TOOL_NAMES.MIND_MAP]: "Mind Map",
  [TOOL_NAMES.KNOWLEDGE_GRAPH]: "Knowledge Graph",
  [TOOL_NAMES.TIMELINE]: "Timeline",
  [TOOL_NAMES.CONCEPT_TREE]: "Concept Tree",
  [TOOL_NAMES.SUMMARY_CARD]: "Summary",
  [TOOL_NAMES.STATS_CARD]: "Stats",
  [TOOL_NAMES.CONFLICT]: "Conflict",
  [TOOL_NAMES.COMPARISON]: "Comparison",
  [TOOL_NAMES.QUOTE]: "Quote",
};

function renderWidget(tool: string, data: unknown) {
  switch (tool) {
    case TOOL_NAMES.MIND_MAP:
      return <MindMapWidget {...(data as MindMapData)} />;
    case TOOL_NAMES.KNOWLEDGE_GRAPH:
      return <KnowledgeGraphWidget {...(data as KnowledgeGraphData)} />;
    case TOOL_NAMES.TIMELINE:
      return <TimelineWidget {...(data as TimelineData)} />;
    case TOOL_NAMES.CONCEPT_TREE:
      return <ConceptTreeWidget {...(data as ConceptTreeData)} />;
    case TOOL_NAMES.SUMMARY_CARD:
      return <SummaryCard {...(data as SummaryCardData)} />;
    case TOOL_NAMES.STATS_CARD:
      return <StatsCard {...(data as StatsCardData)} />;
    case TOOL_NAMES.CONFLICT:
      return <ConflictCard {...(data as ConflictData)} />;
    case TOOL_NAMES.COMPARISON:
      return <ComparisonTable {...(data as ComparisonData)} />;
    case TOOL_NAMES.QUOTE:
      return <QuoteCard {...(data as QuoteData)} />;
    default:
      return <p className="p-4 text-sm text-muted-foreground">Unknown widget</p>;
  }
}

interface WidgetCardProps {
  widget: WidgetDecision;
  index: number;
}

export default function WidgetCard({ widget, index }: WidgetCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      >
        <Card className="group relative overflow-hidden hover:shadow-md transition-shadow duration-200 h-full">
          {/* Expand button */}
          <button
            onClick={() => setExpanded(true)}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
          >
            <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {/* Widget type label */}
          <div className="absolute top-2 left-3 z-10">
            <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
              {TOOL_LABELS[widget.tool] || widget.tool}
            </span>
          </div>

          {/* Widget content */}
          <div className="pt-6">{renderWidget(widget.tool, widget.data)}</div>
        </Card>
      </motion.div>

      {/* Full-screen modal */}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {TOOL_LABELS[widget.tool] || widget.tool}
            </DialogTitle>
          </DialogHeader>
          <div className="min-h-[400px]">
            {renderWidget(widget.tool, widget.data)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
