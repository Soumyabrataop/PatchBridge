# AGENTS.md — PatchBridge Agent Guidelines & Architecture

This document guides AI agents working on **PatchBridge**. It defines the environment, architecture, directory layout, and development rules to ensure consistent and reliable execution.

---

## 1. Project Mission & Targets

- **Project**: **PatchBridge** — A multimodal open-source debugging agent that turns a bug description and screenshot into an evidence-backed, contribution-ready code fix.
- **Primary Hackathon Track**: **Best Use of Gemma 4** (Google Gemini / Gemma multimodal reasoning).
- **Secondary Track**: **Best Open-Source AI Project** (Public repo, Agent Skills Open Standard, MCP integration).
- **Single Source of Truth**: Refer to [`GOAL.md`](./GOAL.md) as the project contract and requirements specification.

---

## 2. Environment & Execution Guidelines

### Host & Shell Environment
- **Host OS**: Windows 11 (PowerShell).
- **WSL 2 (Ubuntu)**: Available for Linux-native tooling, scripts, or build tasks:
  ```powershell
  wsl -d Ubuntu -e <command>
  ```
- **Path Mapping**:
  - Windows: `C:\Users\hp\Downloads\PatchBridge`
  - WSL: `/mnt/c/Users/hp/Downloads/PatchBridge`

### Runtime & Dependency Guidelines
- **Node.js & Express**: Backend API and agent runtime.
- **React + Vite + Tailwind CSS**: Frontend web client.
- **Zero Cost / Free Tier**:
  - AI reasoning: Google AI Studio free tier (Gemini / Gemma API).
  - GitHub integration: Standard GitHub REST/GraphQL API & Webhooks (authenticated PAT / App).
  - Storage: In-memory session store and lightweight local JSON files (no external databases, vector stores, or Redis).

---

## 3. Directory Layout — Where Everything Lies

```text
PatchBridge/
├── AGENTS.md                      # This guide for coding agents
├── GOAL.md                        # Master project contract & requirements
├── LICENSE                        # Open-source license (Apache-2.0)
├── README.md                      # Project documentation and demo walkthrough
│
├── .agents/                       # Agent customization & skills
│   └── skills/
│       ├── frontend-design/       # UI aesthetic and typography guidance
│       ├── mcp-builder/           # Model Context Protocol server/client guide
│       ├── shadcn/                # shadcn/ui components and styling
│       ├── vercel-react-best-practices/ # React performance & streaming patterns
│       └── web-artifacts-builder/ # Multi-component UI architecture
│
├── backend/                       # Node.js + Express backend service
│   ├── package.json
│   ├── src/
│   │   ├── index.js               # Express server entry point
│   │   ├── agent/                 # Gemma 4 reasoning loop & prompt templates
│   │   │   ├── runner.js          # Core agent investigation loop
│   │   │   └── prompts.js         # Multimodal prompt definitions
│   │   ├── tools/                 # Repository tools & MCP clients
│   │   │   ├── mcpClient.js       # Model Context Protocol integration
│   │   │   ├── localTools.js      # Fallback deterministic repo tools (list, search, read)
│   │   │   └── githubTools.js     # GitHub API / MCP remote repo tools
│   │   ├── routes/                # HTTP & SSE endpoints
│   │   │   ├── sessionRoutes.js   # POST /api/sessions, GET /api/sessions/:id
│   │   │   └── streamRoutes.js    # GET /api/sessions/:id/stream (Server-Sent Events)
│   │   └── github/                # GitHub bot & webhook listener
│   │       ├── webhookHandler.js  # /patchbridge issue_comment handler
│   │       └── botNotifier.js     # 2-phase comment posters (initial ack + final report)
│
├── frontend/                      # React + Vite web application
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── App.jsx                # Router & main view
│   │   ├── components/            # UI components (DiffViewer, TraceTimeline, TelemetryCard)
│   │   ├── pages/
│   │   │   ├── HomePage.jsx       # Direct upload & demo repository selector
│   │   │   └── SessionPage.jsx    # Live SSE reasoning trace & full triage report
│   │   └── lib/                   # Utility helpers & API client
│
├── skills/                        # Deliverable Agent Skill for the open-source community
│   └── patch-triage/
│       ├── SKILL.md               # Agent Skills Open Standard triage workflow
│       ├── references/            # Triage heuristics and diff rules
│       └── scripts/               # Validation scripts
│
└── examples/                      # Reproducible demo scenario
    └── demo-bug-repo/             # Small buggy repo (LoginForm + validation crash)
        ├── src/
        │   ├── LoginForm.jsx
        │   └── validation.js
        ├── tests/
        │   └── validation.test.js
        └── assets/
            └── error-screenshot.png
```

---

## 4. Core Architecture & Workflow Rules

### Rule 1: Shared Agent Core
Both the **Website** and the **GitHub Bot** MUST execute the exact same agent logic in `backend/src/agent/`. The bot is merely a webhook trigger and comment renderer on top of the shared core.

### Rule 2: Evidence-First Diagnosis
- The agent must cite exact source lines (e.g. `src/auth/validation.js:42`) discovered through repository tools.
- Never hallucinate file paths, line numbers, or test results.
- If insufficient evidence is found, explicitly return `STATUS: NEEDS HUMAN REVIEW`.
- Fixes must be labeled as **"Suggested fix"**, never "Guaranteed fix".

### Rule 3: Responsive Two-Phase GitHub Bot Flow
1. **Phase 1 (Instant Ack)**: Within seconds of detecting `/patchbridge` on an issue, immediately comment with a link to the live session:
   `https://patchbridge.app/session/<sessionId>`
2. **Phase 2 (Final Report)**: Once the investigation finishes, comment with root cause, concrete code citations, proposed unified diff, test suggestions, and link to the full telemetry page.

### Rule 4: Live Session Trace via SSE
- The backend emits real-time steps (`started`, `tool_call`, `observation`, `completed`) over Server-Sent Events (`/api/sessions/:id/stream`).
- The frontend renders an animated, observable trace of tool actions (e.g., `✓ Searched repo for "validateEmail"`, `✓ Inspected src/auth/validation.js`) without exposing raw, confusing chain-of-thought tokens.

### Rule 5: MCP Standard
- Tool discovery and invocation follow the Model Context Protocol (MCP) standard.
- Use GitHub MCP tools for remote repositories and local filesystem tools for uploaded/demo repositories.

### Rule 6: Professional Communication & Restrained Emoji Usage
- Maintain a concise, technical, and professional tone across documentation, code comments, and UI copy.
- Avoid emoji spam or purely decorative icons.
- Use symbols or indicators strictly for functional status clarity (e.g., checkmarks `✓`, warnings `⚠`, or standard bullet points).

---

## 5. Development Priority Checklist

Always follow the **P0 → P1 → P2** priority order:

- [ ] **P0 (Must Work First)**:
  1. Gemma 4 multimodal reasoning (issue text + screenshot).
  2. Deterministic repo inspection tools (`list_files`, `search_repo`, `read_file`).
  3. Structured output (Root cause + Repo evidence + Diff + Test plan).
  4. React web frontend for upload, demo selection, and report rendering.
  5. End-to-end working demo on `examples/demo-bug-repo/`.
- [ ] **P1 (Strong Differentiators)**:
  1. Live SSE agent trace timeline on `/session/:id`.
  2. GitHub `/patchbridge` webhook integration with 2-phase comments.
  3. Agent Skill package (`skills/patch-triage/SKILL.md`).
- [ ] **P2 (Nice-to-Have Post-Demo)**:
  1. Automated branch creation / PR draft.
  2. In-browser sandbox test execution.
