/**
 * Validates unified diff syntax for Agent Skill compliance.
 * Usage: node validate-patch.js "<diff-content-or-file>"
 */

import fs from 'node:fs';

export function validateUnifiedDiff(diffString) {
  if (!diffString || typeof diffString !== 'string') {
    return { valid: false, error: 'Empty diff provided' };
  }

  const lines = diffString.trim().split('\n');
  const hasOldHeader = lines.some(l => l.startsWith('--- '));
  const hasNewHeader = lines.some(l => l.startsWith('+++ '));
  const hasHunkHeader = lines.some(l => l.startsWith('@@'));
  const hasChanges = lines.some(l => l.startsWith('+') || l.startsWith('-'));

  if (!hasOldHeader || !hasNewHeader) {
    return { valid: false, error: 'Missing standard diff headers (--- a/... and +++ b/...)' };
  }

  if (!hasHunkHeader) {
    return { valid: false, error: 'Missing hunk header (@@ -start,len +start,len @@)' };
  }

  if (!hasChanges) {
    return { valid: false, error: 'Diff contains no added (+) or deleted (-) lines' };
  }

  return { valid: true, lineCount: lines.length };
}

// CLI entry point
if (process.argv[1]?.endsWith('validate-patch.js')) {
  const input = process.argv[2];
  if (!input) {
    console.log('Usage: node validate-patch.js "<patch-string-or-path>"');
    process.exit(0);
  }

  let content = input;
  if (fs.existsSync(input)) {
    content = fs.readFileSync(input, 'utf-8');
  }

  const result = validateUnifiedDiff(content);
  if (result.valid) {
    console.log('✓ Valid unified diff syntax detected.');
    process.exit(0);
  } else {
    console.error(`✗ Invalid diff: ${result.error}`);
    process.exit(1);
  }
}
