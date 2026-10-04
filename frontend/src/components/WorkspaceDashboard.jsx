import React, { useState, useEffect } from 'react';

export function WorkspaceDashboard({ user, onLogout, onSelectSession }) {
  const [activeTab, setActiveTab] = useState('triage'); // 'triage' | 'repos' | 'history'
  const [repositories, setRepositories] = useState([
    { name: 'Soumyabrataop/PatchBridge', branch: 'main', botStatus: 'Active', stars: 12 },
    { name: 'acme-corp/auth-service', branch: 'main', botStatus: 'Active', stars: 4 },
    { name: 'examples/demo-bug-repo', branch: 'main', botStatus: 'Mounted Sandbox', stars: 1 }
  ]);
  const [newRepoInput, setNewRepoInput] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Manual Triage Studio State
  const [issueText, setIssueText] = useState(
    'Submitting the login form with an empty email causes an unhandled runtime error: TypeError: Cannot read properties of undefined (reading "trim").'
  );
  const [repoName, setRepoName] = useState('demo-bug-repo');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('/demo-assets/error-screenshot.png');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/sessions')
      .then((res) => res.json())
      .then((data) => {
        if (data.sessions) setSessions(data.sessions);
      })
      .catch((err) => console.error('Failed to load sessions:', err))
      .finally(() => setLoadingSessions(false));
  }, []);

  const handleAddRepo = (e) => {
    e.preventDefault();
    if (!newRepoInput.trim()) return;
    const cleanName = newRepoInput.trim();
    if (!repositories.some((r) => r.name.toLowerCase() === cleanName.toLowerCase())) {
      setRepositories([
        ...repositories,
        { name: cleanName, branch: 'main', botStatus: 'Active', stars: 0 }
      ]);
    }
    setNewRepoInput('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setScreenshotFile(null);
    setPreviewUrl(null);
  };

  const handleLoadDemo = () => {
    setIssueText(
      'Submitting the login form with an empty email causes an unhandled runtime error: TypeError: Cannot read properties of undefined (reading "trim").'
    );
    setRepoName('demo-bug-repo');
    setScreenshotFile(null);
    setPreviewUrl('/demo-assets/error-screenshot.png');
  };

  const handleSubmitTriage = async (e) => {
    e.preventDefault();
    if (!issueText.trim()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('issueText', issueText);
      formData.append('repoName', repoName);

      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }

      const res = await fetch('/api/sessions', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error(`Failed to create session: ${res.statusText}`);
      }

      const data = await res.json();
      onSelectSession(data.sessionId);
    } catch (err) {
      alert(`Error initializing triage session: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-sans">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-white/40 tracking-wider uppercase mb-1">
            <span>WORKSPACE // DEVELOPER CONSOLE</span>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl || 'https://avatars.githubusercontent.com/u/583231?v=4'}
              alt={user.username}
              className="w-9 h-9 rounded-full border border-white/20"
            />
            <div>
              <h1 className="text-lg font-semibold text-white font-mono">
                @{user.username || 'developer'}
              </h1>
              <p className="text-xs text-white/40">
                Connected via GitHub OAuth • Reasoning Model: <span className="text-white/70 font-mono">gemma-4-31b-it</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="font-mono text-[11px] px-2.5 py-1 bg-white/[0.03] border border-white/10 rounded text-emerald-400">
            BOT: READY FOR /patchbridge
          </div>
          <button
            onClick={onLogout}
            className="font-mono text-xs px-3 py-1 bg-[#121215] hover:bg-[#1a1a1e] border border-white/10 text-white/60 hover:text-white rounded transition-colors"
          >
            DISCONNECT
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-white/[0.08] pb-px font-mono text-xs">
        <button
          onClick={() => setActiveTab('triage')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'triage'
              ? 'border-white text-white font-medium bg-white/[0.03]'
              : 'border-transparent text-white/40 hover:text-white/70'
          }`}
        >
          01. DIRECT TRIAGE STUDIO
        </button>
        <button
          onClick={() => setActiveTab('repos')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'repos'
              ? 'border-white text-white font-medium bg-white/[0.03]'
              : 'border-transparent text-white/40 hover:text-white/70'
          }`}
        >
          02. MANAGED REPOSITORIES ({repositories.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-white text-white font-medium bg-white/[0.03]'
              : 'border-transparent text-white/40 hover:text-white/70'
          }`}
        >
          03. SESSION TELEMETRY ({sessions.length})
        </button>
      </div>

      {/* TAB 1: Direct Triage Studio */}
      {activeTab === 'triage' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-normal text-white tracking-tight">
              Execute Manual Bug Investigation
            </h2>
            <p className="text-xs text-white/50 max-w-xl leading-relaxed">
              Upload an error screenshot alongside a defect description. The agent parses the stack trace, correlates it against local repository source code via MCP, and yields a concrete unified diff.
            </p>
          </div>

          <form onSubmit={handleSubmitTriage} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Problem Description (7 cols) */}
              <div className="md:col-span-7 bg-[#121215] border border-white/[0.08] rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] font-mono text-xs">
                    <span className="text-white/40 uppercase tracking-wider text-[11px]">
                      01. PROBLEM REPORT / STACK TRACE
                    </span>
                    <button
                      type="button"
                      onClick={handleLoadDemo}
                      className="text-white/40 hover:text-white transition-colors text-[11px]"
                    >
                      [ LOAD DEMO SAMPLE ]
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={issueText}
                    onChange={(e) => setIssueText(e.target.value)}
                    placeholder="Paste defect description or stack trace..."
                    className="w-full bg-[#0d0d0e] border border-white/[0.06] rounded p-3 text-xs text-white/90 placeholder:text-white/20 focus:outline-none focus:border-white/30 font-mono leading-relaxed"
                    required
                  />
                </div>
                <div className="pt-3 font-mono text-[10px] text-white/30 flex items-center justify-between">
                  <span>MODE: DIRECT INTAKE</span>
                  <span>EVIDENCE-BACKED REASONING</span>
                </div>
              </div>

              {/* Target Repository (5 cols) */}
              <div className="md:col-span-5 bg-[#121215] border border-white/[0.08] rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] font-mono text-xs">
                    <span className="text-white/40 uppercase tracking-wider text-[11px]">
                      02. TARGET ENVIRONMENT
                    </span>
                    <span className="text-[10px] text-white/30">[ MOUNTED ]</span>
                  </div>
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <label className="text-[10px] text-white/40 block mb-1.5 uppercase">
                        Repository Sandbox
                      </label>
                      <select
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                        className="w-full bg-[#0d0d0e] border border-white/[0.06] rounded p-2.5 text-xs text-white/80 focus:outline-none focus:border-white/30 font-mono"
                      >
                        <option value="demo-bug-repo">examples/demo-bug-repo (Local)</option>
                        {repositories.map((r, idx) => (
                          <option key={idx} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="p-2.5 bg-[#0d0d0e] border border-white/[0.04] rounded text-[11px] text-white/50 leading-relaxed font-sans">
                      Mounted local sandbox containing reproducible <code className="font-mono text-white/70">src/validation.js</code> defect.
                    </div>
                  </div>
                </div>
                <div className="pt-3 font-mono text-[10px] text-white/30">
                  STATUS: VERIFIED
                </div>
              </div>

              {/* Multimodal Screenshot Artifact (12 cols) */}
              <div className="md:col-span-12 bg-[#121215] border border-white/[0.08] rounded-lg p-5">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06] font-mono text-xs">
                  <span className="text-white/40 uppercase tracking-wider text-[11px]">
                    03. VISUAL ERROR ARTIFACT (SCREENSHOT)
                  </span>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="text-white/40 hover:text-white transition-colors text-[11px]"
                    >
                      [ REMOVE ARTIFACT ]
                    </button>
                  )}
                </div>

                {previewUrl ? (
                  <div className="bg-[#070708] border border-white/[0.06] rounded p-4 flex flex-col items-center">
                    <img
                      src={previewUrl}
                      alt="Error Screenshot"
                      className="max-h-64 rounded object-contain border border-white/[0.04]"
                    />
                    <span className="mt-2 text-[10px] font-mono text-white/30">
                      ARTIFACT LOADED FOR GEMMA 4 MULTIMODAL INFERENCE
                    </span>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 hover:border-white/20 rounded cursor-pointer bg-[#0d0d0e]/40 transition-colors">
                    <span className="font-mono text-xs text-white/60 mb-1">
                      Upload error screenshot or drag file
                    </span>
                    <span className="font-mono text-[10px] text-white/30">
                      PNG / JPG UP TO 10MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Execution Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="font-mono text-[11px] text-white/40">
                REASONING CORE: <span className="text-white/70">GEMMA-4-31B-IT</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-white text-black hover:bg-white/90 active:scale-[0.98] font-mono font-medium text-xs rounded transition-transform disabled:opacity-40"
              >
                {isSubmitting ? 'INITIALIZING INVESTIGATION...' : 'EXECUTE TRIAGE SESSION ›'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Managed Repositories */}
      {activeTab === 'repos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-[#121215] border border-white/[0.08] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] font-mono text-xs">
              <span className="text-white/40 uppercase tracking-wider text-[11px]">
                ACTIVE REPOSITORY INTEGRATIONS
              </span>
              <span className="text-white/30 text-[10px]">[{repositories.length}]</span>
            </div>

            {/* Add Repository Form */}
            <form onSubmit={handleAddRepo} className="flex gap-2">
              <input
                type="text"
                placeholder="owner/repository (e.g. facebook/react)"
                value={newRepoInput}
                onChange={(e) => setNewRepoInput(e.target.value)}
                className="flex-1 bg-[#0d0d0e] border border-white/[0.08] rounded px-3 py-2 text-xs text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-white/30"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white text-black font-mono text-xs font-medium rounded hover:bg-white/90 transition-colors"
              >
                + ADD REPO
              </button>
            </form>

            <div className="space-y-2 font-mono text-xs pt-2">
              {repositories.map((repo, i) => (
                <div
                  key={i}
                  className="p-3 bg-[#0d0d0e] border border-white/[0.04] rounded flex items-center justify-between"
                >
                  <div>
                    <div className="text-white/90 font-medium text-[11px]">
                      {repo.name}
                    </div>
                    <div className="text-[10px] text-white/40">
                      default branch: {repo.branch}
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-emerald-400/90 bg-emerald-950/20">
                    {repo.botStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 bg-[#121215] border border-white/[0.08] rounded-lg font-mono text-xs space-y-3">
              <div className="text-white/40 uppercase tracking-wider text-[10px]">
                GITHUB WEBHOOK CONFIGURATION
              </div>
              <div className="p-2.5 bg-[#0d0d0e] border border-white/[0.04] rounded text-white/70 select-all break-all text-[11px]">
                https://patchbridge.app/api/github/webhook
              </div>
              <p className="text-[11px] text-white/40 font-sans leading-relaxed">
                Add this URL as a GitHub Webhook with Content-Type <code className="text-white/70 font-mono">application/json</code> and events <code className="text-white/70 font-mono">issue_comment</code>.
              </p>
              <div className="pt-2 border-t border-white/[0.04] text-[10px] text-white/50">
                TRIGGER SYNTAX: <code className="text-white font-mono">/patchbridge</code> on any issue.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Session History Telemetry */}
      {activeTab === 'history' && (
        <div className="bg-[#121215] border border-white/[0.08] rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06] font-mono text-xs">
            <span className="text-white/40 uppercase tracking-wider text-[11px]">
              ALL RECORDED TRIAGE SESSIONS
            </span>
            <span className="text-white/30 text-[10px]">[{sessions.length}]</span>
          </div>

          {loadingSessions && (
            <div className="py-8 text-center text-white/40 font-mono text-xs">
              Loading session telemetry...
            </div>
          )}

          {!loadingSessions && sessions.length === 0 && (
            <div className="py-8 text-center text-white/40 font-mono text-xs space-y-1">
              <div>No triage sessions recorded yet.</div>
              <div className="text-[10px] text-white/30">
                Run an intake session or comment /patchbridge on an issue.
              </div>
            </div>
          )}

          <div className="space-y-2.5 font-mono text-xs">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                onClick={() => onSelectSession(sess.id)}
                className="p-3 bg-[#0d0d0e] hover:bg-[#18181d] border border-white/[0.04] hover:border-white/10 rounded cursor-pointer transition-colors flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white/90 text-[11px]">
                      {sess.id}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      sess.status === 'completed'
                        ? 'border-emerald-500/20 text-emerald-400 bg-emerald-950/20'
                        : sess.status === 'failed'
                        ? 'border-rose-500/20 text-rose-400 bg-rose-950/20'
                        : 'border-amber-500/20 text-amber-400 bg-amber-950/20'
                    }`}>
                      {sess.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/40 truncate max-w-lg font-sans">
                    {sess.issueText}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] text-white/30">
                    {new Date(sess.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-white/50 hover:text-white mt-1">
                    OPEN TELEMETRY ›
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceDashboard;
