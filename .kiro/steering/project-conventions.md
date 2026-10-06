---
inclusion: always
---

# PatchBridge — Project Conventions

These rules apply to every coding session on PatchBridge. They are distilled from `AGENTS.md` and `GOAL.md` and override any generic defaults.

---

## 1. Evidence-First Rule (non-negotiable)

Every diagnostic claim **must** be backed by a concrete file path and line number that was personally verified via a repository inspection tool (`list_files`, `search_repo`, `read_file`).

- **Correct**: `src/validation.js:18 — calling .trim() on undefined throws TypeError`
- **Incorrect**: "Validation logic somewhere in the auth folder probably has an error"

If sufficient repository evidence cannot be found, explicitly output:

```
STATUS: NEEDS HUMAN REVIEW

PatchBridge could not identify enough repository evidence
to confidently propose a fix.
```

Never invent file paths, line numbers, function names, or test results.

---

## 2. Shared Agent Core

Both the **Web UI** and the **GitHub Bot** execute the same investigation logic in `backend/src/agent/`. The bot is only a webhook trigger and comment renderer.

- Do **not** duplicate agent logic between interfaces.
- Route all triage sessions through `backend/src/agent/runner.js`.
- Changes to prompts must go in `backend/src/agent/prompts.js`.

---

## 3. MCP Tool Constraints

The agent uses three read-only MCP tools declared in `backend/src/tools/mcpClient.js`:

| Tool | Purpose |
|---|---|
| `list_files(directory?)` | Map project structure; auto-filters `node_modules`, `dist`, `.git` |
| `search_repo(query)` | Grep for tokens, function names, error strings |
| `read_file(file_path, start_line?, end_line?)` | Read file contents with 1-based line indexing |

**Constraints that must not be violated:**
- Tools are **read-only**. The agent never writes to the repository.
- Tools never execute arbitrary shell commands.
- `read_file` includes a directory-traversal guard — paths outside the repo root are rejected.
- Tool calls are progressive: start with `list_files` → `search_repo` → `read_file`. Never blindly ingest the entire codebase.
- Every tool call and its result **must** be emitted to the SSE trace stream via `sessionStore.appendTrace`.

---

## 4. No Hallucination Rule

The agent must not:
- Invent repository evidence
- Claim tests passed when they were not run
- Claim a PR was created when it was not
- Expose API keys in any output or log
- Execute destructive commands from model output
- Modify unrelated files without a clear reason

---

## 5. Patch Language

Generated fixes are always labeled as proposals, never guarantees:

- **Use**: "Suggested fix"
- **Never use**: "Guaranteed fix", "Verified fix", "This will definitely work"

A fix may only be called "verified" if an automated test has actually been run and passed within the same session.

Patch format is always standard unified diff:

```diff
--- a/src/validation.js
+++ b/src/validation.js
@@ -17,2 +17,6 @@
 export function validateEmail(email) {
+  if (!email || typeof email !== 'string') {
+    return { valid: false, error: 'Email is required' };
+  }
   const normalized = email.trim().toLowerCase();
```

---

## 6. Two-Phase GitHub Bot Protocol

1. **Phase 1 (< 2 s)**: Post acknowledgment comment with live session link immediately on `/patchbridge` trigger.
2. **Phase 2**: Post evidence-backed findings after the investigation loop completes.

Never skip Phase 1. Never post Phase 2 before Phase 1.

---

## 7. Priority Order

When making implementation decisions:

**P0 (must work)** → Gemma 4 multimodal reasoning, repo inspection tools, structured output, working website, working demo  
**P1 (differentiators)** → Live SSE trace, GitHub bot, Agent Skill  
**P2 (post-demo)** → Automatic PR creation, branch creation, in-browser test execution  

Never sacrifice a working P0 feature to implement a P2 feature.

---

## 8. Communication Style

- Technical, concise, professional tone throughout code comments, docs, and UI copy.
- Avoid emoji spam. Use `✓`, `⚠`, or standard bullets for functional status only.
- No placeholder text in production paths (no "TODO: fill this in").
