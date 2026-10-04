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

### Output

Render the analysis in this order:

```text
INPUT
  ↓
AGENT TRACE
  ↓
ROOT CAUSE
  ↓
CODE EVIDENCE
  ↓
PATCH / DIFF
  ↓
TEST PLAN
  ↓
CONTRIBUTION READY
```

The interface should make the agent's reasoning process observable without exposing private chain-of-thought.

Show only concise, useful tool activity such as:

```text
✓ Parsed issue
✓ Inspected screenshot
✓ Searched repository for "validateEmail"
✓ Read src/auth/validation.js
✓ Read src/components/LoginForm.jsx
✓ Generated candidate patch
```

---

# 5. GitHub Bot Requirements

The GitHub bot is a thin interface over the same PatchBridge agent.

## MVP interaction

A developer opens a GitHub issue containing:

- issue description
- optionally a screenshot

Then comments:

```text
/patchbridge
```

The bot should:

1. Receive the issue context.
2. Obtain repository context.
3. Use the same PatchBridge analysis pipeline.
4. Post a concise response to the issue.

Example response structure:

```text
PatchBridge analyzed this issue.

Root cause:
<short explanation>

Evidence:
- path/to/file.js:42
- path/to/other-file.jsx:18

Suggested fix:
<short diff or concise code change>

Tests:
- case 1
- case 2
- case 3

Full analysis:
<website link>
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

# 7. Agent Tooling

Keep the agent small.

Initial tools:

```text
list_files()
search_repo(query)
read_file(path)
```

Optional later tools:

```text
get_file_range(path, start, end)
run_tests(test_command)
```

Only add more tools when they clearly improve the demo.

The agent should not blindly read the entire repository.

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
- [ ] Agent can call repository tools.
- [ ] Agent can identify a likely root cause.
- [ ] Root cause includes repository evidence.
- [ ] Agent can generate a candidate diff.
- [ ] Agent can suggest relevant tests.
- [ ] Website presents the workflow clearly.
- [ ] GitHub bot can respond to `/patchbridge`, or bot work is explicitly deferred because core MVP stability is at risk.
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
agentic repository investigation
+
concrete code evidence
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
1. Upload screenshot.
2. Enter issue.
3. Load demo repository.
4. Click Analyze.
5. Watch concise agent trace.
6. See root cause.
7. See exact evidence.
8. See patch.
9. See tests.
10. See PR summary.
11. Repeat the same analysis from GitHub with /patchbridge.
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
