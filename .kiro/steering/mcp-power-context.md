---
inclusion: manual
---

# PatchBridge — MCP Power Context

This steering file is loaded manually when you need to perform interactive repository investigations in Kiro using the same MCP tool vocabulary that PatchBridge's backend agent uses at runtime.

Activate with: `@mcp-power-context` in your Kiro chat prompt.

---

## Available MCP Servers

Two MCP servers are configured in `.kiro/settings/mcp.json`. They mirror the tool contracts defined in `backend/src/tools/mcpClient.js` and `backend/src/tools/localTools.js`.

---

### 1. `patchbridge-filesystem` — Local Repository Tools

**Package**: `@modelcontextprotocol/server-filesystem`  
**Scope**: Read-only access to three directories:

| Allowed Root | Contents |
|---|---|
| `examples/demo-bug-repo/` | The intentionally buggy LoginForm + validation demo repo |
| `backend/src/` | Agent runner, MCP client, tool implementations, routes |
| `skills/` | patch-triage Agent Skill, references, validation scripts |

**Available tools and their backend equivalents:**

| IDE MCP Tool | PatchBridge Backend Equivalent | Purpose |
|---|---|---|
| `list_directory(path)` | `list_files(repoPath, subDir)` in `localTools.js` | Map directory structure |
| `directory_tree(path)` | `list_files` (recursive) | Full recursive file tree |
| `read_file(path)` | `read_file(repoPath, filePath, start, end)` in `localTools.js` | Read source file contents |
| `read_multiple_files(paths[])` | Multiple `read_file` calls | Batch file inspection |
| `search_files(path, pattern)` | `search_repo(repoPath, query)` in `localTools.js` | Grep for tokens and identifiers |
| `get_file_info(path)` | — | File metadata (size, modified) |

**Security constraints** (same as the backend agent):
- Read-only. `create_file`, `write_file`, `move_file`, `delete_file` are not in `alwaysAllow` and will prompt for confirmation.
- Paths are scoped to the three allowed roots — no access outside them.

**Example use in Kiro chat:**
```
Use the patchbridge-filesystem MCP server to:
1. List all files in examples/demo-bug-repo/src
2. Read validation.js and find the validateEmail function
3. Search for all usages of validateEmail across the demo repo
```

---

### 2. `patchbridge-github` — GitHub REST API Tools

**Package**: `@modelcontextprotocol/server-github`  
**Auth**: Reads `GITHUB_TOKEN` from your environment (same token used by `backend/src/tools/githubTools.js` at runtime)  
**Scope**: Public and private repositories your token has access to

**Available tools and their backend equivalents:**

| IDE MCP Tool | PatchBridge Backend Equivalent | Purpose |
|---|---|---|
| `get_file_contents(owner, repo, path)` | `github_read_file` (referenced in `GOAL.md §7`) | Read file from remote repo |
| `search_code(query)` | `github_search_code` | Search code across GitHub |
| `search_repositories(query)` | — | Find repositories |
| `list_issues(owner, repo)` | Used in `webhookHandler.js` context | List repo issues |
| `get_issue(owner, repo, issue_number)` | GitHub webhook payload | Read issue details |
| `search_issues(query)` | — | Search issues and PRs |
| `list_commits(owner, repo)` | — | Browse commit history |
| `get_commit(owner, repo, sha)` | — | Inspect specific commit |

**Note**: `create_issue_comment` and `create_pull_request` are not in `alwaysAllow` — they will prompt for confirmation before posting to GitHub. This mirrors the deliberate safety design in `GOAL.md §8`: the agent runs read-only tools by default.

**Prerequisite**: Set `GITHUB_TOKEN` in your environment before starting Kiro:
```powershell
$env:GITHUB_TOKEN = "ghp_your_token_here"
```
Or add it to your `.env` file (already in `.gitignore`). The server inherits it via the `${GITHUB_TOKEN}` env substitution in `mcp.json`.

**Example use in Kiro chat:**
```
Use the patchbridge-github MCP server to:
1. Get the contents of src/validation.js from Soumyabrataop/PatchBridge on main
2. Search for open issues mentioning "validateEmail" in that repo
3. Read issue #42 and extract the error screenshot URL
```

---

## Relationship to the PatchBridge Agent Loop

When PatchBridge runs a triage session (`backend/src/agent/runner.js`), it dispatches tools through `backend/src/tools/mcpClient.js` which calls `localTools.js` directly (embedded MCP — no separate process). The tool names and schemas are identical to what Kiro sees via these MCP servers:

```
PatchBridge agent runtime:          Kiro IDE (this Power):
─────────────────────────────       ──────────────────────────────
executeMcpTool('list_files')   ←→   list_directory / directory_tree
executeMcpTool('search_repo')  ←→   search_files
executeMcpTool('read_file')    ←→   read_file / read_multiple_files
postIssueComment(...)          ←→   create_issue_comment (confirmed)
```

This means you can replicate exactly what the agent does interactively in Kiro chat — useful for:
- Debugging why the agent picked a particular file
- Verifying evidence lines before the agent runs
- Investigating a new bug report against the demo repo manually
- Exploring the backend source while extending `mcpClient.js`

---

## When to Use This File

Load `@mcp-power-context` when:
- Investigating `examples/demo-bug-repo` source files interactively
- Debugging or extending `backend/src/tools/mcpClient.js` or `localTools.js`
- Reproducing a GitHub issue investigation manually before running the full agent
- Comparing IDE tool output against what the deterministic triage path produces

Do **not** load this file for general coding tasks — use the always-on steering files (`project-conventions.md`, `stack-reference.md`) for that.
