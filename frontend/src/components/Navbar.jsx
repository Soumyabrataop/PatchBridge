import React from 'react';

export function Navbar({ onNavigateHome }) {
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
        <div className="hidden md:flex items-center gap-2 text-white/40 text-[11px] tracking-wide">
          <span>SPEC:</span>
          <span className="text-white/80 font-medium">GEMMA-4-31B-IT</span>
          <span className="text-white/20">•</span>
          <span>PROTOCOL:</span>
          <span className="text-white/80 font-medium">MCP</span>
          <span className="text-white/20">•</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-white/60">ONLINE</span>
        </div>

        {/* Right: Actions */}
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
        </div>
      </div>
    </header>
  );
}

export default Navbar;
