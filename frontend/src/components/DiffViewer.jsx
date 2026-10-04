import React, { useState } from 'react';

export function DiffViewer({ patch = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!patch) return;
    navigator.clipboard.writeText(patch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!patch) {
    return (
      <div className="p-6 bg-[#121215] border border-white/[0.08] rounded-lg text-center text-white/40 font-mono text-xs">
        No candidate diff generated yet.
      </div>
    );
  }

  const lines = patch.split('\n');

  return (
    <div className="bg-[#121215] border border-white/[0.08] rounded-lg overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#18181d] border-b border-white/[0.08]">
        <div className="flex items-center gap-2 text-white/70 tracking-wider text-[11px] uppercase">
          <span>DIFF // PROPOSED SPECIFICATION</span>
        </div>
        <button
          onClick={handleCopy}
          className="px-2.5 py-1 text-[11px] font-mono border border-white/10 hover:border-white/30 text-white/70 hover:text-white rounded transition-colors"
        >
          {copied ? 'COPIED ✓' : 'COPY PATCH'}
        </button>
      </div>

      <div className="overflow-x-auto p-4 leading-relaxed max-h-[380px] overflow-y-auto text-[11px]">
        {lines.map((line, idx) => {
          let lineStyle = 'text-white/60';
          let linePrefix = ' ';

          if (line.startsWith('---') || line.startsWith('+++')) {
            lineStyle = 'text-white/40 font-semibold';
          } else if (line.startsWith('@@')) {
            lineStyle = 'text-white/50 bg-white/[0.03] px-1 py-0.5 rounded';
          } else if (line.startsWith('+')) {
            lineStyle = 'text-emerald-400 bg-emerald-950/20 px-1';
          } else if (line.startsWith('-')) {
            lineStyle = 'text-rose-400/80 bg-rose-950/20 px-1';
          }

          return (
            <div key={idx} className={`whitespace-pre ${lineStyle}`}>
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DiffViewer;
