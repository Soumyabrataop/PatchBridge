import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { sessionStore } from '../store/sessionStore.js';
import { runTriageSession } from '../agent/runner.js';

const router = express.Router();

// Configure multer storage for uploaded screenshots
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `screenshot-${Date.now()}-${uuidv4().substring(0, 8)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Resolve default demo repo path
const DEFAULT_DEMO_REPO = path.resolve('..', 'examples', 'demo-bug-repo');

/**
 * POST /api/sessions
 * Starts a new triage session
 */
router.post('/', upload.single('screenshot'), async (req, res) => {
  try {
    const sessionId = `pb-${Date.now().toString(36)}-${uuidv4().substring(0, 6)}`;
    const issueText = req.body.issueText || 'Submitting login form with an empty email causes a runtime error.';
    const repoName = req.body.repoName || 'demo-bug-repo';

    let screenshotPath = req.file ? req.file.path : null;

    // If no screenshot uploaded but default demo repo selected, check demo assets
    if (!screenshotPath) {
      const demoScreenshot = path.join(DEFAULT_DEMO_REPO, 'assets', 'error-screenshot.png');
      if (fs.existsSync(demoScreenshot)) {
        screenshotPath = demoScreenshot;
      }
    }

    const repoPath = DEFAULT_DEMO_REPO;

    const session = sessionStore.createSession(sessionId, {
      issueText,
      screenshotPath,
      repoPath,
      repoName
    });

    // Start background investigation loop
    runTriageSession(sessionId, {
      issueText,
      screenshotPath,
      repoPath
    }).catch(err => {
      console.error(`Session ${sessionId} error:`, err);
      sessionStore.failSession(sessionId, err);
    });

    res.status(201).json({
      success: true,
      sessionId: session.id,
      status: session.status,
      sessionUrl: `/session/${session.id}`,
      issueText: session.issueText,
      repoName: session.repoName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/sessions/:id
 * Retrieve session state and completed report
 */
router.get('/:id', (req, res) => {
  const session = sessionStore.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    id: session.id,
    status: session.status,
    issueText: session.issueText,
    repoName: session.repoName,
    hasScreenshot: Boolean(session.screenshotPath),
    trace: session.trace,
    report: session.report,
    error: session.error,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt
  });
});

export default router;
