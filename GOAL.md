# PatchBridge — Project Goal

## 1. Mission

Build **PatchBridge**, a multimodal open-source debugging agent that helps developers turn a bug report and screenshot into an **evidence-backed, contribution-ready fix**.

Primary competition target:

> **Best Use of Gemma 4**

Secondary goal:

> Keep the project open source and structured so it also qualifies strongly for **Best Open-Source AI Project**.

The product must be small enough to build, test, and demo in a single hackathon day.

---

## 2. Core Product Idea

PatchBridge has two interfaces:

1. **Website**
2. **GitHub bot**

Both interfaces must use the **same backend/agent logic**.

### Core workflow

```text
Bug description
      +
Screenshot
      +
Repository
      ↓
Gemma 4
      ↓
Understand the problem
      ↓
Inspect repository
      ↓
Find likely root cause
      ↓
Cite code evidence
      ↓
Generate minimal patch/diff
      ↓
Suggest tests
      ↓
Generate PR-ready explanation
```

### One-line product pitch

> PatchBridge turns a bug screenshot into an evidence-backed code fix and a contribution-ready pull request.

---

## 3. Primary User Experience

A developer encounters a bug.

They provide:

- a bug/issue description
- a screenshot of the error, UI, terminal, browser console, etc.
- a repository or demo repository

PatchBridge should return:

1. **Observed problem**
2. **Root cause**
3. **Evidence from the repository**
4. **Suggested code change / diff**
5. **Tests to add or run**
6. **PR-ready summary**

The system must clearly distinguish:

- facts found in the repository
- model inference
- proposed changes
- areas requiring human review

Never claim that a patch is definitely correct unless it has actually been verified.

---

# 4. Website Requirements

## Required MVP

The website must support:

### Input

- Bug/issue text
- Screenshot upload
- Repository input

Repository input may initially be:
- uploaded ZIP, or
- a small local/demo repository supported by the backend

Do **not** require GitHub OAuth for the MVP.

### Output & Live Session Experience

Render the analysis in this order:

```text
INPUT
  ↓
LIVE AGENT TRACE (Streaming SSE)
  ↓
ROOT CAUSE
  ↓
CODE EVIDENCE & TELEMETRY
  ↓
PATCH / DIFF
  ↓
TEST PLAN
  ↓
CONTRIBUTION READY
```

The interface supports live streaming of the agent's investigation over Server-Sent Events (SSE) at `/session/:sessionId`:
- Anyone with the session link can view the live reasoning trace in real time.
- The interface makes the agent's reasoning process observable without exposing private chain-of-thought.
- Shows concise, useful tool activity (including MCP and local repo calls) such as:

```text
✓ Parsed issue and extracted visual clues from screenshot
✓ Connected to repository context
✓ [MCP] Searched repository for "validateEmail"
✓ [MCP] Read src/auth/validation.js:15-40
✓ [MCP] Read src/components/LoginForm.jsx:30-55
✓ Correlated UI runtime crash with missing null check
✓ Generated candidate patch and test cases
```

- Telemetry & Evidence card highlights the exact lines in code, blast radius, and impacted modules.

---

# 5. GitHub Bot Requirements

The GitHub bot is a thin interface over the same PatchBridge agent.

## MVP interaction (Two-Phase Feedback)

A developer opens a GitHub issue containing:

- issue description
- optionally a screenshot

Then comments:

```text
/patchbridge
```

The bot executes a responsive two-phase interaction:

### Phase 1: Immediate Acknowledgment & Live Session Tracking

Within seconds of receiving the webhook trigger, the bot posts an initial comment with a unique public session link so the developer and community can watch the agent reason and invoke tools live:

```text
⚡ **PatchBridge is on the case!**

I've initialized a private debugging session for this issue. You can watch my real-time reasoning and MCP repo tool calls as I investigate:

👉 **[Watch Live Debug Session](https://patchbridge.app/session/<sessionId>)**

Investigating root cause and code evidence now...
```

### Phase 2: Completion Report & Proposed Fix

