# PatchBridge

**Multimodal open-source debugging agent that transforms bug reports and error screenshots into evidence-backed, contribution-ready fixes.**

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Model](https://img.shields.io/badge/Model-Gemma_4_31B-emerald.svg)](https://ai.google.dev/)
[![Protocol](https://img.shields.io/badge/Tools-Model_Context_Protocol_(MCP)-sky.svg)](https://modelcontextprotocol.io/)

---

## 1. Overview

Developers often spend hours cross-referencing bug screenshots and stack traces with thousands of lines of source code. Generic chatbots guess code fixes blindly without repository context.

**PatchBridge** addresses this by pairing Google's multimodal **Gemma 4** model (`gemma-4-31b-it`) with **Model Context Protocol (MCP)** repository inspection tools. Given an issue description and screenshot:
1. It visually inspects the error UI, stack trace, and console logs.
2. It systematically traverses the repository using deterministic tools (`list_files`, `search_repo`, `read_file`).
3. It pinpoints the verified line citations causing the defect.
4. It synthesizes a minimal surgical diff, verification test plan, and contribution-ready pull request summary.

PatchBridge provides two shared interfaces:
- **Interactive Web App**: Upload screenshots, load repos, and observe live reasoning traces streamed via Server-Sent Events (SSE).
- **GitHub Bot**: Comment `/patchbridge` on any issue for a responsive two-phase report.

---

## 2. Architecture & Data Flow

```text
[ Developer Input ]
  • Bug Description
  • Error Screenshot (UI / Terminal / DevTools)
  • Target Repository
          ↓
[ Gemma 4 Multimodal Reasoning ]
  • Extracts stack traces & visual error clues
  • Formulates tool investigation strategy
          ↓
[ Model Context Protocol (MCP) Tools ]
  • list_files()      → Maps project hierarchy
  • search_repo()     → Greps tokens (e.g., "validateEmail")
  • read_file()       → Reads lines 10–35 with context
          ↓
[ Evidence-First Synthesis ]
  • Root Cause Diagnosis
  • Verified Code Citations (e.g., src/validation.js:18)
  • Candidate Unified Diff
  • Targeted Test Plan
  • PR-Ready Markdown & Telemetry
          ↓
[ Live Deliverables ]
  ├── Web Client: Real-time SSE stream (/session/:id)
  └── GitHub Bot: Phase 1 Ack Comment → Phase 2 Completion Report
```

---

## 3. Gemma 4 Multimodal Integration

PatchBridge utilizes **Gemma 4** (`gemma-4-31b-it`) via the Google AI Studio free tier.

- **Multimodal Visual Grounding**: Extracts error strings, exception classes, and line numbers from developer screenshots without manual transcription.
- **Dynamic Tool Calling**: Decides when to list files, search keywords, or inspect line ranges.
- **Evidence-First Rule**: Refuses to claim a patch is correct unless grounded in repository evidence. If evidence is inconclusive, it explicitly reports `STATUS: NEEDS HUMAN REVIEW`.

---

## 4. Repository Layout

```text
PatchBridge/
├── AGENTS.md                  # Development guidelines and agent rules
├── GOAL.md                    # Single source of truth & contract
├── LICENSE                    # Apache-2.0 open-source license
├── README.md                  # Technical documentation
├── .env.example               # Root environment configuration
│
├── backend/                   # Node.js + Express API service
│   ├── src/
│   │   ├── index.js           # API entry point & static mounts
│   │   ├── agent/
│   │   │   ├── runner.js      # Gemma 4 loop & deterministic engine
│   │   │   └── prompts.js     # Multimodal system prompts
│   │   ├── tools/
│   │   │   ├── mcpClient.js   # MCP tool declarations & dispatch
│   │   │   ├── localTools.js  # Filesystem tools (list, search, read)
│   │   │   └── githubTools.js # Remote repo cloning & comment poster
│   │   ├── routes/
│   │   │   ├── sessionRoutes.js # REST endpoints
│   │   │   └── streamRoutes.js  # Server-Sent Events (SSE) live feed
│   │   └── github/
│   │       ├── webhookHandler.js # /patchbridge issue listener
│   │       └── botNotifier.js    # Two-phase comment formatting
│   ├── test-run.js            # Headless triage test script
│   └── test-webhook.js        # Webhook flow test script
│
├── frontend/                  # React + Vite + Tailwind web app
│   ├── src/
│   │   ├── App.jsx            # URL router
│   │   ├── components/        # TraceTimeline, DiffViewer, TelemetryCard
│   │   └── pages/             # HomePage, SessionPage
│   └── vite.config.js
│
├── skills/                    # Deliverable Agent Skill
│   └── patch-triage/
│       ├── SKILL.md           # Agent Skills Open Standard workflow
│       ├── references/        # Triage heuristics & diff conventions
│       └── scripts/           # Unified diff validator
│
└── examples/                  # Reproducible test case
    └── demo-bug-repo/         # Intentional empty email crash
        ├── src/               # LoginForm.jsx, validation.js
        ├── tests/             # Automated test suite
        └── assets/            # error-screenshot.png
```

---

## 5. Quick Start & Local Setup

### Prerequisites
- Node.js 18+ (tested on Node 24)
- Git

### 1. Clone & Configure
```bash
git clone https://github.com/Soumyabrataop/PatchBridge.git
cd PatchBridge

# Copy environment template
cp .env.example .env
```

To enable live Google AI Studio reasoning (free tier), add your key to `.env`:
```bash
GEMINI_API_KEY=your_google_ai_studio_key
GEMMA_MODEL=gemma-4-31b-it
```
*(Note: If no key is set, PatchBridge automatically engages its deterministic local engine so you can test all features offline).*

### 2. Install Dependencies
```bash
npm --prefix backend install
npm --prefix frontend install
```

### 3. Run Backend & Frontend
Terminal 1 (Backend API on `http://localhost:3001`):
```bash
npm run dev:backend
```

Terminal 2 (Frontend on `http://localhost:5173`):
```bash
npm run dev:frontend
```

Open `http://localhost:5173` in your browser.

---

## 6. Verification & Automated Tests

All functionality can be tested via root npm scripts:

### Test 1: Verify Bug Reproduction in Demo Repo
```bash
npm run test:demo
```
*Confirms that `examples/demo-bug-repo` fails on unhandled `TypeError` at `src/validation.js:18`.*

### Test 2: Run Headless Agent Triage
```bash
npm run test:triage
```
*Executes the investigation loop, calls MCP tools, and prints the synthesized triage report with verified evidence.*

### Test 3: Test GitHub Webhook Two-Phase Flow
```bash
npm run test:webhook
```
*Simulates a `/patchbridge` command and verifies Phase 1 (instant acknowledgment) and Phase 2 (completion report).*

### Test 4: Validate Deliverable Agent Skill
```bash
node skills/patch-triage/scripts/validate-patch.js "--- a/src/validation.js\n+++ b/src/validation.js\n@@ -17,2 +17,6 @@\n-old\n+new"
```

---

## 7. Two-Phase GitHub Bot Flow

When installed on a repository:

1. **Trigger**: A contributor opens an issue with an error screenshot and comments:
   ```text
   /patchbridge
   ```
2. **Phase 1 (Instant Ack — within 2s)**: The bot immediately replies:
   ```text
   ### ⚡ PatchBridge Investigation Initialized
   I've started an evidence-backed triage session for this issue using Gemma 4.
   👉 [Watch Live Debug Session](https://patchbridge.app/session/pb-gh-123)
   ```
3. **Phase 2 (Completion Report)**: The bot posts the verified diagnosis:
   ```text
   ### 🎯 PatchBridge Analysis Complete
   #### Root Cause
   In `src/validation.js` at line 18, `validateEmail` invokes `.trim()` without checking for null/undefined.
   
   #### Code Evidence
   - `src/validation.js:18` — Direct invocation of .trim() throws TypeError
   - `src/LoginForm.jsx:18` — Propagates raw form state
   
   #### Suggested Fix
   ```diff
   --- a/src/validation.js
   +++ b/src/validation.js
   @@ -17,2 +17,6 @@
   +  if (!email || typeof email !== 'string') {
   +    return { valid: false, error: 'Email is required' };
   +  }
   ```
   ```

---

## 8. Limitations & Scope

- **Proposal Language**: Fixes are presented as "Suggested fix" rather than guaranteed solutions.
- **Safety**: The agent runs read-only repository inspection tools (`list_files`, `search_repo`, `read_file`) and never executes unmonitored shell commands.
- **Automatic PR Creation**: Explicitly decoupled from initial triage to prioritize accurate diagnosis before touching branches.

---

## 9. License

This project is licensed under the **Apache-2.0** License. See [LICENSE](LICENSE) for details.
