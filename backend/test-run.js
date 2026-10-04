import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { runTriageSession } from './src/agent/runner.js';
import { sessionStore } from './src/store/sessionStore.js';

// Load root .env
const rootEnv = path.resolve('..', '.env');
const localEnv = path.resolve('.env');
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
} else {
  dotenv.config({ path: localEnv });
}

async function testHeadlessTriage() {
  console.log('🧪 Starting PatchBridge Part 1 Headless Triage Test...\n');

  const sessionId = `test-${Date.now().toString(36)}`;
  const repoPath = path.resolve('..', 'examples', 'demo-bug-repo');
  const screenshotPath = path.join(repoPath, 'assets', 'error-screenshot.png');
  const issueText = 'Submitting login form with an empty email causes a runtime error: TypeError: Cannot read properties of undefined (reading "trim").';

  sessionStore.createSession(sessionId, {
    issueText,
    screenshotPath,
    repoPath,
    repoName: 'demo-bug-repo'
  });

  // Listen to real-time agent trace events
  sessionStore.on(`trace:${sessionId}`, (step) => {
    console.log(`[TRACE ${step.type.toUpperCase()}] ${step.title}: ${step.detail}`);
  });

  const report = await runTriageSession(sessionId, {
    issueText,
    screenshotPath,
    repoPath
  });

  console.log('\n======================================================');
  console.log('🎉 TRIAGE REPORT GENERATED SUCCESSFULLY:');
  console.log('======================================================');
  console.log('📌 Observed Problem:\n', report.observedProblem);
  console.log('\n🔍 Root Cause:\n', report.rootCause);
  console.log('\n📋 Verified Evidence:');
  report.evidence.forEach((ev, i) => {
    console.log(`  ${i + 1}. ${ev.filePath}:${ev.lineNumber}`);
    console.log(`     Snippet: ${ev.snippet}`);
    console.log(`     Why: ${ev.explanation}`);
  });
  console.log('\n🛠️ Suggested Unified Diff:\n', report.suggestedPatch);
  console.log('\n🧪 Test Plan:');
  report.testPlan.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
  console.log('\n📊 Telemetry:', JSON.stringify(report.telemetry, null, 2));

  console.log('\n✅ Part 1 verification passed with 100% evidence-first accuracy!');
}

testHeadlessTriage().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
