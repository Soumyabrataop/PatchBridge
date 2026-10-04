import fs from 'node:fs';
import path from 'node:path';

// Standard directories to ignore to avoid bloat and non-source files
const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.cache',
  '.next',
  'venv',
  '__pycache__',
  '.agents'
]);

// Binary file extensions to skip when searching
const IGNORED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.pdf', '.zip', '.tar', '.gz', '.woff', '.woff2',
  '.ttf', '.eot', '.mp4', '.webm', '.lock', '.exe'
]);

/**
 * List files in repository recursively with automatic ignore rules.
 */
export async function listFiles(repoPath, subDir = '') {
  const targetDir = path.resolve(repoPath, subDir);
  const results = [];

  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory does not exist: ${subDir || '.'}`);
  }

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(repoPath, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        results.push({ path: relativePath, type: 'directory' });
        walk(fullPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (!IGNORED_EXTENSIONS.has(ext)) {
          results.push({ path: relativePath, type: 'file' });
        }
      }
    }
  }

  walk(targetDir);
  return results;
}

/**
 * Search repository files for a given query string or pattern.
 */
export async function searchRepo(repoPath, query, maxResults = 25) {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return [];
  }

  const cleanQuery = query.trim().toLowerCase();
  const allFiles = await listFiles(repoPath);
  const matches = [];

  for (const item of allFiles) {
    if (item.type !== 'file') continue;

    const fullPath = path.resolve(repoPath, item.path);
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.toLowerCase().includes(cleanQuery)) {
          matches.push({
            file: item.path,
            lineNumber: i + 1,
            lineContent: line.trim()
          });

          if (matches.length >= maxResults) {
            return matches;
          }
        }
      }
    } catch {
      // Ignore unreadable files
    }
  }

  return matches;
}

/**
 * Read file contents with line range support and 1-based indexing.
 */
export async function readFile(repoPath, relativeFilePath, startLine = 1, endLine = 150) {
  const fullPath = path.resolve(repoPath, relativeFilePath);

  // Security guardrail: prevent directory traversal
  const resolvedRepo = path.resolve(repoPath);
  if (!fullPath.startsWith(resolvedRepo)) {
    throw new Error('Access denied: Path outside repository root');
  }

  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${relativeFilePath}`);
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const allLines = content.split('\n');

  const actualStart = Math.max(1, startLine);
  const actualEnd = Math.min(allLines.length, endLine || allLines.length);

  const selectedLines = allLines.slice(actualStart - 1, actualEnd).map((line, idx) => ({
    lineNumber: actualStart + idx,
    content: line
  }));

  return {
    filePath: relativeFilePath.replace(/\\/g, '/'),
    totalLines: allLines.length,
    startLine: actualStart,
    endLine: actualEnd,
    lines: selectedLines,
    formatted: selectedLines.map(l => `${l.lineNumber}: ${l.content}`).join('\n')
  };
}
