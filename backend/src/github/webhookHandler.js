import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { sessionStore } from '../store/sessionStore.js';
import { runTriageSession } from '../agent/runner.js';
import { tokenRegistry } from '../store/tokenRegistry.js';
import {
  extractImageUrls,
  downloadImage,
  cloneTargetRepo,
  cleanupEphemeralRepo,
  postIssueComment
} from '../tools/githubTools.js';
import { formatPhase1Comment, formatPhase2Comment } from './botNotifier.js';

const router = express.Router();

const upload = multer({
  dest: path.resolve('uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }
});

function verifyGitHubSignature(req) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return true; // Optional: allow testing if secret is not configured

  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

/**
 * Shared executor for bot trigger logic (both webhook and simulation)
 */
async function triggerTriageWorkflow({
  repoFullName,
  issueNumber,
  issueTitle = '',
  issueBody = '',
  commentBody = '/patchbridge',
  providedScreenshotPath = null,
  res,
  isSimulation = false
}) {
  const sessionId = `pb-gh-${Date.now().toString(36)}-${uuidv4().substring(0, 6)}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const githubToken = tokenRegistry.getTokenForRepo(repoFullName) || process.env.GITHUB_TOKEN;

  console.log(`[GitHub Webhook] Triggered /patchbridge on ${repoFullName}#${issueNumber} (Session: ${sessionId}, HasToken: ${Boolean(githubToken)}, Simulation: ${isSimulation})`);

  // Phase 1: Post instant acknowledgment comment to GitHub
  if (!isSimulation) {
    try {
      const ackBody = formatPhase1Comment(sessionId, frontendUrl);
      await postIssueComment(repoFullName, issueNumber, ackBody, githubToken);
    } catch (commentErr) {
      console.warn('[GitHub Webhook] Phase 1 acknowledgment notice:', commentErr.message);
    }
  }

  // Combine issue title, body, and comment
  const issueText = `Issue #${issueNumber}: ${issueTitle}\n\n${issueBody}\n\nCommand Context: ${commentBody}`;

  const ephemeralRepoDir = path.resolve('tmp', 'repos', sessionId);
  const screenshotDir = path.resolve('tmp', 'screenshots', sessionId);

  // Initialize session in store
  sessionStore.createSession(sessionId, {
    issueText,
    repoName: repoFullName,
    repoPath: ephemeralRepoDir
  });

  // Acknowledge webhook immediately (prevent timeout)
  res.status(202).json({
    success: true,
    message: isSimulation ? 'Simulation triage initiated' : 'Triage session initiated',
    sessionId,
    sessionUrl: `${frontendUrl}/session/${sessionId}`
  });

  // Execute triage asynchronously
  (async () => {
    let screenshotPath = providedScreenshotPath;
    let repoPath = ephemeralRepoDir;

    try {
      if (!screenshotPath) {
        // 1. Check for attached screenshots in issue body and comment
        const imageUrls = [
          ...extractImageUrls(issueBody),
          ...extractImageUrls(commentBody)
        ];

        if (imageUrls.length > 0) {
          sessionStore.appendTrace(sessionId, {
            type: 'started',
            title: 'Fetching Issue Screenshot',
            detail: `Downloading screenshot from ${imageUrls[0]}`
          });

          const destPath = path.join(screenshotDir, 'issue-screenshot.png');
          try {
            screenshotPath = await downloadImage(imageUrls[0], destPath, githubToken);
          } catch (imgErr) {
            console.warn('[GitHub Webhook] Could not download image:', imgErr.message);
          }
        }
      }

      // If still no screenshot and target is demo repo, load demo error screenshot
      if (!screenshotPath && repoFullName.includes('demo-bug-repo')) {
        const demoScreenshot = path.resolve('..', 'examples', 'demo-bug-repo', 'assets', 'error-screenshot.png');
        if (fs.existsSync(demoScreenshot)) {
          screenshotPath = demoScreenshot;
        }
      }

      // 2. Clone target repository, or fallback to demo-bug-repo if local demo
      if (repoFullName.includes('demo-bug-repo')) {
        repoPath = path.resolve('..', 'examples', 'demo-bug-repo');
      } else {
        sessionStore.appendTrace(sessionId, {
          type: 'started',
          title: 'Connecting to Repository',
          detail: `Cloning repository ${repoFullName} for investigation`
        });

        await cloneTargetRepo(repoFullName, ephemeralRepoDir, githubToken);
      }

      // 3. Run Gemma 4 multimodal investigation loop
      const report = await runTriageSession(sessionId, {
        issueText,
        screenshotPath,
        repoPath
      });

      // 4. Phase 2: Post final completion comment to the GitHub issue
      if (!isSimulation) {
        try {
          const reportBody = formatPhase2Comment(sessionId, report, frontendUrl);
          await postIssueComment(repoFullName, issueNumber, reportBody, githubToken);
          console.log(`[GitHub Webhook] Phase 2 report posted to ${repoFullName}#${issueNumber}`);
        } catch (commentErr) {
          console.warn('[GitHub Webhook] Could not post final Phase 2 comment:', commentErr.message);
        }
      }

    } catch (err) {
      console.error(`[GitHub Webhook] Execution failed for ${sessionId}:`, err);
      sessionStore.failSession(sessionId, err);

      if (!isSimulation) {
        try {
          const errorComment = `### ⚠ PatchBridge Investigation Notice\n\nPatchBridge encountered an issue while investigating this repository: ${err.message}\n\nPlease inspect the live trace at: ${frontendUrl}/session/${sessionId}`;
          await postIssueComment(repoFullName, issueNumber, errorComment, githubToken);
        } catch {
          // Ignore comment failure
        }
      }
    } finally {
      // 5. Clean up ephemeral clone
      if (!repoFullName.includes('demo-bug-repo')) {
        cleanupEphemeralRepo(ephemeralRepoDir);
      }
    }
  })();
}

/**
 * POST /api/github/webhook
 * Handles incoming GitHub Webhooks (issue_comment.created)
 */
router.post('/webhook', async (req, res) => {
  if (!verifyGitHubSignature(req)) {
    return res.status(401).json({ error: 'Invalid HMAC signature in x-hub-signature-256' });
  }

  const event = req.headers['x-github-event'];
  const payload = req.body;

  // We are interested in issue comments
  if (event !== 'issue_comment' && !payload.comment) {
    return res.status(200).json({ ignored: true, reason: 'Not an issue_comment event' });
  }

  const commentBody = payload.comment?.body || '';
  
  // Check if comment triggers /patchbridge
  if (!commentBody.toLowerCase().includes('/patchbridge')) {
    return res.status(200).json({ ignored: true, reason: 'Comment does not contain /patchbridge' });
  }

  const repoFullName = payload.repository?.full_name;
  const issueNumber = payload.issue?.number;
  const issueTitle = payload.issue?.title || '';
  const issueBody = payload.issue?.body || '';

  if (!repoFullName || !issueNumber) {
    return res.status(400).json({ error: 'Missing repository or issue number in payload' });
  }

  await triggerTriageWorkflow({
    repoFullName,
    issueNumber,
    issueTitle,
    issueBody,
    commentBody,
    res,
    isSimulation: false
  });
});

/**
 * POST /api/github/simulate
 * Simulates a GitHub issue comment /patchbridge trigger from Dashboard or tests
 * Supports multipart file upload for screenshot alongside defect details
 */
router.post('/simulate', upload.single('screenshot'), async (req, res) => {
  const {
    repoFullName = 'examples/demo-bug-repo',
    issueNumber = 42,
    issueTitle = 'TypeError on submit when email is empty',
    issueBody = 'Submitting LoginForm without entering an email triggers unhandled TypeError in validation.js',
    commentBody = '/patchbridge please investigate and propose a fix'
  } = req.body || {};

  const providedScreenshotPath = req.file ? req.file.path : null;

  await triggerTriageWorkflow({
    repoFullName,
    issueNumber: Number(issueNumber) || 42,
    issueTitle,
    issueBody,
    commentBody,
    providedScreenshotPath,
    res,
    isSimulation: true
  });
});

export default router;
