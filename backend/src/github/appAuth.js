/**
 * GitHub App Installation Token Generator
 *
 * Generates short-lived installation access tokens (valid 1 hour) from the
 * GitHub App private key. These tokens allow the bot to post comments and
 * create PRs as "PatchBridge App[bot]" instead of a personal account.
 *
 * Required env vars:
 *   GITHUB_APP_ID          - numeric App ID (e.g. 5206572)
 *   GITHUB_APP_PRIVATE_KEY - full PEM contents (multiline, or path via GITHUB_APP_PRIVATE_KEY_PATH)
 *   GITHUB_APP_INSTALLATION_ID - installation ID for your repo
 *
 * Falls back to GITHUB_TOKEN if App credentials are not configured.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createAppAuth } from '@octokit/auth-app';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let _cachedToken = null;
let _tokenExpiry = 0;

/**
 * Loads the private key from env var or file path.
 */
function loadPrivateKey() {
  // Option 1: full PEM string in env var (newlines as \n)
  if (process.env.GITHUB_APP_PRIVATE_KEY) {
    return process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  // Option 2: path to .pem file
  const pemPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH
    || path.resolve(__dirname, '..', '..', '..', 'patchbridge-app.pem');

  if (fs.existsSync(pemPath)) {
    return fs.readFileSync(pemPath, 'utf-8');
  }

  return null;
}

/**
 * Returns a valid installation access token for the GitHub App.
 * Caches the token until 5 minutes before expiry.
 */
export async function getInstallationToken() {
  const appId = process.env.GITHUB_APP_ID;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
  const privateKey = loadPrivateKey();

  // Fall back to static GITHUB_TOKEN if App is not configured
  if (!appId || !installationId || !privateKey) {
    return process.env.GITHUB_TOKEN || null;
  }

  // Return cached token if still valid (with 5-min buffer)
  const now = Date.now();
  if (_cachedToken && now < _tokenExpiry - 5 * 60 * 1000) {
    return _cachedToken;
  }

  try {
    const auth = createAppAuth({
      appId: Number(appId),
      privateKey,
      installationId: Number(installationId)
    });

    const { token, expiresAt } = await auth({ type: 'installation' });

    _cachedToken = token;
    _tokenExpiry = new Date(expiresAt).getTime();

    console.log(`[GitHub App] Generated installation token (expires ${expiresAt})`);
    return token;
  } catch (err) {
    console.error('[GitHub App] Failed to generate installation token:', err.message);
    // Fall back to static token on auth error
    return process.env.GITHUB_TOKEN || null;
  }
}
