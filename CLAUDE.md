# Project Context: Vichar/Plexus
An AI-native research workbench where dropping files / URLs causes Claude to think visibly and manifest understanding as pre-built widgets on a bento canvas. The key insight: Claude doesn't generate UI code — it selects and populates from a registry of rich components. The widget registry gives Claude a palette — Claude paints. A blank canvas that becomes alive when you drop content onto it. Think of it as a workspace with "AI senses" - it watches what you add, thinks about it, and manifests understanding through a dynamic bento-grid interface.

## Core Technical Info
- **Tech Stack:** Next.js, Tailwind, Bun, Shadcn
- **Style:** Concise, functional, no classes, strict TypeScript

## Critical Commands
- **Build:** `bun run build`
- **Dev:** `bun dev`
- **Test:** `bun test`
- **Lint:** `bun lint`

## Execution Rules
- Always use standard library before adding dependencies.
- Use `inline` exports.
- Prefer simplicity/readability over "clever" abstractions (KISS/YAGNI).
- If a change is complex, propose a **Plan** before writing code.
- Don't over engineer, keep it simple and be precise with whatever you're working on