Once the Gemma 4 investigation loop finishes, the bot posts a second comment (or updates the tracking comment) with the evidence-backed findings:

```text
🎯 **PatchBridge Analysis Complete!**

### Root Cause
<short explanation of why the bug occurred>

### Code Evidence
- `src/auth/validation.js:42` — Missing null check on empty email string input
- `src/components/LoginForm.jsx:18` — Form submit handler crashes on undefined error object

### Suggested Fix
```diff
--- a/src/auth/validation.js
+++ b/src/auth/validation.js
@@ -42,3 +42,5 @@
+  if (!email || email.trim() === '') {
+    return { valid: false, error: 'Email is required' };
+  }
```

### Recommended Test Cases
- [ ] Submitting login form with empty email field displays validation warning without crashing
- [ ] Submitting login form with whitespace-only email string is rejected cleanly

📊 **Full Telemetry & Interactive Diff:**
[View Complete Report](https://patchbridge.app/session/<sessionId>)
```

## Important scope rule

Do **NOT** make automatic PR creation a required MVP feature.

Automatic branch/commit/PR creation may be added only after the full analysis workflow is stable.

---

# 6. AI / Gemma 4 Requirements

Gemma 4 must be a meaningful part of the product, not a decorative API call.

Use Gemma 4 for the parts that benefit from model reasoning:

- interpreting the screenshot
- understanding the bug report
- deciding which repository tools to use
- connecting the issue to relevant code
- proposing the root cause
- generating a minimal patch
- generating tests
- generating PR-ready explanation

The application itself should handle deterministic operations:

- reading files
- listing files
- searching text
- filtering ignored directories
- collecting repository context
- executing safe local utilities
- formatting output

This division is intentional.

---

# 7. Agent Tooling & MCP (Model Context Protocol) Integration

The PatchBridge agent uses the **Model Context Protocol (MCP)** architecture to standardize how Gemma 4 discovers and invokes repository investigation tools.

### MCP Tool Providers

The agent connects to two interchangeable tool providers through MCP:

1. **GitHub MCP Server (Remote / Webhook Mode)**:
   - `github_read_file(owner, repo, path, branch)` — Reads specific file contents from the target GitHub repository.
   - `github_search_code(owner, repo, query)` — Searches code, function names, and error strings across the repository.
   - `github_list_directory(owner, repo, path)` — Lists directories and files to discover project structure.
   - `github_create_issue_comment(owner, repo, issue_number, body)` — Posts phase 1 acknowledgment and phase 2 triage reports.

2. **Local Repo Tools / Filesystem MCP (Local & Demo Mode)**:
   - `list_files()` — Explores repository layout with automatic ignore filtering.
   - `search_repo(query)` — Greps repository for tokens, function definitions, and crash messages.
   - `read_file(path)` — Reads source file contents.

### Tool Call Guarantees

- **Deterministic Execution**: The agent does not run unmonitored shell commands.
- **Progressive Disclosure**: The agent starts with directory mapping and keyword search, then reads targeted files. It never blindly ingests the entire codebase.
- **Trace Transparency**: Every MCP tool call and its execution status (`started`, `completed`, `result summary`) are emitted live to the active session stream.

Optional later tools:

```text
get_file_range(path, start, end)
run_tests(test_command)
```

Only add more tools when they clearly improve the demo.

---

# 8. Repository Handling

Ignore large/generated directories by default:

```text
.git
node_modules
dist
build
coverage
.cache
.next
venv
__pycache__
```

Prefer relevant source files.

Use issue keywords and tool results to progressively narrow context.

The system should avoid sending unnecessary repository contents to the model.

---

# 9. Evidence-First Design

This is a core product rule.

A diagnosis should include concrete repository evidence.

Preferred format:

```text
Root cause:
<explanation>

Evidence:
- src/auth/validation.js:18
  <why this line matters>

- src/components/LoginForm.jsx:42
  <why this line matters>
```

If sufficient evidence cannot be found:

```text
STATUS: NEEDS HUMAN REVIEW

PatchBridge could not identify enough repository evidence
to confidently propose a fix.
```

