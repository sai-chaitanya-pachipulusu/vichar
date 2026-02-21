# Vichar/Plexus — MVP Implementation Plan (v2)

## What We're Building

An AI-native research workbench where dropping files / URLs causes Claude to **think visibly** and **manifest understanding as pre-built widgets** on a bento canvas. The key insight: Claude doesn't generate UI code — it selects and populates from a registry of rich components.

The **star feature**: Claude generates **multiple independent mind maps** — one per source, or one per theme it detects — so the user can visually navigate the conceptual landscape of their research.

---

## Widget Philosophy

Claude has **no prescribed list of widgets to call**. It reads the content and decides which tools are meaningful. A legal doc might yield timelines and conflict cards. A research paper might yield mind maps and stats. A news article might just yield a summary and a quote.

The widget registry gives Claude a palette — Claude paints. The richer the sources, the richer the canvas. **Mind map is the star widget** (visually the most impressive), but Claude decides if and when to use it.

---

## The 10-Widget Registry

### Mind Map ★ Priority #1
- **Library**: `mind-elixir` — lightweight JS mind map core, works via DOM ref
- **Install**: `bun add mind-elixir`
- **Claude tool**: `render_mind_map`
- **Props**: `{ title, sourceId, nodeData: MindElixirData }`
- **Key behavior**: Claude calls `render_mind_map` **once per source**. Each card is titled by source. Users can expand to full-screen and export as image.
- **Mind Elixir data shape**:
```typescript
interface MindElixirData {
  nodeData: {
    id: string;
    topic: string;        // Root: source title
    children: Array<{
      id: string;
      topic: string;      // Main themes
      children: Array<{ id: string; topic: string }>;  // Sub-themes
    }>;
  };
}
```
- **SSR note**: Use `dynamic(() => import('./MindMapWidget'), { ssr: false })`

### Knowledge Graph
- **Library**: `@xyflow/react` (React Flow v12 with shadcn-styled nodes via React Flow UI)
- **Install**: `bun add @xyflow/react`
- **Claude tool**: `render_knowledge_graph`
- **Props**: `{ nodes: [{id, label, type}], edges: [{source, target, label}] }`
- **Use case**: Entity relationships across ALL sources (one global graph)

### Timeline
- **Library**: Custom vertical timeline using shadcn `Card` + `Separator` primitives
- **Claude tool**: `render_timeline`
- **Props**: `{ events: [{ date, title, description, sourceId }] }`

### Concept Tree
- **Library**: `shadcn-extension` tree-view by MrLightful
- **Install**: `bunx shadcn@latest add "https://shadcn-extension.vercel.app/registry/tree-view.json"`
- **Claude tool**: `render_concept_tree`
- **Props**: `{ root: TreeNode }` — `TreeNode = { id, name, children?: TreeNode[] }`
- **Use case**: Hierarchical outline of the entire research corpus

### Summary Card
- **Library**: shadcn `Card` + `Badge`
- **Claude tool**: `render_summary_card`
- **Props**: `{ title, bullets: string[], sourceId: string }`
- **Use case**: One per source — key facts and claims

### Stats / Metrics Card
- **Library**: shadcn `Card` + Recharts (bundled with shadcn)
- **Claude tool**: `render_stats_card`
- **Props**: `{ title, metrics: [{ label, value, unit }], chartData?: any[] }`
- **Use case**: Numeric data, percentages, counts from sources

### Conflict / Contradiction Card
- **Library**: shadcn `Alert` styled card
- **Claude tool**: `render_conflict`
- **Props**: `{ claimA, sourceA, claimB, sourceB, explanation: string }`
- **Use case**: Surfaces contradictions between sources automatically

### Comparison Table
- **Library**: shadcn `Table`
- **Claude tool**: `render_comparison`
- **Props**: `{ title, headers: string[], rows: string[][], sources: string[] }`
- **Use case**: Side-by-side concept/entity comparison across sources

### Quote / Evidence Card
- **Library**: Styled shadcn `Card` with blockquote
- **Claude tool**: `render_quote`
- **Props**: `{ quote, sourceId, page?: number, context: string }`
- **Use case**: Most impactful direct excerpt per source

### Thinking Stream (UI component, not a Claude tool)
- **Library**: Custom bottom-anchored collapsible panel
- **Driven by**: CopilotKit's `useCopilotChatSuggestions` / message stream — the panel reads Claude's **raw streaming text output** as it runs, not a tool call
- **Behavior**: Opens automatically whenever Claude is invoked. Shows streaming reasoning text in real time, collapses when analysis is complete. User can re-open it at any time.
- **Why not a tool**: Claude's reasoning is already in its response stream. We intercept it at the UI layer via CopilotKit hooks — no need to "ask" Claude to emit a tool call for its own thinking.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Package manager | `bun` |
| UI primitives | shadcn/ui + Tailwind |
| AI framework | CopilotKit (`@copilotkit/react-core`, `@copilotkit/react-ui`, `@copilotkit/runtime`) |
| LLM | Claude 3.5 Sonnet |
| **Mind Map** | **`mind-elixir`** |
| Graph | `@xyflow/react` |
| Tree view | `shadcn-extension` tree-view |
| Charts | Recharts (via shadcn) |
| Cache/Vectors | Upstash Redis + Upstash Vector |
| File parsing | `pdf-parse`, native `fetch` |
| Animation | `framer-motion` |

