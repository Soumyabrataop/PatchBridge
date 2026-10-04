import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/**
 * Extracts screenshot/image URLs from GitHub Markdown text.
 * Matches standard markdown ![alt](url) and HTML <img> tags.
 */
export function extractImageUrls(markdownText) {
  if (!markdownText) return [];

  const urls = [];
  
  // Match standard markdown ![alt](url)
  const mdRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
  let match;
  while ((match = mdRegex.exec(markdownText)) !== null) {
    urls.push(match[1]);
  }

  // Match HTML <img src="url" />
  const htmlRegex = /<img[^>]+src=["'](https?:\/\/[^"'>]+)["']/g;
  while ((match = htmlRegex.exec(markdownText)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}

/**
 * Downloads an image from a URL to a local destination file.
 */
export async function downloadImage(url, destPath, githubToken = process.env.GITHUB_TOKEN) {
  const headers = {};
  if (githubToken && (url.includes('github.com') || url.includes('githubusercontent.com'))) {
    headers['Authorization'] = `token ${githubToken}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Failed to download image from ${url}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(destPath, buffer);
  return destPath;
}

/**
 * Ephemeral shallow clone of a target remote repository.
 */
export async function cloneTargetRepo(repoFullName, destDir, githubToken = process.env.GITHUB_TOKEN) {
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }

  const cloneUrl = githubToken
    ? `https://x-access-token:${githubToken}@github.com/${repoFullName}.git`
    : `https://github.com/${repoFullName}.git`;

  const cmd = `git clone --depth 1 "${cloneUrl}" "${destDir}"`;
  await execAsync(cmd);
  return destDir;
}

/**
 * Cleans up ephemeral cloned repositories.
 */
export function cleanupEphemeralRepo(destDir) {
  try {
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true });
    }
  } catch (err) {
    console.warn(`Could not clean up ephemeral directory ${destDir}:`, err.message);
  }
}

/**
 * Posts a comment on a GitHub issue via the GitHub REST API.
 */
export async function postIssueComment(repoFullName, issueNumber, commentBody, githubToken = process.env.GITHUB_TOKEN) {
  if (!githubToken) {
    console.log(`[GitHub Mock Bot] Would post comment to ${repoFullName}#${issueNumber}:\n${commentBody}\n`);
    return { mock: true, body: commentBody };
  }

  const apiUrl = `https://api.github.com/repos/${repoFullName}/issues/${issueNumber}/comments`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'PatchBridge-Agent-Bot'
    },
    body: JSON.stringify({ body: commentBody })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Creates a git branch, commits the suggested fix, pushes to GitHub, and opens a Pull Request.
 */
export async function createBranchAndPullRequest({
  repoFullName,
  issueNumber,
  patch,
  report,
  repoPath,
  githubToken = process.env.GITHUB_TOKEN
}) {
  if (!githubToken) {
    console.log('[GitHub PR] Skipped: No GitHub token available');
    return null;
  }

  const branchName = `patchbridge/fix-issue-${issueNumber}-${Date.now().toString(36).slice(-4)}`;
  const prTitle = `fix: resolve issue #${issueNumber} - ${report.observedProblem?.slice(0, 50) || 'automated patch'}`;
  const prBody = `### 🤖 PatchBridge Automated Pull Request
Resolves #${issueNumber}

#### Root Cause
${report.rootCause}

#### Verification & Test Plan
${(report.testPlan || []).map(t => `- [x] ${t}`).join('\n') || '- Verified against codebase'}

---
*Created automatically by PatchBridge multimodal agent.*`;

  try {
    // 1. Configure git user in local repo
    await execAsync('git config user.name "patchbridge-bot[bot]"', { cwd: repoPath });
    await execAsync('git config user.email "bot@patchbridge.app"', { cwd: repoPath });

    // 2. Checkout new branch
    await execAsync(`git checkout -b ${branchName}`, { cwd: repoPath });

    // 3. Apply the patch or apply direct file modifications
    const patchFile = path.join(repoPath, 'patchbridge.diff');
    fs.writeFileSync(patchFile, patch, 'utf-8');

    try {
      await execAsync(`git apply patchbridge.diff`, { cwd: repoPath });
    } catch (applyErr) {
      console.warn('[GitHub PR] git apply failed, trying 3-way:', applyErr.message);
      await execAsync(`git apply --reject --whitespace=fix patchbridge.diff || true`, { cwd: repoPath });
    } finally {
      if (fs.existsSync(patchFile)) fs.unlinkSync(patchFile);
    }

    // 4. Commit changes
    await execAsync(`git add -A && git commit -m "fix: resolve issue #${issueNumber} with PatchBridge verified fix"`, { cwd: repoPath });

    // 5. Push branch using authenticated remote
    const pushRemoteUrl = `https://x-access-token:${githubToken}@github.com/${repoFullName}.git`;
    await execAsync(`git push "${pushRemoteUrl}" ${branchName}`, { cwd: repoPath });

    // 6. Get default branch of repository
    const repoInfoRes = await fetch(`https://api.github.com/repos/${repoFullName}`, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'PatchBridge-Agent-Bot'
      }
    });
    const repoInfo = await repoInfoRes.json();
    const baseBranch = repoInfo.default_branch || 'main';

    // 7. Open Pull Request via GitHub REST API
    const prRes = await fetch(`https://api.github.com/repos/${repoFullName}/pulls`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'PatchBridge-Agent-Bot'
      },
      body: JSON.stringify({
        title: prTitle,
        body: prBody,
        head: branchName,
        base: baseBranch
      })
    });

    if (!prRes.ok) {
      const err = await prRes.text();
      throw new Error(`Failed to create PR (${prRes.status}): ${err}`);
    }

    const prData = await prRes.json();
    return {
      pullRequestUrl: prData.html_url,
      pullRequestNumber: prData.number,
      branchName
    };
  } catch (err) {
    console.warn('[GitHub PR] Error creating automated Pull Request:', err.message);
    return null;
  }
}
