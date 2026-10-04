import React from 'react';

export function Navbar({ onNavigateHome, user, onLogin, onOpenWorkspace, activeView }) {
  return (
    <header className="border-b border-white/[0.08] bg-[#0d0d0e]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between font-mono text-xs">
        {/* Left: Project tag */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <span className="text-white/40 group-hover:text-white/60 transition-colors">
            FIG. 001 //
          </span>
          <span className="font-semibold text-white tracking-wider">
            PATCHBRIDGE
          </span>
          <span className="text-[10px] px-1.5 py-0.2 border border-white/10 text-white/50 rounded">
            v1.0
          </span>
        </div>

        {/* Center: Live spec telemetry */}
        <div className="hidden lg:flex items-center gap-2 text-white/40 text-[11px] tracking-wide">
          <span>SPEC:</span>
          <span className="text-white/80 font-medium">GEMMA-4-31B-IT</span>
          <span className="text-white/20">•</span>
          <span>PROTOCOL:</span>
          <span className="text-white/80 font-medium">MCP</span>
          <span className="text-white/20">•</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-white/60">ONLINE</span>
        </div>

        {/* Right: Actions & GitHub Auth */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Soumyabrataop/PatchBridge"
            target="_blank"
            rel="noreferrer"
            className="text-white/50 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>GITHUB</span>
            <span className="text-[10px]">↗</span>
          </a>

          {user ? (
            <button
              onClick={onOpenWorkspace}
              className={`flex items-center gap-2 px-3 py-1 rounded border transition-colors ${
                activeView === 'workspace'
                  ? 'bg-white text-black border-white'
                  : 'bg-[#121215] text-white/80 hover:text-white border-white/10'
              }`}
            >
              <img
                src={user.avatarUrl || 'https://avatars.githubusercontent.com/u/583231?v=4'}
                alt={user.username}
                className="w-4 h-4 rounded-full"
              />
              <span className="font-mono text-[11px]">@{user.username}</span>
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="px-3 py-1 bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/80 hover:text-white rounded font-mono text-[11px] transition-colors flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>CONNECT GITHUB</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
