import React, { useState } from 'react';
import { Copy, Check, GitCommit } from 'lucide-react';

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
      <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
        No candidate diff generated yet.
      </div>
    );
  }

  const lines = patch.split('\n');

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <GitCommit className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Suggested Unified Diff
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-400" />
              <span>Copy Patch</span>
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto p-4 font-mono text-xs leading-relaxed max-h-[380px] overflow-y-auto">
        {lines.map((line, idx) => {
          let lineClass = 'text-slate-300';
          let bgClass = '';

          if (line.startsWith('---') || line.startsWith('+++')) {
            lineClass = 'text-slate-400 font-bold';
            bgClass = 'bg-slate-900/40';
          } else if (line.startsWith('@@')) {
            lineClass = 'text-cyan-400 font-semibold';
            bgClass = 'bg-cyan-950/20';
          } else if (line.startsWith('+')) {
            lineClass = 'text-emerald-300';
            bgClass = 'bg-emerald-950/40 border-l-2 border-emerald-500';
          } else if (line.startsWith('-')) {
            lineClass = 'text-rose-300';
            bgClass = 'bg-rose-950/40 border-l-2 border-rose-500 line-through';
          }

          return (
            <div key={idx} className={`px-2 py-0.5 whitespace-pre ${lineClass} ${bgClass}`}>
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DiffViewer;
