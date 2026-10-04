import React from 'react';
import { ShieldAlert, Activity, GitFork, CheckCircle2 } from 'lucide-react';

export function TelemetryCard({ telemetry = {} }) {
  const {
    severity = 'Medium',
    blastRadius = 'Local',
    impactedComponents = [],
    codeHealthScore = '90/100'
  } = telemetry;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Issue Telemetry & Blast Radius
          </h3>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Health: {codeHealthScore}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            <span>Severity Rating</span>
          </div>
          <div className="font-semibold text-slate-200">
            {severity}
          </div>
        </div>

        <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/60">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <GitFork className="h-3.5 w-3.5 text-blue-400" />
            <span>Blast Radius</span>
          </div>
          <div className="font-semibold text-slate-200">
            {blastRadius}
          </div>
        </div>
      </div>

      {impactedComponents.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <span className="text-[11px] text-slate-400 block mb-2 font-medium">
            Impacted Components / Functions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {impactedComponents.map((comp, idx) => (
              <span
                key={idx}
                className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300"
              >
                {comp}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TelemetryCard;