### Full Install

```bash
bun add \
  @copilotkit/react-core \
  @copilotkit/react-ui \
  @copilotkit/runtime \
  @anthropic-ai/sdk \
  @upstash/redis \
  @upstash/vector \
  @xyflow/react \
  mind-elixir \
  pdf-parse \
  recharts \
  framer-motion \
  uuid

bun add -d @types/uuid @types/pdf-parse
```

```bash
bunx shadcn@latest add card badge button dialog scroll-area separator tooltip table alert
bunx shadcn@latest add "https://shadcn-extension.vercel.app/registry/tree-view.json"
```

---

## File Structure

```
vichar/
├── app/
│   ├── page.tsx
│   ├── workspace/[id]/page.tsx
│   └── api/
│       ├── copilotkit/route.ts
│       ├── ingest/route.ts
│       └── search/route.ts
├── components/
│   ├── canvas/
│   │   ├── BentoGrid.tsx
│   │   └── WidgetCard.tsx
│   ├── widgets/
│   │   ├── MindMapWidget.tsx         # ★ mind-elixir, SSR-disabled
│   │   ├── KnowledgeGraphWidget.tsx  # React Flow
│   │   ├── TimelineWidget.tsx
│   │   ├── ConceptTreeWidget.tsx     # shadcn-extension
│   │   ├── SummaryCard.tsx
│   │   ├── StatsCard.tsx
│   │   ├── ConflictCard.tsx
│   │   ├── ComparisonTable.tsx
│   │   ├── QuoteCard.tsx
│   │   └── ThinkingStream.tsx
│   └── upload/DropZone.tsx
├── lib/
│   ├── claude.ts
│   ├── redis.ts
│   ├── ingest.ts
│   └── tools.ts                      # 9 tool schemas for CopilotKit (widgets only)
└── hooks/
    └── useWorkspace.ts
```

---

## Key Design Decisions

> [!IMPORTANT]
> **Claude chooses its own widgets.** There are no numbered instructions telling Claude what to call. The system prompt gives principles (be rich, be grounded, show reasoning), not a script. Claude's output varies with the content — this is the point.

> [!IMPORTANT]
> **Mind maps are per-source when called.** If Claude decides to call `render_mind_map`, it does so once per source. 3 sources = 3 mind map cards side by side. But Claude may skip it if the content doesn't warrant it.

> [!IMPORTANT]
> **CopilotKit handles all streaming tool dispatch.** Register each widget as a `useCopilotAction`. CopilotKit manages SSE streaming and state — we don't build that plumbing.

> [!TIP]
> **Use the `frontend-design` skill** when building the UI layer. Apply it to `BentoGrid.tsx`, `WidgetCard.tsx`, the workspace canvas, and the landing page to ensure the visual design is premium and demo-ready, not just functional.

> [!NOTE]
> **No SQLite, no voice in MVP.** Redis session only. 5MB file size cap per file.

---

## System Prompt Strategy

Principle-driven, not rule-driven. Claude decides what to render based on what the content actually contains. **No `render_thinking` call** — the UI captures Claude's reasoning from the response stream automatically.

```
You are Vichar, an AI research analyst embedded in a live research canvas.

When given content to analyze, use the available widget tools to manifest your
understanding visually. You have full discretion over which widgets to invoke
and how many times. Let the content guide you:

- For mind-mappable content, call render_mind_map per source — this is your
  most expressive tool.
- Use render_summary_card, render_timeline, render_knowledge_graph,
  render_concept_tree, render_stats_card, render_conflict, render_comparison,
  and render_quote whenever the content warrants it.
- Prefer richness over brevity. If the data supports it, use it.
- Every insight you surface should be grounded in the source content.
```

---

## Verification Plan

### Target Demo (3 sources in)

Drop 2 PDFs + 1 URL → bento grid shows:
- 3 × `MindMapWidget` side by side
- 3 × `SummaryCard`
- 1 × `KnowledgeGraphWidget`
- 1 × `TimelineWidget`
- 1 × `ConceptTreeWidget`
- 1 × `StatsCard`
- 1 × `ConflictCard` (if applicable)
- `ThinkingStream` streaming throughout

### Build Order
1. `lib/redis.ts` → `lib/ingest.ts` → `api/ingest/route.ts`
2. `lib/tools.ts` → `api/copilotkit/route.ts`
3. `MindMapWidget.tsx` ← build this first, it's the hardest and most important
4. `KnowledgeGraphWidget`, `TimelineWidget`, `ConceptTreeWidget`
5. `SummaryCard`, `StatsCard`, `ConflictCard`, `ComparisonTable`, `QuoteCard`
6. `ThinkingStream`
7. `BentoGrid` + `WidgetCard`
8. `DropZone` → `useWorkspace` → workspace page
9. Landing page + polish
