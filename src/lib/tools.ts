// Tool name constants for the widget registry
export const TOOL_NAMES = {
  MIND_MAP: "render_mind_map",
  KNOWLEDGE_GRAPH: "render_knowledge_graph",
  TIMELINE: "render_timeline",
  CONCEPT_TREE: "render_concept_tree",
  SUMMARY_CARD: "render_summary_card",
  STATS_CARD: "render_stats_card",
  CONFLICT: "render_conflict",
  COMPARISON: "render_comparison",
  QUOTE: "render_quote",
} as const;

export type ToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES];

// --- Type definitions for each tool's data ---

export interface MindElixirNode {
  id: string;
  topic: string;
  children?: MindElixirNode[];
}

export interface MindMapData {
  title: string;
  sourceId: string;
  nodeData: {
    id: string;
    topic: string;
    children: MindElixirNode[];
  };
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: string;
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  label: string;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  sourceId: string;
}

export interface TimelineData {
  events: TimelineEvent[];
}

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

export interface ConceptTreeData {
  root: TreeNode;
}

export interface SummaryCardData {
  title: string;
  bullets: string[];
  sourceId: string;
}

export interface MetricItem {
  label: string;
  value: string;
  unit?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface StatsCardData {
  title: string;
  metrics: MetricItem[];
  chartData?: ChartDataPoint[];
}

export interface ConflictData {
  claimA: string;
  sourceA: string;
  claimB: string;
  sourceB: string;
  explanation: string;
}

// rows are stored as { cells: string[] }[] and rendered as a table
export interface ComparisonRow {
  cells: string[];
}

export interface ComparisonData {
  title: string;
  headers: string[];
  rows: ComparisonRow[];
  sources: string[];
}

export interface QuoteData {
  quote: string;
  sourceId: string;
  page?: number;
  context: string;
}

// Union type for all widget data
export type WidgetData =
  | MindMapData
  | KnowledgeGraphData
  | TimelineData
  | ConceptTreeData
  | SummaryCardData
  | StatsCardData
  | ConflictData
  | ComparisonData
  | QuoteData;

// Valid CopilotKit parameter types: "string" | "number" | "boolean" | "object"
//   | "string[]" | "number[]" | "boolean[]" | "object[]"
// NOTE: "string[][]" is NOT valid — use { type: "object[]", attributes: [{ name: "cells", type: "string[]" }] }

export const toolParameterDefinitions = {
  [TOOL_NAMES.MIND_MAP]: [
    { name: "title", type: "string" as const, description: "Title for the mind map", required: true },
    { name: "sourceId", type: "string" as const, description: "ID of the source this mind map represents", required: true },
    {
      name: "nodeData",
      type: "object" as const,
      description: "Mind map node structure with root topic and children",
      attributes: [
        { name: "id", type: "string" as const, description: "Root node ID", required: true },
        { name: "topic", type: "string" as const, description: "Root topic text", required: true },
        {
          name: "children",
          type: "object[]" as const,
          description: "Child branches of the mind map",
          attributes: [
            { name: "id", type: "string" as const, description: "Node ID", required: true },
            { name: "topic", type: "string" as const, description: "Branch topic text", required: true },
            {
              name: "children",
              type: "object[]" as const,
              description: "Sub-branch nodes",
              attributes: [
                { name: "id", type: "string" as const, description: "Node ID", required: true },
                { name: "topic", type: "string" as const, description: "Sub-topic text", required: true },
              ],
            },
          ],
        },
      ],
      required: true,
    },
  ],
  [TOOL_NAMES.KNOWLEDGE_GRAPH]: [
    {
      name: "nodes",
      type: "object[]" as const,
      description: "Graph nodes representing entities",
      attributes: [
        { name: "id", type: "string" as const, description: "Node ID", required: true },
        { name: "label", type: "string" as const, description: "Display label", required: true },
        { name: "type", type: "string" as const, description: "Entity type (person, concept, org, etc.)", required: true },
      ],
      required: true,
    },
    {
      name: "edges",
      type: "object[]" as const,
      description: "Connections between nodes",
      attributes: [
        { name: "source", type: "string" as const, description: "Source node ID", required: true },
        { name: "target", type: "string" as const, description: "Target node ID", required: true },
        { name: "label", type: "string" as const, description: "Relationship label", required: true },
      ],
      required: true,
    },
  ],
  [TOOL_NAMES.TIMELINE]: [
    {
      name: "events",
      type: "object[]" as const,
      description: "Timeline events in chronological order",
      attributes: [
        { name: "date", type: "string" as const, description: "Date or time period", required: true },
        { name: "title", type: "string" as const, description: "Event title", required: true },
        { name: "description", type: "string" as const, description: "Event description", required: true },
        { name: "sourceId", type: "string" as const, description: "Source reference", required: true },
      ],
      required: true,
    },
  ],
  [TOOL_NAMES.CONCEPT_TREE]: [
    {
      name: "root",
      type: "object" as const,
      description: "Root node of the concept tree",
      attributes: [
        { name: "id", type: "string" as const, description: "Node ID", required: true },
        { name: "name", type: "string" as const, description: "Node name", required: true },
        {
          name: "children",
          type: "object[]" as const,
          description: "Child nodes",
          attributes: [
            { name: "id", type: "string" as const, description: "Node ID", required: true },
            { name: "name", type: "string" as const, description: "Node name", required: true },
            {
              name: "children",
              type: "object[]" as const,
              description: "Grandchild nodes",
              attributes: [
                { name: "id", type: "string" as const, description: "Node ID", required: true },
                { name: "name", type: "string" as const, description: "Node name", required: true },
              ],
            },
          ],
        },
      ],
      required: true,
    },
  ],
  [TOOL_NAMES.SUMMARY_CARD]: [
    { name: "title", type: "string" as const, description: "Summary title", required: true },
    { name: "bullets", type: "string[]" as const, description: "Key points as bullet strings", required: true },
    { name: "sourceId", type: "string" as const, description: "Source reference ID", required: true },
  ],
  [TOOL_NAMES.STATS_CARD]: [
    { name: "title", type: "string" as const, description: "Stats card title", required: true },
    {
      name: "metrics",
      type: "object[]" as const,
      description: "Metric items to display",
      attributes: [
        { name: "label", type: "string" as const, description: "Metric label", required: true },
        { name: "value", type: "string" as const, description: "Metric value", required: true },
        { name: "unit", type: "string" as const, description: "Optional unit" },
      ],
      required: true,
    },
    {
      name: "chartData",
      type: "object[]" as const,
      description: "Optional chart data points",
      attributes: [
        { name: "name", type: "string" as const, description: "Data point name", required: true },
        { name: "value", type: "number" as const, description: "Data point value", required: true },
      ],
    },
  ],
  [TOOL_NAMES.CONFLICT]: [
    { name: "claimA", type: "string" as const, description: "First conflicting claim", required: true },
    { name: "sourceA", type: "string" as const, description: "Source of first claim", required: true },
    { name: "claimB", type: "string" as const, description: "Second conflicting claim", required: true },
    { name: "sourceB", type: "string" as const, description: "Source of second claim", required: true },
    { name: "explanation", type: "string" as const, description: "Explanation of the conflict", required: true },
  ],
  [TOOL_NAMES.COMPARISON]: [
    { name: "title", type: "string" as const, description: "Comparison table title", required: true },
    { name: "headers", type: "string[]" as const, description: "Column headers", required: true },
    {
      name: "rows",
      type: "object[]" as const,
      description: "Table rows — each row has a 'cells' array of strings",
      attributes: [
        { name: "cells", type: "string[]" as const, description: "Cell values for this row", required: true },
      ],
      required: true,
    },
    { name: "sources", type: "string[]" as const, description: "Source references", required: true },
  ],
  [TOOL_NAMES.QUOTE]: [
    { name: "quote", type: "string" as const, description: "The direct quote text", required: true },
    { name: "sourceId", type: "string" as const, description: "Source reference ID", required: true },
    { name: "page", type: "number" as const, description: "Optional page number" },
    { name: "context", type: "string" as const, description: "Context explaining the quote's significance", required: true },
  ],
} as const;
