---
description: How to create a new feature branch for Vichar
---

# New Feature Branch Workflow

Use this workflow whenever you start working on a new feature, bug fix, or improvement.
The `master` branch is the stable, production branch. All work branches off `develop`, and gets merged back to `develop` first before eventually merging into `master`.

## Branch Naming Convention

| Type        | Pattern                       | Example                         |
| ----------- | ----------------------------- | ------------------------------- |
| Feature     | `feature/<short-description>` | `feature/url-ingestion`         |
| Bug fix     | `fix/<short-description>`     | `fix/mindmap-ssr-crash`         |
| Improvement | `improve/<short-description>` | `improve/bento-grid-responsive` |
| Chore       | `chore/<short-description>`   | `chore/upgrade-copilotkit`      |

---

## Steps

### 1. Make sure you are up to date with `develop`

// turbo

```bash
git checkout develop && git pull origin develop
```

### 2. Create and switch to the new feature branch

Replace `feature/<name>` with the appropriate branch name from the naming convention above.

```bash
git checkout -b feature/<name>
```

### 3. Do your work

Make your code changes. Commit regularly with descriptive messages:

```bash
git add .
git commit -m "feat: <short description of what you did>"
```

Commit message prefixes:

- `feat:` — new feature
- `fix:` — bug fix
- `improve:` — improvement/refactor
- `chore:` — dependency updates, config, tooling

### 4. Push the feature branch to GitHub

// turbo

```bash
git push -u origin HEAD
```

### 5. Open a Pull Request on GitHub

Go to https://github.com/sai-chaitanya-pachipulusu/vichar and open a Pull Request:

- **Base branch**: `develop`
- **Compare branch**: your feature branch
- Add a clear title and description of what the PR does

### 6. Merge into `develop`

After review, merge the PR into `develop`. Delete the feature branch after merging.

### 7. (Release only) Merge `develop` → `master`

When you're ready to ship a stable release:

```bash
git checkout master
git merge develop
git push origin master
```

---

## Quick Reference

```
master          ← stable production branch (never push directly)
  └── develop   ← integration branch (always branch from here)
        ├── feature/url-ingestion
        ├── feature/real-embeddings
        ├── fix/mindmap-render
        └── improve/bento-grid-layout
```
