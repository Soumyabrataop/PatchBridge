---
inclusion: always
---

# PatchBridge — Stack Reference

Quick reference for the runtime, directory layout, environment, and commands. Consult this before adding dependencies or creating new files.

---

## Runtime Versions

| Component | Requirement |
|---|---|
| Node.js | 18+ (tested on Node 24) |
| npm | Bundled with Node |
| OS (host) | Windows 11 / PowerShell |
| WSL 2 | Ubuntu — available for Linux-native tooling via `wsl -d Ubuntu -e <cmd>` |

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3 |
| Backend | Node.js (ESM) + Express 4 |
| AI / Reasoning | Google Gemini API (`@google/generative-ai`) — model `gemma-4-31b-it` or `gemini-2.5-flash` |
| Session store | In-memory `Map` + disk-persisted JSON (no database) |
| File uploads | `multer` (local disk) |
| Real-time stream | Server-Sent Events (SSE) |
| ID generation | `uuid` v11 |

---

## Directory Layout

```
PatchBridge/                       ← repo root
├── .env                           ← secrets (never commit)
├── .env.example                   ← template (safe to commit)
├── package.json                   ← root workspace scripts
├── AGENTS.md                      ← full agent development guidelines
├── GOAL.md                        ← product contract (source of truth)
│
├── backend/
│   ├── package.json
│   └── src/
│       ├── index.js               ← Express server entry, port 3001
│       ├── agent/
│       │   ├── runner.js          ← Gemma 4 loop + deterministic fallback
│       │   └── prompts.js         ← system prompt + investigation prompt builder
│       ├── tools/
│       │   ├── mcpClient.js       ← MCP tool declarations + dispatch
│       │   ├── localTools.js      ← listFiles, searchRepo, readFile implementations
│       │   └── githubTools.js     ← GitHub API / remote repo tools
│       ├── routes/
│       │   ├── sessionRoutes.js   ← POST/GET /api/sessions
│       │   ├── streamRoutes.js    ← GET /api/sessions/:id/stream (SSE)
│       │   └── authRoutes.js      ← GitHub OAuth flow
│       ├── github/
│       │   ├── webhookHandler.js  ← /patchbridge issue_comment listener
│       │   └── botNotifier.js     ← formatPhase1Comment, formatPhase2Comment
│       └── store/
│           ├── sessionStore.js    ← EventEmitter session store
│           └── tokenRegistry.js  ← GitHub token registry
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                ← router + view switcher
│       ├── pages/
│       │   ├── HomePage.jsx       ← hero + product features
│       │   └── SessionPage.jsx    ← live SSE trace + triage report
│       └── components/
│           ├── TraceTimeline.jsx
│           ├── DiffViewer.jsx
│           ├── TelemetryCard.jsx
│           ├── WorkspaceDashboard.jsx
│           └── Navbar.jsx
│
├── skills/
│   └── patch-triage/
│       ├── SKILL.md               ← Agent Skills Open Standard workflow
│       ├── references/            ← triage-heuristics.md, diff-conventions.md
│       └── scripts/               ← validate-patch.js
│
└── examples/
    └── demo-bug-repo/             ← intentionally buggy LoginForm + validation crash
        ├── src/
        │   ├── validation.js      ← known bug: validateEmail(undefined) crashes at line 18
        │   └── LoginForm.jsx
        └── tests/
            └── validation.test.js ← node:test suite (one intentionally failing test)
```

---

## Environment Variables

Defined in `.env` at the repo root. See `.env.example` for the full template.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3001` | Backend Express server port |
| `FRONTEND_URL` | `http://localhost:5173` | Used in bot comment links |
| `GEMINI_API_KEY` | *(empty)* | Google AI Studio key — if unset, deterministic fallback activates |
| `GEMMA_MODEL` | `gemma-4-31b-it` | Target model name |
| `GITHUB_CLIENT_ID` | *(empty)* | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | *(empty)* | GitHub OAuth App client secret |
| `VITE_API_BASE_URL` | `http://localhost:3001` | Frontend API base (Vite env var) |

**Never commit `.env`.** Use `.env.example` as the template.

---

## Install Commands

```powershell
# Install all dependencies
npm --prefix backend install
npm --prefix frontend install
npm --prefix examples/demo-bug-repo install
```

---

## Run Commands

```powershell
# Backend API (port 3001)
npm run dev:backend          # node --watch src/index.js

# Frontend dev server (port 5173)
npm run dev:frontend         # vite

# Production backend
npm run start:backend        # node src/index.js

# Build frontend
npm run build:frontend       # vite build
```

---

## Test Commands

```powershell
# Run demo-bug-repo test suite (node:test)
npm run test:demo            # node --test tests/validation.test.js

# Run headless agent triage (integration smoke test)
npm run test:triage          # node test-run.js  (inside backend/)

# Run GitHub webhook two-phase flow test
npm run test:webhook         # node test-webhook.js  (inside backend/)

# Validate the patch-triage skill
node skills/patch-triage/scripts/validate-patch.js "<unified-diff-string>"
```

---

## Adding New Dependencies

- Pin to exact major versions (e.g., `"^3.0.0"` not `"*"`).
- Add to the correct `package.json` (backend, frontend, or demo-bug-repo) — not the root.
- Prefer packages that are already in the dependency tree before adding new ones.
- Do not introduce databases, vector stores, Redis, or message queues.

---

## Key API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/sessions` | Start new triage session (multipart form: `issueText`, `screenshot`) |
| `GET` | `/api/sessions` | List all sessions |
| `GET` | `/api/sessions/:id` | Get session state + report |
| `GET` | `/api/sessions/:id/stream` | SSE live trace stream |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/github/webhook` | GitHub webhook receiver |
| `GET` | `/api/auth/github/url` | GitHub OAuth URL |
| `GET` | `/api/auth/github/callback` | GitHub OAuth callback |
