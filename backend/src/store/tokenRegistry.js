/**
 * In-memory registry of authenticated user OAuth tokens.
 * Maps GitHub username (lowercase) -> GitHub access token.
 * This eliminates the need for manual GITHUB_TOKEN creation when a user logs in via OAuth.
 */
class TokenRegistry {
  constructor() {
    this.tokens = new Map();
  }

  setToken(username, token) {
    if (username && token) {
      this.tokens.set(username.toLowerCase(), token);
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
