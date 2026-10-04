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