Do not fabricate file names, line numbers, behavior, or test results.

---

# 10. Patch Rules

Generated fixes should favor:

- smallest reasonable change
- existing project conventions
- minimal unrelated edits
- explicit assumptions
- tests for the reported failure

The product should describe generated patches as **proposals** unless they have actually been verified.

Preferred language:

> Suggested fix

not:

> Guaranteed fix

---

# 11. Safety / Trust Requirements

The agent must not:

- invent repository evidence
- claim tests passed when they were not run
- claim a PR was created when it was not
- expose API keys
- execute arbitrary destructive commands from model output
- modify unrelated files without a clear reason

Any test runner or shell execution added later must use an allowlist/sandboxed design.

---

# 12. Open-Source Requirements

The repository must be public.

Include:

```text
LICENSE
README.md
GOAL.md
```

Recommended license:

```text
Apache-2.0
```

The README should explain:

- problem
- solution
- architecture
- Gemma 4 usage
- website
- GitHub bot
- Agent Skill
- local setup
- demo flow
- limitations

---

# 13. Agent Skill

Add a reusable Agent Skill so the project also has a strong open-source AI component.

Recommended structure:

```text
skills/
└── patch-triage/
    ├── SKILL.md
    ├── references/
    └── scripts/
```

The skill should define a reusable workflow for:

```text
issue
+
screenshot
+
repository
→
investigate
→
evidence
→
patch
→
tests
→
PR summary
```

Follow the Agent Skills Open Standard.

Validate the skill before submission.

---

# 14. Suggested Repository Structure

```text
patchbridge/
├── frontend/
├── backend/
│   ├── agent/
│   ├── tools/
│   ├── github/
│   └── routes/
├── skills/
│   └── patch-triage/
│       ├── SKILL.md
│       ├── references/
│       └── scripts/
├── examples/
│   └── demo-bug-repo/
├── public/
├── GOAL.md
├── README.md
├── LICENSE
└── .gitignore
```

Agents may change the exact structure if the resulting system is simpler and more reliable.

---

# 15. Recommended Technical Direction

Suggested stack:

```text
Frontend:
React + Vite

Backend:
Node.js + Express

AI:
Gemma 4 through the supported Google Gemini API

Source control integration:
GitHub App / webhook or minimal bot implementation

Deployment:
Any free hosting suitable for the frontend/backend
```

Do not introduce infrastructure merely because it is fashionable.

Avoid unnecessary:

- databases
- vector databases
- authentication systems
- microservices
- message queues
- Kubernetes
- multi-agent orchestration

---

# 16. Demo Scenario

Use a tiny intentionally buggy repository.

Example:

```text
demo-repo/
├── src/
│   ├── LoginForm.jsx
│   └── validation.js
└── tests/
    └── validation.test.js
```

Bug:

```text
Submitting the login form with an empty email
causes a runtime error.
```

The screenshot should show a believable error.

Expected demo:

```text
Screenshot + issue
        ↓
PatchBridge understands the error
        ↓
search_repo("email validation")
        ↓
read relevant files
        ↓
Gemma 4 identifies root cause
        ↓
show exact evidence
        ↓
show small diff
        ↓
show test cases
        ↓
show PR-ready summary
```

This scenario is preferred because the judge can understand it immediately.

---

# 17. Hackathon Priority Order

Implement in this order.

## P0 — Must work

1. Gemma 4 API integration
2. Screenshot + issue input
3. Repository file tools
4. Agent investigation loop
5. Root-cause output
6. Evidence output
7. Patch/diff output
8. Test suggestions
9. Working website
10. Public GitHub repository

## P1 — Strong differentiators

11. Agent trace UI
12. GitHub `/patchbridge` bot
13. Agent Skill
14. PR-ready summary
15. Polished demo repository

## P2 — Only after everything above works

16. Test execution
17. GitHub check runs
18. Automatic branch/commit
19. Automatic PR creation
20. Advanced repository indexing

Never sacrifice a working P0 feature to implement a P2 feature.

---

# 18. Six-Hour Build Strategy

