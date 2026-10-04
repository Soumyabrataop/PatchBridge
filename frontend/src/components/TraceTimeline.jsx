import React from 'react';
import { 
  CheckCircle2, 
  Search, 
  FileCode, 
  FolderTree, 
  AlertCircle, 
  Loader2, 
  Wrench,
  Terminal
} from 'lucide-react';

function getStepIcon(step) {
  if (step.type === 'tool_call') {
    if (step.title.includes('list_files')) return <FolderTree className="h-4 w-4 text-sky-400" />;
    if (step.title.includes('search_repo')) return <Search className="h-4 w-4 text-amber-400" />;
    if (step.title.includes('read_file')) return <FileCode className="h-4 w-4 text-emerald-400" />;
    return <Wrench className="h-4 w-4 text-purple-400" />;
  }

  if (step.type === 'completed') return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (step.type === 'warning' || step.type === 'error') return <AlertCircle className="h-4 w-4 text-rose-400" />;
  if (step.type === 'observation') return <CheckCircle2 className="h-4 w-4 text-slate-400" />;

  return <Terminal className="h-4 w-4 text-slate-400" />;
}

export function TraceTimeline({ trace = [], isRunning = false }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
            Agent Reasoning & MCP Tool Trace
          </h3>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          {trace.length} actions recorded
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {trace.length === 0 && isRunning && (
          <div className="flex items-center gap-3 py-6 justify-center text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            <span>Connecting to Gemma 4 investigation loop...</span>
          </div>
        )}

        {trace.map((step, index) => {
          const isToolCall = step.type === 'tool_call';
          const isObservation = step.type === 'observation';
          const isCompleted = step.type === 'completed';

          return (
            <div 
              key={step.id || index}
              className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                isToolCall 
                  ? 'bg-slate-900/90 border-slate-700/80' 
                  : isObservation 
                  ? 'bg-slate-950/40 border-slate-800/50 pl-7' 
                  : isCompleted
                  ? 'bg-emerald-950/20 border-emerald-800/40'
                  : 'bg-slate-900/40 border-slate-800/60'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {getStepIcon(step)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`font-semibold ${
                    isToolCall ? 'text-sky-300' : isCompleted ? 'text-emerald-300' : 'text-slate-300'
                  }`}>
                    {step.title}
                  </span>
                  {step.timestamp && (
                    <span className="text-[10px] text-slate-500">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                
                <p className="text-slate-400 text-[11px] leading-relaxed break-words font-sans">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}

        {isRunning && (
          <div className="flex items-center gap-2.5 py-2 px-3 text-slate-400 text-xs bg-slate-900/40 rounded-lg border border-dashed border-slate-800">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            <span className="font-sans">Analyzing evidence and formulating candidate patch...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TraceTimeline;
