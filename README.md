# Vichar

> AI-native research workbench. Drop files, watch Claude manifest understanding as visual widgets on a living canvas.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![CopilotKit](https://img.shields.io/badge/CopilotKit-1.51-blue)
![Claude](https://img.shields.io/badge/Claude-Sonnet-orange?logo=anthropic)
![Upstash](https://img.shields.io/badge/Upstash-Redis%20%2B%20Vector-00e9a3?logo=upstash)

---

## What is Vichar?

Vichar (Sanskrit: *विचार* — thought, reflection) is a research workbench where you upload PDFs, text files, or markdown documents and Claude automatically analyses the content and populates a **bento-canvas** with interactive visual widgets:

| Widget | What it shows |
|---|---|
| 🧠 Mind Map | Per-source concept map (via mind-elixir) |
| 🔗 Knowledge Graph | Entity relationships across all sources |
| 📅 Timeline | Chronological events detected in the text |
| 🌲 Concept Tree | Hierarchical outline of topics |
| 📋 Summary Card | Key takeaways per source |
| 📊 Stats Card | Numeric data and metrics |
| ⚔️ Conflict Card | Contradictions between sources |
| ⚖️ Comparison Table | Side-by-side analysis |
| 💬 Quote Card | Impactful direct excerpts |
| 💭 Thinking Stream | Live view of Claude's reasoning |

---

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) App Router + TypeScript
- **AI** — [CopilotKit 1.51](https://docs.copilotkit.ai) + [Anthropic Claude Sonnet](https://anthropic.com)
- **Storage** — [Upstash Redis](https://upstash.com) (source metadata) + [Upstash Vector](https://upstash.com/vector) (semantic search)
- **UI** — [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com)
- **Widgets** — [mind-elixir](https://mind-elixir.com), [@xyflow/react](https://reactflow.dev), [Recharts](https://recharts.org), [Framer Motion](https://framer.motion)
- **Package Manager** — [Bun](https://bun.sh)

---

## Prerequisites

- **Node.js** ≥ 20 (or [Bun](https://bun.sh) ≥ 1.1)
- An **Anthropic API key**
- An **Upstash** account (free tier is enough for development)

---

## Setup

### 1. Clone & install

```bash
git clone <your-repo-url>
cd vichar-plexus
bun install
```

### 2. Configure environment variables

Copy the example env file:

```bash
cp .env.local.example .env.local
```

Then fill in your keys (see the sections below for how to get each one):

```env
# .env.local

ANTHROPIC_API_KEY=sk-ant-...

UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

UPSTASH_VECTOR_REST_URL=https://...upstash.io
UPSTASH_VECTOR_REST_TOKEN=...
```

### 3. Run the dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Getting Your API Keys

### 🤖 Anthropic API Key (`ANTHROPIC_API_KEY`)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys** → **Create Key**
4. Copy the key — it starts with `sk-ant-api03-...`

> **Cost note:** Vichar uses `claude-sonnet-4-20250514`. A typical analysis of a single PDF costs roughly $0.01–$0.05 depending on length.

---

### 🗄️ Upstash Redis (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`)

Upstash Redis stores source metadata (file names, chunk counts, source IDs) per workspace.

1. Go to [console.upstash.com](https://console.upstash.com)
2. **Create account** (free tier available)
3. Click **Create Database**
   - Name: `vichar-redis` (or anything)
   - Type: **Regional** → pick the region closest to you
   - Click **Create**
4. On the database page, scroll down to **REST API**
5. Copy:
   - `UPSTASH_REDIS_REST_URL` — the `https://...upstash.io` URL
   - `UPSTASH_REDIS_REST_TOKEN` — the long token string

> **Free tier limits:** 10,000 commands/day, 256 MB storage — more than enough for development and demos.

---

### 🔍 Upstash Vector (`UPSTASH_VECTOR_REST_URL` + `UPSTASH_VECTOR_REST_TOKEN`)

Upstash Vector stores text chunk embeddings for semantic search across your uploaded documents.

1. In [console.upstash.com](https://console.upstash.com), go to the **Vector** section in the sidebar
2. Click **Create Index**
   - Name: `vichar-vector` (or anything)
   - **Dimensions:** `1536` *(matches the hash-based embedding size used in MVP)*
   - **Distance Metric:** `Cosine`
   - Click **Create**
3. On the index page, scroll to **REST API**
4. Copy:
   - `UPSTASH_VECTOR_REST_URL` — the `https://...upstash.io` URL
   - `UPSTASH_VECTOR_REST_TOKEN` — the long token string

> **Note:** The MVP uses a simple hash-based embedding for demonstration purposes. For production-quality semantic search, replace the `simpleHash` function in `src/lib/ingest.ts` with real embeddings from Anthropic (`claude-3-haiku`) or OpenAI (`text-embedding-3-small`).

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout (dark mode, fonts)
│   ├── globals.css                 # Caffeine theme + global styles
│   └── workspace/[id]/
│       ├── page.tsx                # CopilotKit provider wrapper
│       └── WorkspaceContent.tsx    # Main workspace UI + tool registration
│
├── api/
│   ├── copilotkit/route.ts         # CopilotKit runtime (Claude via Anthropic)
│   ├── ingest/route.ts             # File upload + parsing + embedding
│   └── search/route.ts             # Semantic search endpoint
│
├── components/
│   ├── canvas/
│   │   ├── BentoGrid.tsx           # Responsive widget grid
│   │   └── WidgetCard.tsx          # Widget wrapper with expand dialog
│   ├── upload/
│   │   └── DropZone.tsx            # Drag-and-drop file uploader
│   └── widgets/
│       ├── MindMapWidget.tsx        # mind-elixir (SSR disabled)
│       ├── KnowledgeGraphWidget.tsx # @xyflow/react
│       ├── TimelineWidget.tsx
│       ├── ConceptTreeWidget.tsx    # Custom collapsible tree
│       ├── SummaryCard.tsx
│       ├── StatsCard.tsx            # Recharts BarChart
│       ├── ConflictCard.tsx
│       ├── ComparisonTable.tsx
│       ├── QuoteCard.tsx
│       └── ThinkingStream.tsx       # Live AI reasoning panel
│
├── hooks/
│   └── useWorkspace.ts             # Workspace state (sources, widgets, thinking)
│
└── lib/
    ├── claude.ts                   # Vichar system prompt
    ├── tools.ts                    # Widget tool schemas + TypeScript types
    ├── ingest.ts                   # PDF parsing, chunking, embedding
    └── redis.ts                    # Upstash Redis + Vector clients (lazy init)
```

---

## How It Works

```
User drops a file
       │
       ▼
POST /api/ingest
  ├── Parse PDF/TXT/MD text
  ├── Chunk into ~500 token segments
  ├── Generate hash embedding per chunk
  ├── Store chunks in Upstash Vector
  └── Store source metadata in Upstash Redis
       │
       ▼
WorkspaceContent.triggerAnalysis()
  └── Sends message to Claude via CopilotKit:
      "New source uploaded: <filename> (<N> chunks)"
       │
       ▼
Claude (via CopilotKit + AnthropicAdapter)
  ├── Receives system prompt (Vichar research analyst persona)
  ├── Reads source context in the message
  └── Calls one or more widget tools:
      render_mind_map, render_summary_card,
      render_knowledge_graph, render_timeline, ...
       │
       ▼
useCopilotAction handlers (frontend)
  └── Each tool call → addWidget() → BentoGrid re-renders
```

---

## Available Scripts

| Command | Description |
|---|---|
| `bun dev` | Start development server at localhost:3000 |
| `bun build` | Build for production |
| `bun start` | Serve production build |
| `bun lint` | Run ESLint |

---

## Limitations (MVP)

- **Embeddings are hash-based** — not real semantic vectors. Replace with proper embeddings for production search quality.
- **No persistence across sessions** — workspace state lives in React state only; refreshing loses your widgets. Add a persistence layer (localStorage or Redis) if needed.
- **5MB file limit** per upload (enforced in `/api/ingest`).
- **Upstash free tier** has rate limits; for high-volume demos, consider paid tiers.

---

## License

MIT
