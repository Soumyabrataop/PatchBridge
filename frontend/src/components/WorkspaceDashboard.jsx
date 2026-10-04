import React, { useState, useEffect } from 'react';

export function WorkspaceDashboard({ user, onLogout, onSelectSession }) {
  const [repositories, setRepositories] = useState([
    { name: 'Soumyabrataop/PatchBridge', branch: 'main', botStatus: 'Active', stars: 12 },
    { name: 'acme-corp/auth-service', branch: 'main', botStatus: 'Active', stars: 4 },
    { name: 'examples/demo-bug-repo', branch: 'main', botStatus: 'Mounted Sandbox', stars: 1 }
  ]);
  const [newRepoInput, setNewRepoInput] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    // Fetch recent sessions from backend API
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8 font-sans">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-white/40 tracking-wider uppercase mb-1">
            <span>WORKSPACE // DASHBOARD</span>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl || 'https://avatars.githubusercontent.com/u/583231?v=4'}
              alt={user.username}
              className="w-8 h-8 rounded-full border border-white/20"
            />
            <div>
              <h1 className="text-lg font-semibold text-white font-mono">
                @{user.username || 'developer'}
              </h1>
              <p className="text-xs text-white/40">
                Connected via GitHub OAuth • Free Tier Active
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

      {/* Grid: Repositories & Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Managed Repositories (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#121215] border border-white/[0.08] rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06] font-mono text-xs">
              <span className="text-white/40 uppercase tracking-wider text-[11px]">
                MANAGED REPOSITORIES
              </span>
              <span className="text-white/30 text-[10px]">[{repositories.length}]</span>
            </div>

            {/* Add Repository Form */}
            <form onSubmit={handleAddRepo} className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="owner/repository"
                value={newRepoInput}
                onChange={(e) => setNewRepoInput(e.target.value)}
                className="flex-1 bg-[#0d0d0e] border border-white/[0.08] rounded px-3 py-1.5 text-xs text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-white/30"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-white text-black font-mono text-xs font-medium rounded hover:bg-white/90 transition-colors"
              >
                + ADD
              </button>
            </form>

            <div className="space-y-2 font-mono text-xs">
              {repositories.map((repo, i) => (
                <div
                  key={i}
                  className="p-3 bg-[#0d0d0e] border border-white/[0.04] rounded flex items-center justify-between"
                >
                  <div>
                    <div className="text-white/90 font-medium text-[11px] truncate max-w-[200px]">
                      {repo.name}
                    </div>
                    <div className="text-[10px] text-white/40">
                      branch: {repo.branch}
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-emerald-400/80">
                    {repo.botStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook Quick Guide */}
          <div className="p-4 bg-[#121215] border border-white/[0.08] rounded-lg font-mono text-[11px] space-y-2">
            <div className="text-white/40 uppercase tracking-wider text-[10px]">
              GITHUB WEBHOOK ENDPOINT
            </div>
            <div className="p-2 bg-[#0d0d0e] border border-white/[0.04] rounded text-white/70 select-all break-all">
              https://patchbridge.app/api/github/webhook
            </div>
            <p className="text-[10px] text-white/40 font-sans leading-relaxed">
              Tag <code className="text-white/70 font-mono">/patchbridge</code> on any issue comment in these repos to trigger real-time autonomous triage.
            </p>
          </div>
        </div>

        {/* Right: Recent Triage Sessions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#121215] border border-white/[0.08] rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06] font-mono text-xs">
              <span className="text-white/40 uppercase tracking-wider text-[11px]">
                RECENT TRIAGE SESSIONS
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
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border ${
                        sess.status === 'completed'
                          ? 'border-emerald-500/20 text-emerald-400 bg-emerald-950/20'
                          : sess.status === 'failed'
                          ? 'border-rose-500/20 text-rose-400 bg-rose-950/20'
                          : 'border-amber-500/20 text-amber-400 bg-amber-950/20'
                      }`}>
                        {sess.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/40 truncate max-w-sm font-sans">
                      {sess.issueText}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-white/30">
                      {new Date(sess.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-white/50 hover:text-white mt-1">
                      INSPECT ›
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceDashboard;
