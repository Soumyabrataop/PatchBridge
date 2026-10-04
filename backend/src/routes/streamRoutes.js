import express from 'express';
import { sessionStore } from '../store/sessionStore.js';

const router = express.Router();

/**
 * GET /api/sessions/:id/stream
 * Server-Sent Events (SSE) live trace stream
 */
router.get('/:id/stream', (req, res) => {
  const sessionId = req.params.id;
  const session = sessionStore.getSession(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Set standard SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Helper to send SSE message
  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send initial session state and all existing trace events
  sendEvent('init', {
    sessionId: session.id,
    status: session.status,
    issueText: session.issueText,
    repoName: session.repoName,
    trace: session.trace,
    report: session.report
  });

  // If already completed or failed, close stream after sending final state
  if (session.status === 'completed') {
    sendEvent('completed', { report: session.report });
    return res.end();
  } else if (session.status === 'failed') {
    sendEvent('failed', { error: session.error });
    return res.end();
  }

  // Real-time event listeners
  const onTrace = (traceStep) => {
    sendEvent('trace', traceStep);
  };

  const onComplete = ({ report }) => {
    sendEvent('completed', { report });
    res.end();
  };

  const onFail = ({ error }) => {
    sendEvent('failed', { error });
    res.end();
  };

  sessionStore.on(`trace:${sessionId}`, onTrace);
  sessionStore.once(`complete:${sessionId}`, onComplete);
  sessionStore.once(`fail:${sessionId}`, onFail);

  // Heartbeat to keep connection alive
  const heartbeatInterval = setInterval(() => {
    res.write(': ping\n\n');
  }, 15000);

  // Clean up listeners on client disconnect
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    sessionStore.off(`trace:${sessionId}`, onTrace);
    sessionStore.off(`complete:${sessionId}`, onComplete);
    sessionStore.off(`fail:${sessionId}`, onFail);
  });
});

export default router;
