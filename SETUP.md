# Vichar — Developer Setup Guide

This guide covers how to get the project running on **Windows** (recommended: with WSL2 Ubuntu) or directly on Windows with Node.js.

---

## Why WSL2? (and when you need it)

> **Short answer:** You don't _need_ WSL2 for this project, but it's strongly recommended if you're on Windows.

This is a **Node.js / Next.js project** (not Python), so there's no `venv`. However, WSL2 is useful because:

- The original author uses **Bun** as the package manager - Bun runs dramatically faster on Linux than on Windows
- `node_modules` installation via Bun can be 5–10× faster inside WSL2
- Shell scripts, git hooks, and tooling all behave identically to Linux/macOS CI
- Avoids Windows path-separator issues in some edge cases

If you prefer to stay on Windows with Node/npm only, that works too — see the [Windows-only path](#option-b-windows-only-nodejs--npm).

---

## Prerequisites

Before anything, make sure you have these:

| Tool                          | Version | Download            |
| ----------------------------- | ------- | ------------------- |
| Node.js                       | ≥ 20    | https://nodejs.org  |
| Git                           | any     | https://git-scm.com |
| WSL2 + Ubuntu _(recommended)_ | 2       | See below           |
| Bun _(recommended)_           | ≥ 1.1   | https://bun.sh      |

---

## Option A: WSL2 + Ubuntu (Recommended for Windows devs)

### 1. Enable WSL2 and install Ubuntu

Open **PowerShell as Administrator** and run:

```powershell
wsl --install
```

This installs WSL2 and Ubuntu 24.04 LTS in one command. Restart when prompted.

After restart, open the **Ubuntu** terminal app (search in Start menu). Set your UNIX username and password when asked.

> **Note:** If you already have Docker Desktop, WSL2 is already enabled. You just need to install a Linux distro:
>
> ```powershell
> wsl --install -d Ubuntu
> ```

### 2. Install Bun inside WSL2

Inside your Ubuntu terminal:

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version   # should print 1.x.x
```

### 3. Install Node.js inside WSL2 (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
node --version   # should print v20.x.x
```

### 4. Clone the repo inside WSL2

> **Important:** Clone the repo _inside_ the Linux filesystem (not under `/mnt/c/`). This gives you full Linux I/O speed.

```bash
cd ~
mkdir -p projects && cd projects
git clone https://github.com/sai-chaitanya-pachipulusu/vichar.git
cd vichar
```

### 5. Install dependencies

```bash
bun install
```

### 6. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` in your editor (e.g. `nano .env.local` or open the folder in VS Code via `code .`) and fill in your keys:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
UPSTASH_VECTOR_REST_URL=https://...upstash.io
UPSTASH_VECTOR_REST_TOKEN=...
```

See [Getting Your API Keys](#getting-your-api-keys) below.

### 7. Start the dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your Windows browser.

---

## Option B: Windows-only (Node.js + npm)

If you prefer not to use WSL2, you can run everything with Node.js + npm directly on Windows.

### 1. Install Node.js

Download the LTS installer from https://nodejs.org. Verify:

```powershell
node --version   # v20.x.x or higher
npm --version
```

### 2. Clone the repo

```powershell
git clone https://github.com/sai-chaitanya-pachipulusu/vichar.git
cd vichar
```

### 3. Install dependencies

> **Note:** This project uses a `bun.lock` lockfile. npm can still install all packages from `package.json` using:

```powershell
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is required because `@copilotkit/runtime` has a peer dependency conflict with `@anthropic-ai/sdk`.

### 4. Configure environment variables

```powershell
copy .env.local.example .env.local
```

Edit `.env.local` with your keys (see [Getting Your API Keys](#getting-your-api-keys) below).

### 5. Start the dev server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Getting Your API Keys

### 🤖 Anthropic API Key (`ANTHROPIC_API_KEY`)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / log in → **API Keys** → **Create Key**
3. Copy the key starting with `sk-ant-api03-...`

> **Cost:** A typical single-file analysis costs ~$0.01–$0.05 depending on document length.

### 🗄️ Upstash Redis

Used to store source metadata **and** persist your workspace canvas across sessions.

1. Go to [console.upstash.com](https://console.upstash.com) and create a free account
2. Click **Create Database** → Regional → pick your region → **Create**
3. On the database page → **REST API** section, copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 🔍 Upstash Vector

Used to store text chunk embeddings for semantic search.

1. In the Upstash console → **Vector** sidebar → **Create Index**
   - Dimensions: `1536`
   - Distance Metric: `Cosine`
2. On the index page → **REST API** section, copy:
   - `UPSTASH_VECTOR_REST_URL`
   - `UPSTASH_VECTOR_REST_TOKEN`

---

## Available Scripts

| Command (Bun) | Command (npm)   | Description                        |
| ------------- | --------------- | ---------------------------------- |
| `bun dev`     | `npm run dev`   | Start dev server at localhost:3000 |
| `bun build`   | `npm run build` | Build for production               |
| `bun start`   | `npm run start` | Serve production build             |
| `bun lint`    | `npm run lint`  | Run ESLint                         |

---

## VS Code Setup (optional but recommended)

If you're using VS Code with WSL2, open the project from inside WSL:

```bash
# inside Ubuntu terminal
cd ~/projects/vichar
code .
```

VS Code will connect via the **Remote - WSL** extension automatically.

Recommended extensions:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **Remote - WSL** (`ms-vscode-remote.remote-wsl`)

---

## Git Branching Workflow

See `.agent/workflows/new-feature-branch.md` for the full branching strategy.

Quick summary:

- `master` → stable production (never push directly)
- `develop` → integration branch (always branch from here)
- `feature/<name>` → your feature work

```bash
# Start a new feature
git checkout develop && git pull origin develop
git checkout -b feature/my-feature

# Push when ready
git push -u origin HEAD
# Then open a PR on GitHub targeting `develop`
```

---

## What's gitignored

The following are excluded from version control (see `.gitignore`):

| Path            | Reason                                                 |
| --------------- | ------------------------------------------------------ |
| `node_modules/` | Installed locally — run `npm install` or `bun install` |
| `.next/`        | Next.js build output                                   |
| `.env.local`    | Contains secret API keys — **never commit this**       |
| `*.tsbuildinfo` | TypeScript incremental build cache                     |
| `.wsl-env`      | Local WSL2 environment notes (if you create one)       |
