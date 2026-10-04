import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { sessionStore } from './src/store/sessionStore.js';
import { runTriageSession } from './src/agent/runner.js';
import { formatPhase1Comment, formatPhase2Comment } from './src/github/botNotifier.js';

// Load root .env
const rootEnv = path.resolve('..', '.env');
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
}

async function testWebhookFlow() {
  console.log('🧪 Testing GitHub Webhook Two-Phase /patchbridge Flow...\n');

  const repoFullName = 'acme-corp/auth-service';
  const issueNumber = 42;
  const sessionId = `pb-gh-test-${Date.now().toString(36)}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // 1. Simulate incoming comment
  const commentBody = 'Hey @patchbridge can you take a look at this login validation crash? /patchbridge';
  console.log(`[Event] User commented on ${repoFullName}#${issueNumber}:`);
  console.log(`"${commentBody}"\n`);

  // 2. Phase 1: Immediate Acknowledgment Comment
  const phase1Comment = formatPhase1Comment(sessionId, frontendUrl);
  console.log('----------------------------------------------------');
  console.log('📨 PHASE 1 BOT COMMENT (Posted within 2 seconds):');
  console.log('----------------------------------------------------');
  console.log(phase1Comment);
  console.log('----------------------------------------------------\n');

  // 3. Agent investigation on repository
  const repoPath = path.resolve('..', 'examples', 'demo-bug-repo');
  const screenshotPath = path.join(repoPath, 'assets', 'error-screenshot.png');

  sessionStore.createSession(sessionId, {
    issueText: `Issue #${issueNumber}: Login Form validation crash with empty email\n${commentBody}`,
    repoName: repoFullName,
    repoPath
  });

  console.log('⚙️ Agent investigating repository...');
  const report = await runTriageSession(sessionId, {
    issueText: 'Empty email login crash',
    screenshotPath,
    repoPath
  });

  // 4. Phase 2: Completion Report Comment
  const phase2Comment = formatPhase2Comment(sessionId, report, frontendUrl);
  console.log('----------------------------------------------------');
  console.log('📨 PHASE 2 BOT COMMENT (Final Triage Report):');
  console.log('----------------------------------------------------');
  console.log(phase2Comment);
  console.log('----------------------------------------------------\n');

  console.log('✅ GitHub Webhook 2-Phase flow verified successfully!');
}

testWebhookFlow().catch(err => {
  console.error('❌ Webhook test failed:', err);
  process.exit(1);
});
