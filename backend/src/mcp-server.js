/**
 * PatchBridge Standalone MCP Server
 *
 * Exposes the three repository inspection tools as a compliant
 * Model Context Protocol server over stdio. Implementations delegate
 * directly to the existing localTools.js functions — no logic duplication.
 *
 * Clients (Kiro IDE, the backend agent, or the MCP Inspector):
 *   node backend/src/mcp-server.js -- /path/to/repo
 *
 * The first argument after -- is the repository root to expose.
 * Defaults to examples/demo-bug-repo relative to the project root.
 *
 * Tool vocabulary mirrors backend/src/tools/mcpClient.js exactly:
 *   list_files   → localTools.listFiles(repoPath, directory?)
 *   search_repo  → localTools.searchRepo(repoPath, query)
 *   read_file    → localTools.readFile(repoPath, file_path, start?, end?)
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod';
import { listFiles, searchRepo, readFile } from './tools/localTools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve repository root from CLI argument or fall back to the demo repo
const repoPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '..', '..', 'examples', 'demo-bug-repo');

console.error(`[PatchBridge MCP] Server starting — repo root: ${repoPath}`);

serveStdio(() => {
  const server = new McpServer({
    name: 'patchbridge-repo-tools',
    version: '1.0.0'
  });

  // ------------------------------------------------------------------
  // Tool: list_files
  // Maps to: executeMcpTool('list_files', args, context) in mcpClient.js
  // ------------------------------------------------------------------
  server.registerTool(
    'list_files',
    {
      title: 'List Repository Files',
      description:
        'List directories and files in the repository. ' +
        'Automatically filters ignored build directories ' +
        '(.git, node_modules, dist, build, coverage, .cache).',
      inputSchema: z.object({
        directory: z
          .string()
          .optional()
          .describe('Subdirectory to list, relative to the repo root. Defaults to root.')
      }),
      annotations: { readOnlyHint: true, destructiveHint: false }
    },
    async ({ directory }) => {
      const files = await listFiles(repoPath, directory || '');
      const summary = `Found ${files.length} items in ${directory || '.'} (showing up to 50)`;
      const listing = files
        .slice(0, 50)
        .map(f => `${f.type === 'directory' ? '[DIR] ' : '[FILE]'} ${f.path}`)
        .join('\n');
      return {
        content: [{ type: 'text', text: `${summary}\n\n${listing}` }]
      };
    }
  );

  // ------------------------------------------------------------------
  // Tool: search_repo
  // Maps to: executeMcpTool('search_repo', args, context) in mcpClient.js
  // ------------------------------------------------------------------
  server.registerTool(
    'search_repo',
    {
      title: 'Search Repository',
      description:
        'Search all source files in the repository for a keyword, ' +
        'identifier, error message, or function name. ' +
        'Returns matching lines with file path and 1-based line number.',
      inputSchema: z.object({
        query: z
          .string()
          .min(1)
          .describe('The search term or token to locate in repository files.')
      }),
      annotations: { readOnlyHint: true, destructiveHint: false }
    },
    async ({ query }) => {
      const matches = await searchRepo(repoPath, query);
      if (matches.length === 0) {
        return {
          content: [{ type: 'text', text: `No matches found for "${query}".` }]
        };
      }
      const lines = matches
        .map(m => `${m.file}:${m.lineNumber}  ${m.lineContent}`)
        .join('\n');
      return {
        content: [
          {
            type: 'text',
            text: `Found ${matches.length} match${matches.length === 1 ? '' : 'es'} for "${query}":\n\n${lines}`
          }
        ]
      };
    }
  );

  // ------------------------------------------------------------------
  // Tool: read_file
  // Maps to: executeMcpTool('read_file', args, context) in mcpClient.js
  // ------------------------------------------------------------------
  server.registerTool(
    'read_file',
    {
      title: 'Read Repository File',
      description:
        'Read the contents of a specific file in the repository. ' +
        'Returns numbered lines (1-based). ' +
        'Use start_line and end_line to read a targeted range ' +
        '(default: lines 1–100).',
      inputSchema: z.object({
        file_path: z
          .string()
          .min(1)
          .describe('Relative path to the file from the repository root.'),
        start_line: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe('Starting line number, 1-based. Defaults to 1.'),
        end_line: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe('Ending line number, 1-based. Defaults to 100.')
      }),
      annotations: { readOnlyHint: true, destructiveHint: false }
    },
    async ({ file_path, start_line, end_line }) => {
      const fileData = await readFile(
        repoPath,
        file_path,
        start_line || 1,
        end_line || 100
      );
      const header =
        `File: ${fileData.filePath} ` +
        `(lines ${fileData.startLine}–${fileData.endLine} of ${fileData.totalLines})`;
      return {
        content: [{ type: 'text', text: `${header}\n\n${fileData.formatted}` }]
      };
    }
  );

  return server;
});
