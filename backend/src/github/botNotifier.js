/**
 * Formats Phase 1 (Instant Ack) and Phase 2 (Completion Report) comments for GitHub issues.
 */

export function formatPhase1Comment(sessionId, webUrl) {
  const sessionUrl = `${webUrl}/session/${sessionId}`;
  return `### ⚡ PatchBridge Investigation Initialized

I've started an evidence-backed triage session for this issue using **Gemma 4**.

You can observe my live reasoning and Model Context Protocol (MCP) tool execution in real-time here:
👉 **[Watch Live Debug Session](${sessionUrl})**

*Investigating repository structure, stack traces, and root cause...*`;
}

export function formatPhase2Comment(sessionId, report, webUrl) {
  const sessionUrl = `${webUrl}/session/${sessionId}`;

  const evidenceLines = (report.evidence || [])
    .map(ev => `- \`${ev.filePath}:${ev.lineNumber}\` — ${ev.explanation || ev.snippet || 'Referenced in root cause'}`)
    .join('\n');

  const testLines = (report.testPlan || [])
    .map(t => `- [ ] ${t}`)
    .join('\n');

  const patchBlock = report.suggestedPatch
    ? `\`\`\`diff\n${report.suggestedPatch}\n\`\`\``
    : '_STATUS: NEEDS HUMAN REVIEW — Insufficient repository evidence to produce confident patch._';

  return `### 🎯 PatchBridge Analysis Complete

#### Root Cause
${report.rootCause}

#### Code Evidence
${evidenceLines || '_No exact line citations verified._'}

#### Suggested Fix
${patchBlock}

#### Recommended Test Cases
${testLines || '_Run existing test suite to verify fix._'}

---
📊 **Full Code Telemetry & Interactive Diff:**
👉 **[View Complete Report](${sessionUrl})**`;
}
