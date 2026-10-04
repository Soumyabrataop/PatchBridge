import React from 'react';

export function Navbar({ onNavigateHome, user, onLogin, onOpenWorkspace, activeView }) {
  return (
    <header className="border-b border-white/[0.08] bg-[#0d0d0e]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between font-mono text-xs">
        {/* Left: Clean Brand */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <span className="font-semibold text-white tracking-widest text-sm hover:text-white/80 transition-colors">
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
              <span className="font-medium">@{user.username}</span>
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 px-3 py-1 bg-white hover:bg-white/90 text-black font-medium rounded transition-colors active:scale-[0.98]"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
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
