import express from 'express';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { sessionStore } from '../store/sessionStore.js';
import { runTriageSession } from '../agent/runner.js';
import {
  extractImageUrls,
  downloadImage,
  cloneTargetRepo,
  cleanupEphemeralRepo,
  postIssueComment
} from '../tools/githubTools.js';
import { formatPhase1Comment, formatPhase2Comment } from './botNotifier.js';

const router = express.Router();

/**
 * POST /api/github/webhook
 * Handles incoming GitHub Webhooks (issue_comment.created)
 */
router.post('/webhook', async (req, res) => {
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

  const sessionId = `pb-gh-${Date.now().toString(36)}-${uuidv4().substring(0, 6)}`;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  console.log(`[GitHub Webhook] Triggered /patchbridge on ${repoFullName}#${issueNumber} (Session: ${sessionId})`);

  // Phase 1: Post instant acknowledgment comment
  try {
    const ackBody = formatPhase1Comment(sessionId, frontendUrl);
    await postIssueComment(repoFullName, issueNumber, ackBody);
  } catch (commentErr) {
    console.error('[GitHub Webhook] Failed to post Phase 1 acknowledgment comment:', commentErr.message);
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

  // Acknowledge webhook to GitHub immediately (prevent webhook timeout)
  res.status(202).json({
    success: true,
    message: 'Triage session initiated',
    sessionId,
    sessionUrl: `${frontendUrl}/session/${sessionId}`
  });

  // Execute triage asynchronously
  (async () => {
    let screenshotPath = null;
    try {
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
          screenshotPath = await downloadImage(imageUrls[0], destPath);
        } catch (imgErr) {
          console.warn('[GitHub Webhook] Could not download image:', imgErr.message);
        }
      }

      // 2. Clone target repository
      sessionStore.appendTrace(sessionId, {
        type: 'started',
        title: 'Connecting to Repository',
        detail: `Cloning repository ${repoFullName} for investigation`
      });

      await cloneTargetRepo(repoFullName, ephemeralRepoDir);

      // 3. Run Gemma 4 multimodal investigation loop
      const report = await runTriageSession(sessionId, {
        issueText,
        screenshotPath,
        repoPath: ephemeralRepoDir
      });

      // 4. Phase 2: Post final completion comment to the GitHub issue
      const reportBody = formatPhase2Comment(sessionId, report, frontendUrl);
      await postIssueComment(repoFullName, issueNumber, reportBody);
      console.log(`[GitHub Webhook] Phase 2 report posted to ${repoFullName}#${issueNumber}`);

    } catch (err) {
      console.error(`[GitHub Webhook] Execution failed for ${sessionId}:`, err);
      sessionStore.failSession(sessionId, err);

      try {
        const errorComment = `### ⚠ PatchBridge Investigation Notice\n\nPatchBridge encountered an issue while investigating this repository: ${err.message}\n\nPlease inspect the live trace at: ${frontendUrl}/session/${sessionId}`;
        await postIssueComment(repoFullName, issueNumber, errorComment);
      } catch {
        // Ignore comment failure on error
      }
    } finally {
      // 5. Clean up ephemeral clone
      cleanupEphemeralRepo(ephemeralRepoDir);
    }
  })();
});

export default router;
