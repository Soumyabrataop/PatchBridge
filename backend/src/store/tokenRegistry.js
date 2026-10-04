import fs from 'node:fs';
import path from 'node:path';

/**
 * Registry of authenticated user OAuth tokens with local disk persistence.
 * Maps GitHub username (lowercase) -> GitHub access token.
 */
class TokenRegistry {
  constructor() {
    this.tokens = new Map();
    this.filePath = path.resolve('sessions', 'tokens.json');
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const data = JSON.parse(raw);
        for (const [k, v] of Object.entries(data)) {
          this.tokens.set(k.toLowerCase(), v);
        }
      }
    } catch (e) {
      // Ignore initial file read error
    }
  }

  save() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const obj = Object.fromEntries(this.tokens);
      fs.writeFileSync(this.filePath, JSON.stringify(obj, null, 2), 'utf8');
    } catch (e) {
      console.warn('Could not persist tokens:', e.message);
    }
  }

  setToken(username, token) {
    if (username && token) {
      this.tokens.set(username.toLowerCase(), token);
      this.save();
    }
  }

  getToken(username) {
    if (!username) return null;
    return this.tokens.get(username.toLowerCase()) || null;
  }

  getTokenForRepo(repoFullName) {
    if (!repoFullName) return process.env.GITHUB_TOKEN || null;
    const parts = repoFullName.split('/');
    if (parts.length === 2) {
      const owner = parts[0].toLowerCase();
      const userToken = this.tokens.get(owner);
      if (userToken) return userToken;
    }
    // Return any known logged-in user token if available, or fallback to GITHUB_TOKEN
    const anyToken = this.tokens.values().next().value;
    return anyToken || process.env.GITHUB_TOKEN || null;
  }

  hasAnyToken() {
    return this.tokens.size > 0 || Boolean(process.env.GITHUB_TOKEN);
  }
}

export const tokenRegistry = new TokenRegistry();
