import React from 'react';

export function TraceTimeline({ trace = [], isRunning = false }) {
  return (
    <div className="bg-[#121215] border border-white/[0.08] rounded-lg p-5 font-mono text-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-white/60 tracking-wider text-[11px] uppercase">
            REASONING & MCP TOOL TRACE
          </span>
        </div>
        <span className="text-[10px] text-white/40">
          [{trace.length} ACTIONS]
        </span>
      </div>

      <div className="space-y-2.5">
        {trace.length === 0 && isRunning && (
          <div className="py-6 text-center text-white/40 text-[11px]">
            › Initializing Gemma 4 investigation loop...
          </div>
        )}

        {trace.map((step, index) => {
          const isToolCall = step.type === 'tool_call';
          const isObservation = step.type === 'observation';
          const isCompleted = step.type === 'completed';

          return (
            <div
              key={step.id || index}
              className={`p-2.5 rounded border transition-colors ${
                isToolCall
                  ? 'bg-[#18181d] border-white/10 text-white/90'
                  : isObservation
                  ? 'bg-[#0d0d0e]/60 border-white/[0.04] text-white/60 pl-5'
                  : isCompleted
                  ? 'bg-white/[0.03] border-white/20 text-white'
                  : 'bg-[#141417] border-white/[0.06] text-white/70'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold tracking-wide">
                  {isToolCall ? '› ' : isObservation ? '• ' : '✓ '}
                  {step.title}
                </span>
                {step.timestamp && (
                  <span className="text-[10px] text-white/30">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-white/50 leading-relaxed font-sans">
                {step.detail}
              </div>
            </div>
          );
        })}

        {isRunning && (
          <div className="p-2 border border-dashed border-white/10 rounded text-white/40 text-[11px] flex items-center gap-2">
            <span className="inline-block w-1 h-1 rounded-full bg-white/40 animate-ping"></span>
            <span>Synthesizing codebase evidence and formulating patch...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TraceTimeline;
