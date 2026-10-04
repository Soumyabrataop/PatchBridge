import express from 'express';
import { tokenRegistry } from '../store/tokenRegistry.js';

const router = express.Router();

/**
 * GET /api/auth/github/url
 * Returns GitHub OAuth authorization URL or mock URL if unconfigured.
 */
router.get('/github/url', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const backendPort = process.env.PORT || 3001;

  if (!clientId) {
    return res.json({
      configured: false,
      authUrl: null,
      message: 'GITHUB_CLIENT_ID is not configured in .env. Falling back to developer demo session.'
    });
  }

  const redirectUri = encodeURIComponent(`http://localhost:${backendPort}/api/auth/github/callback`);
  const scope = encodeURIComponent('read:user user:email repo');
  const state = Math.random().toString(36).substring(7);

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

  res.json({
    configured: true,
    authUrl
  });
});

/**
 * GET /api/auth/github/callback
 * Exchanges authorization code for GitHub access token, fetches profile, and redirects to frontend.
 */
router.get('/github/callback', async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code || !clientId || !clientSecret) {
    return res.redirect(`${frontendUrl}?auth_error=missing_credentials`);
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      console.error('[GitHub Auth] Token exchange error:', tokenData);
      return res.redirect(`${frontendUrl}?auth_error=${encodeURIComponent(tokenData.error_description || 'token_exchange_failed')}`);
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'PatchBridge-Auth'
      }
    });

    if (!userRes.ok) {
      throw new Error(`Failed to fetch user profile: ${userRes.statusText}`);
    }

    const userProfile = await userRes.json();

    // Auto-register OAuth token for bot comment actions
    tokenRegistry.setToken(userProfile.login, accessToken);
    console.log(`[GitHub Auth] Registered OAuth token for @${userProfile.login}`);

    // 3. Package user session data
    const userData = {
      id: userProfile.id,
      username: userProfile.login,
      name: userProfile.name || userProfile.login,
      avatarUrl: userProfile.avatar_url,
      accessToken,
      authenticatedAt: new Date().toISOString()
    };

    // Serialize and redirect to frontend with base64 user payload
    const serialized = Buffer.from(JSON.stringify(userData)).toString('base64');
    res.redirect(`${frontendUrl}?auth_success=1&user=${encodeURIComponent(serialized)}`);
  } catch (err) {
    console.error('[GitHub Auth] Callback exception:', err);
    res.redirect(`${frontendUrl}?auth_error=${encodeURIComponent(err.message)}`);
  }
});

/**
 * GET /api/auth/status
 * Check configuration status of GitHub OAuth and GitHub Bot
 */
router.get('/status', (req, res) => {
  const hasClientId = Boolean(process.env.GITHUB_CLIENT_ID);
  const hasClientSecret = Boolean(process.env.GITHUB_CLIENT_SECRET);
  const hasToken = tokenRegistry.hasAnyToken();
  const hasWebhookSecret = Boolean(process.env.GITHUB_WEBHOOK_SECRET);

  res.json({
    oauthConfigured: hasClientId && hasClientSecret,
    botConfigured: hasToken,
    webhookSecretConfigured: hasWebhookSecret,
    model: process.env.GEMMA_MODEL || 'gemma-4-31b-it'
  });
});

export default router;