The effective build window is approximately:

```text
11:00–17:00
```

Suggested order:

### Phase 1
Get a single screenshot + issue → Gemma 4 response working.

### Phase 2
Add repository tools.

### Phase 3
Add agent loop.

### Phase 4
Generate evidence + patch + tests.

### Phase 5
Build the polished website flow.

### Phase 6
Add GitHub bot.

### Phase 7
Add Agent Skill, README, license, demo data.

### Final
Freeze features and rehearse the demo.

If time becomes tight, prioritize the website and core agent over the GitHub bot.

---

# 19. Explicit Non-Goals

Do not build these unless all MVP requirements are complete:

- user accounts
- Firebase/auth
- database
- RAG/embeddings
- vector database
- voice interface
- mobile app
- billing
- analytics
- complex dashboard
- multi-agent swarm
- autonomous coding across huge repositories
- automatic PR creation
- full CI/CD platform

The goal is a **small, impressive, reliable agent**, not a complete developer platform.

---

# 20. Acceptance Criteria

The project is considered MVP-complete when all of these are true:

- [ ] Website starts successfully.
- [ ] User can submit a bug description.
- [ ] User can upload a screenshot.
- [ ] System can inspect a demo repository.
- [ ] Gemma 4 is used for multimodal understanding.
- [ ] Agent discovers and calls MCP repository tools (`read_file`, `search_repo`, `list_files`).
- [ ] Agent streams real-time reasoning trace & tool calls over SSE to `/session/:sessionId`.
- [ ] Agent can identify a likely root cause.
- [ ] Root cause includes concrete repository evidence citations.
- [ ] Agent can generate a candidate diff.
- [ ] Agent can suggest relevant tests.
- [ ] Website presents the workflow and code telemetry clearly.
- [ ] GitHub bot immediately responds to `/patchbridge` with a live session tracking link.
- [ ] GitHub bot delivers final summary comment with evidence and diff when analysis finishes.
- [ ] Public GitHub repository exists.
- [ ] Open-source license exists.
- [ ] Agent Skill exists and is valid.
- [ ] No secret/API key is committed.
- [ ] Demo works end-to-end on the prepared example.

---

# 21. Definition of "Good"

A strong implementation should make a judge think:

> "This is not just a chatbot."

They should be able to see:

```text
multimodal input
+
agentic repository investigation (via MCP)
+
live observable reasoning trace (via SSE)
+
concrete code evidence & telemetry
+
useful patch
+
open-source workflow
```

The demo should be understandable within 30 seconds and impressive within 3 minutes.

---

# 22. Definition of "Done"

Do not keep adding features once the following demo works reliably:

```text
1. User opens GitHub issue with error screenshot and types /patchbridge (or uses web UI).
2. Bot instantly replies with acknowledgment comment + live session URL.
3. User opens session URL and watches live SSE agent trace as Gemma 4 calls MCP tools.
4. Agent identifies root cause, pinpoints code evidence lines, diff, and tests.
5. Bot comments back on GitHub issue with concise evidence, patch, and full report link.
6. Web report renders interactive diff, blast radius telemetry, and PR summary.
```

**Reliability beats feature count.**

---

# 23. Instruction to Coding Agents / Harnesses

Treat this file as the project contract.

When making implementation decisions:

1. Prefer the smallest solution that satisfies the goal.
2. Preserve the shared agent core between website and GitHub bot.
3. Keep Gemma 4 central to the multimodal reasoning workflow.
4. Prefer deterministic tooling around the model.
5. Do not invent capabilities or evidence.
6. Do not add infrastructure without a clear need.
7. Protect secrets.
8. Optimize for a reliable live demo.
9. Follow the P0 → P1 → P2 priority order.
10. When uncertain, choose the option that reduces implementation risk while preserving the core demo.

# Final Product Identity

**Name:** PatchBridge

**Category:** Multimodal developer/open-source contribution agent

**Primary track:** Best Use of Gemma 4

**Secondary track:** Best Open-Source AI Project

**Core promise:**

> From bug screenshot to contribution-ready fix.
