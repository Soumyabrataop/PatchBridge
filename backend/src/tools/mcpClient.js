import { listFiles, searchRepo, readFile } from './localTools.js';

/**
 * Model Context Protocol (MCP) tool schema definitions for Gemma 4.
 *
 * Standalone MCP server entry point (Lesson 6 — Kiro University):
 *   backend/src/mcp-server.js
 *
 * The server exposes the same three tools below as a compliant stdio MCP
 * server using @modelcontextprotocol/server + Zod, delegating all
 * implementations to localTools.js. Both the IDE (Kiro) and this inline
 * dispatch path use identical tool names and parameter shapes.
 *
 * Run the standalone server:
 *   npm run mcp-server                          # uses demo-bug-repo
 *   npm run mcp-server -- /path/to/other/repo   # custom repo root
 */
export const MCP_TOOL_DEFINITIONS = [
  {
    name: 'list_files',
    description: 'List directories and files in the repository. Automatically filters ignored build directories.',
    parameters: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'Subdirectory to list (defaults to root if omitted).'
        }
      }
    }
  },
  {
    name: 'search_repo',
    description: 'Search repository files for keywords, identifiers, error messages, or function names.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search term or token to locate in repository files.'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'read_file',
    description: 'Read contents of a specific file in the repository with 1-indexed line numbers.',
    parameters: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'The relative path to the file to inspect.'
        },
        start_line: {
          type: 'integer',
          description: 'Optional starting line number (1-based).'
        },
        end_line: {
          type: 'integer',
          description: 'Optional ending line number (1-based).'
        }
      },
      required: ['file_path']
    }
  }
];

/**
 * Dispatches an MCP tool call to the appropriate local or remote handler.
 */
export async function executeMcpTool(toolName, args, context) {
  const { repoPath } = context;

  switch (toolName) {
    case 'list_files': {
      const files = await listFiles(repoPath, args?.directory || '');
      return {
        success: true,
        summary: `Found ${files.length} items in repository`,
        files: files.slice(0, 50)
      };
    }

    case 'search_repo': {
      const query = args?.query || '';
      const matches = await searchRepo(repoPath, query);
      return {
        success: true,
        summary: `Found ${matches.length} matches for "${query}"`,
        matches: matches
      };
    }

    case 'read_file': {
      const filePath = args?.file_path;
      if (!filePath) {
        throw new Error('Missing required parameter: file_path');
      }
      const fileData = await readFile(
        repoPath,
        filePath,
        args.start_line || 1,
        args.end_line || 100
      );
      return {
        success: true,
        summary: `Read ${filePath} (lines ${fileData.startLine}-${fileData.endLine} of ${fileData.totalLines})`,
        file: fileData
      };
    }

    default:
      throw new Error(`Unsupported MCP tool: ${toolName}`);
  }
}
