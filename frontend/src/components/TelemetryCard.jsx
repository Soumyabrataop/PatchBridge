import React from 'react';

export function TelemetryCard({ telemetry = {} }) {
  const {
    severity = 'Medium',
    blastRadius = 'Local',
    impactedComponents = [],
    codeHealthScore = '92/100'
  } = telemetry;

  return (
    <div className="bg-[#121215] border border-white/[0.08] rounded-lg p-5 font-mono text-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
        <span className="text-white/60 tracking-wider text-[11px] uppercase">
          SPECIFICATION TELEMETRY
        </span>
        <span className="text-[10px] px-1.5 py-0.5 border border-white/10 rounded text-white/50">
          HEALTH: {codeHealthScore}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <div className="p-3 bg-[#0d0d0e] border border-white/[0.04] rounded">
          <div className="text-white/40 text-[10px] mb-1 uppercase tracking-wider">
            Severity
          </div>
          <div className="text-white/90 font-medium">
            {severity}
          </div>
        </div>

        <div className="p-3 bg-[#0d0d0e] border border-white/[0.04] rounded">
          <div className="text-white/40 text-[10px] mb-1 uppercase tracking-wider">
            Blast Radius
          </div>
          <div className="text-white/90 font-medium">
            {blastRadius}
          </div>
        </div>
      </div>

      {impactedComponents.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <span className="text-[10px] text-white/40 block mb-2 uppercase tracking-wider">
            Impacted Modules:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {impactedComponents.map((comp, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-white/70 text-[10px]"
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
