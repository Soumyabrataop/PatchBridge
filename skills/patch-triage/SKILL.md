---
name: patch-triage
description: >-
  Multimodal open-source bug triage and fix workflow. Transforms bug reports and
  error screenshots into concrete repository evidence, unified diffs, and contribution-ready
  PR descriptions using Model Context Protocol (MCP) tools.
---

# Patch Triage Workflow (Agent Skill)

This skill provides an evidence-first procedure for autonomous agents to triage software defects, locate exact source lines, and generate contribution-ready fixes from multimodal issue inputs (issue descriptions and screenshots).

---

## Workflow Steps

### Step 1: Multimodal Clue Extraction
1. Examine the provided error screenshot (UI error toasts, console logs, or terminal stack traces).
2. Extract critical tokens:
   - Exception type (e.g., `TypeError`, `NullPointerException`, `IndexError`)
   - Exact error message (e.g., `Cannot read properties of undefined (reading 'trim')`)
   - Stack trace file names and line numbers (e.g., `validation.js:18`, `LoginForm.jsx:36`)
   - Target function names and components

### Step 2: Progressive Repository Investigation
Use Model Context Protocol (MCP) tools in sequence:
1. **Directory Discovery (`list_files`)**:
   Map repository structure while filtering ignored directories (`node_modules`, `dist`, `.git`).
2. **Targeted Search (`search_repo`)**:
   Search for error tokens and function definitions extracted in Step 1.
3. **Contextual Inspection (`read_file`)**:
   Read candidate files with 10–25 lines of surrounding context to understand local control flow and state management.

### Step 3: Evidence-First Verification
1. Compare observed stack traces with actual source code lines.
2. Confirm the failure condition:
   - Identify unhandled edge cases (null values, missing properties, type mismatches).
3. If code evidence is insufficient or ambiguous, explicitly halt and report:
   `STATUS: NEEDS HUMAN REVIEW`.
4. Never guess or hallucinate line numbers.

### Step 4: Minimal Surgical Patch Formulation
1. Formulate the smallest effective patch fixing the root cause.
2. Comply with existing coding standards and project formatting.
3. Avoid modifying unrelated files or formatting styles.
4. Output standard unified diff format (`--- a/... +++ b/...`).

### Step 5: Verification & Contribution Synthesis
1. Define test cases that directly reproduce and guard against the defect.
2. Generate a contribution-ready pull request summary outlining:
   - Root Cause
   - Concrete Evidence Lines
   - Changes Made
   - Verification Steps

---

## References & Helper Scripts
- [Triage Heuristics Guide](./references/triage-heuristics.md)
- [Diff Conventions](./references/diff-conventions.md)
- [Patch Validation Script](./scripts/validate-patch.js)
