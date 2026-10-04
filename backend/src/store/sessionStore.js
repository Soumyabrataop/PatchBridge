import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';

class SessionStore extends EventEmitter {
  constructor() {
    super();
    this.sessions = new Map();
    this.storageDir = path.resolve('sessions');

    if (!fs.existsSync(this.storageDir)) {
      try {
        fs.mkdirSync(this.storageDir, { recursive: true });
      } catch {
        // Fallback to in-memory only if disk creation fails
      }
    }
  }

  createSession(id, data = {}) {
    const session = {
      id,
      status: 'pending', // pending | analyzing | completed | failed
      issueText: data.issueText || '',
      screenshotPath: data.screenshotPath || null,
      repoPath: data.repoPath || '',
      repoName: data.repoName || 'demo-bug-repo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trace: [],
      report: null,
      error: null
    };

    this.sessions.set(id, session);
    this.persist(session);
    return session;
  }

  getSession(id) {
    if (this.sessions.has(id)) {
      return this.sessions.get(id);
    }

    // Try reading from disk
    const diskPath = path.join(this.storageDir, `${id}.json`);
    if (fs.existsSync(diskPath)) {
      try {
        const session = JSON.parse(fs.readFileSync(diskPath, 'utf-8'));
        this.sessions.set(id, session);
        return session;
      } catch {
        return null;
      }
    }

    return null;
  }

  appendTrace(id, step) {
    const session = this.getSession(id);
    if (!session) return;

    const traceItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...step
    };

    session.trace.push(traceItem);
    session.updatedAt = new Date().toISOString();
    this.persist(session);

    // Emit event for real-time SSE subscribers
    this.emit(`trace:${id}`, traceItem);
  }

  setStatus(id, status) {
    const session = this.getSession(id);
    if (!session) return;

    session.status = status;
    session.updatedAt = new Date().toISOString();
    this.persist(session);
    this.emit(`status:${id}`, { status });
  }

  completeSession(id, report) {
    const session = this.getSession(id);
    if (!session) return;

    session.status = 'completed';
    session.report = report;
    session.updatedAt = new Date().toISOString();
    this.persist(session);

    this.emit(`complete:${id}`, { report });
  }

  failSession(id, error) {
    const session = this.getSession(id);
    if (!session) return;

    session.status = 'failed';
    session.error = typeof error === 'string' ? error : error.message;
    session.updatedAt = new Date().toISOString();
    this.persist(session);

    this.emit(`fail:${id}`, { error: session.error });
  }

  persist(session) {
    try {
      const diskPath = path.join(this.storageDir, `${session.id}.json`);
      fs.writeFileSync(diskPath, JSON.stringify(session, null, 2), 'utf-8');
    } catch {
      // Ignore disk persistence errors
    }
  }
}

export const sessionStore = new SessionStore();
