# Vichar / Plexus

> **Working Title**: Vichar (Hindi for "thought/pondering") or Plexus (Latin for "network/interwoven")
> An AI-native research workbench that transforms how humans interact with knowledge

---

## The Vision

What if your research tools worked like JARVIS from Iron Man? Not as a chatbot you query, but as a living workspace that thinks alongside you, organizes your chaos, and surfaces insights before you know to ask for them.

Current tools (NotebookLM, etc.) are step-functions: upload → wait → get output. We want continuous collaboration: drop files anywhere → watch the workspace self-organize → interact with a thinking partner.

**The key insight**: Claude's reasoning capabilities can drive UI generation. Instead of generating code at runtime (slow), we give Claude pre-built shadcn components as "tools" it can invoke. Claude analyzes your data and decides which components to render, how to arrange them, and what insights to surface.

---

## Core Concept

A blank canvas that becomes alive when you drop content onto it. Think of it as a workspace with "AI senses" - it watches what you add, thinks about it, and manifests understanding through a dynamic bento-grid interface.

### The User Flow

1. **Create Project**: Title + one-sentence goal (e.g., "Research quantum computing applications in drug discovery")
2. **Drop Content**: PDFs, URLs, text snippets, images → dropped anywhere on canvas
3. **AI Processing**: Claude ingests, chunks, indexes content (Redis vector store)
4. **Workspace Awakens**: Bento grid populates with relevant widgets
5. **Continuous Interaction**: Add more content, widgets update; ask questions, reasoning appears; iterate on analysis

### The "Thinking" Layer

Claude's reasoning is not hidden. As it processes your data, "thought bubbles" appear in a dedicated stream. These aren't just for show - you can:
- Click any thought to "dig deeper"
- Interrupt with voice/text: "Wait, explain that connection"
- Queue follow-ups that get woven into ongoing analysis

---

## The Component System

Instead of generating UI code, we treat shadcn components as Claude's "render tools":

### Available Widgets (Tool-Based Rendering)

| Tool | Component | Use Case |
|------|-----------|----------|
| `render_timeline` | shadcn-timeline | Chronological events, document history, version tracking |
| `render_graph` | React Flow UI | Knowledge graphs, entity relationships, mind maps |
| `render_tree` | shadcn-tree-view | Hierarchical data, outlines, nested topics |
| `render_chart` | Recharts (shadcn) | Numeric trends, statistical summaries |
| `render_summary_card` | Bento Grid Cards | Key takeaways, action items, stats |
| `render_thinking` | AI Reasoning Component | Claude's live thought process |
| `render_conflict` | Custom Alert Card | Highlight contradictions across sources |
| `render_comparison` | Split-view Component | Side-by-side document comparison |

### Bento Grid Layout

The canvas is a responsive bento grid. Claude decides:
- Which widgets to show/hide
- Size/priority of each card
- Layout arrangement based on content type

Click any card → opens modal with full component + source references sidebar

---

## Architecture (MVP Scope)

### Tech Stack

**Frontend:**
- Next.js 14+ (App Router)
- shadcn/ui (base components)
- React Flow UI (graphs)
- shadcn-timeline (chronology)
- shadcn-tree-view (hierarchies)
- AI Reasoning component (thinking bubbles)
- Bento grid (custom/layout)

**Backend:**
- Next.js API routes (or minimal Express)
- Claude API (streaming, reasoning)
- Redis (Upstash) - vector store + session cache
- Local SQLite - project persistence backup

**Data Flow:**
```
User drops file
    ↓
File processed (background)
    ↓
Content chunked → Claude summarizes
    ↓
Embeddings stored (Redis vector)
    ↓
Claude analyzes → decides widgets
    ↓
Tool calls populate bento grid
    ↓
User interacts → queue updates
```

### Storage Strategy

**Redis (Primary - Real-time):**
- Vector embeddings for semantic search
- Session state and widget configurations
- Claude's analysis cache
- Active project workspace

**Local SQLite (Backup - Persistence):**
- Project metadata and file references
- Synced snapshot of Redis state
- Offline availability
- Historical versions

**Sync Logic:**
- Redis = source of truth during session
- Background sync to SQLite every 30s or on idle
- On reconnect: SQLite → Redis restore

### The Tool-Calling Interface

Claude doesn't generate React code. Instead:

```typescript
// Claude returns structured decisions
interface WidgetDecision {
  tool: 'render_timeline' | 'render_graph' | 'render_summary_card' | ...;
  data: any; // Component-specific props
  position: 'primary' | 'secondary' | 'sidebar';
  priority: number; // Determines card size in bento
}

// Frontend maps tool → pre-built component
const widgetRegistry = {
  render_timeline: TimelineWidget,
  render_graph: GraphWidget,
  render_summary_card: SummaryCard,
  // ...
};
```

This keeps latency low - no code generation, just data population.

---

## Key Features (MVP)

### 1. Smart Content Ingestion
- Drag-drop: PDFs, URLs, text, images
- Claude extracts: entities, dates, claims, relationships
- Auto-chunking with overlap for context preservation
- Real-time progress indicator

### 2. Adaptive Bento Dashboard
- Claude decides layout based on content type
- Research papers → emphasis on summary + knowledge graph
- Meeting notes → timeline + action items
- Mixed sources → comparison + conflict detection
- User can pin/rearrange, but AI suggests optimal layout

### 3. Thinking Stream
- Bottom panel showing Claude's reasoning
- Not just text - structured thoughts with confidence scores
- Click to expand, dig deeper, or challenge
- Voice-to-text input interrupts and queues revisions

### 4. Source Grounding
- Every claim hyperlinked to original document
- Hover to preview context
- Click to open source in sidebar
- "Show me where it says that" button on any insight

### 5. Iterative Analysis
- Add new content anytime → workspace updates
- "What changed?" view since last visit
- Conversation history threaded by topic
- Queue system for complex follow-ups

---

## What Makes This Novel

**1. Interface as Reasoning Manifestation**
The UI isn't static - it's Claude's working memory made visible. As Claude thinks, the workspace reorganizes.

**2. Tool-Based Rendering**
Instead of slow code generation, we use fast component selection. Claude "plays" the UI like an instrument.

**3. Thinking Transparency**
Most AI tools hide reasoning. We make it the interface. Users learn how Claude thinks and can redirect it.

**4. Local-First with Cloud Sync**
Redis for speed, local backup for ownership. No lock-in, works offline.

**5. Jarvis-like Continuous Presence**
Not a chat you start and end. A workspace that's always thinking, always ready, always adapting.

---

## Scoring Alignment (Hackathon Criteria)

**Interface Novelty & Playfulness: 5/5**
- "The entire experience is defined by a novel interaction loop enabled directly by Claude's reasoning power"
- UI that reorganizes based on AI analysis, not user templates

**Theme Alignment - Generative Interfaces: 5/5**
- "Interaction is deeply coupled with Claude's reasoning, leading to adaptive or purpose-driven UIs"
- Interface generates itself from content + AI understanding

**Leveraging Claude's Capabilities: 5/5**
- "The interface design is impossible or significantly degraded without Claude's specific, powerful reasoning abilities"
- Requires: reasoning extraction, relationship detection, layout decisions, contradiction finding

**Redis Integration: ✓**
- Vector store for embeddings
- Session state management
- Real-time collaboration layer

---

## MVP Scope (6 Hours)

### Must Have:
- [ ] File upload (PDF + text)
- [ ] Claude content analysis + embedding
- [ ] 4 core widgets: summary card, timeline, graph, thinking stream
- [ ] Bento grid layout
- [ ] Basic Redis integration
- [ ] Source citation on hover

### Nice to Have:
- [ ] Voice input
- [ ] Local SQLite sync
- [ ] Conflict detection widget
- [ ] Multiple file types (images, URLs)
- [ ] Project persistence across sessions

### Out of Scope:
- Real-time collaboration (multiple users)
- Advanced TTS voice responses
- Mobile app
- Plugin ecosystem

---

## Open Questions

1. **Name**: Vichar vs Plexus? Vichar feels more thoughtful/research-focused. Plexus feels more network/systems-focused.

2. **Widget Count**: Start with 4-5 proven widgets or attempt 8-10 simple ones?

3. **Thinking Stream**: Bottom panel always visible or toggleable?

4. **Layout Control**: How much user override of Claude's layout decisions?

5. **File Size Limits**: What's realistic for 6-hour processing? <10MB per file?

6. **Sync Strategy**: Is SQLite backup essential for MVP or can we rely on Redis session storage only?

---

## Next Steps

1. Finalize name (Vichar vs Plexus)
2. Define exact widget set for MVP
3. Set up project scaffold (Next.js + shadcn)
4. Install and configure chosen components
5. Build file upload → Claude → Redis pipeline
6. Implement tool-calling interface
7. Build bento grid layout engine
8. Add thinking stream panel
9. Polish and demo

---

## Inspiration

- **NotebookLM**: Grounded in sources, but too linear
- **Perplexity**: Good synthesis, but chat-based
- **Obsidian**: Graph view, but manual organization
- **Tony Stark's JARVIS**: Continuous presence, anticipatory assistance, visual reasoning

We take the best of all: NotebookLM's grounding + Perplexity's synthesis + Obsidian's graph + JARVIS's ambient intelligence.

---

*Last Updated: 2026-02-19*
*Status: Architecture defined, ready for implementation*
