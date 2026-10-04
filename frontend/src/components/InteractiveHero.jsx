import React, { useState, useEffect } from 'react';

export function InteractiveHero({ onExploreClick }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      phase: '01. MULTIMODAL INGESTION',
      code: 'TypeError: Cannot read properties of undefined (reading "trim")',
      target: 'assets/error-screenshot.png',
      status: 'PARSED STACK TRACE'
    },
    {
      phase: '02. MCP REPO DISCOVERY',
      code: 'search_repo("validateEmail") → 10 occurrences in src/validation.js',
      target: 'src/validation.js:18',
      status: 'MATCH VERIFIED'
    },
    {
      phase: '03. CONCRETE CITATION',
      code: 'Line 18: const normalized = email.trim().toLowerCase();',
      target: 'UNGUARDED ACCESS',
      status: 'ROOT CAUSE CONFIRMED'
    },
    {
      phase: '04. SURGICAL SPECIFICATION',
      code: '+ if (!email || typeof email !== "string") return { valid: false };',
      target: 'UNIFIED DIFF PROPOSED',
      status: '100% EVIDENCE-BACKED'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="relative pt-12 pb-16 border-b border-white/[0.08]">
      {/* Background Architectural Grid Accent */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 font-mono text-[11px] text-white/40 tracking-wider uppercase mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>FIG. 000 // AUTONOMOUS MULTIMODAL DEBUGGING AGENT</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Editorial Hero Pitch */}
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-4xl sm:text-5xl font-normal text-white tracking-tight leading-[1.1] font-sans">
              From visual error to verified unified diff.
            </h1>
            <p className="text-sm sm:text-base text-white/50 leading-relaxed max-w-xl font-sans">
              PatchBridge correlates issue screenshots with actual repository code using Google's <span className="text-white/80 font-mono">Gemma 4</span> and the <span className="text-white/80 font-mono">Model Context Protocol</span>. Zero hallucinated line numbers.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 font-mono text-xs">
              <button
                onClick={onExploreClick}
                className="px-5 py-2.5 bg-white text-black hover:bg-white/90 active:scale-[0.98] font-medium rounded transition-transform"
              >
                START INVESTIGATION ›
              </button>
              <div className="px-3 py-2 border border-white/10 rounded text-white/50 text-[11px]">
                RESPONSE TIME: &lt; 20S
              </div>
            </div>
          </div>

          {/* Right: Animated Inspector / Radar Widget */}
          <div className="lg:col-span-5">
            <div className="bg-[#121215] border border-white/[0.08] rounded-lg p-4 font-mono text-xs shadow-2xl relative overflow-hidden">
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] text-[10px] text-white/40">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white/20"></span>
                  <span className="w-2 h-2 rounded-full bg-white/20"></span>
                  <span className="w-2 h-2 rounded-full bg-white/20"></span>
                  <span className="ml-2 tracking-wider">GEMMA-4 // RADAR</span>
                </div>
                <span className="text-emerald-400/80 animate-pulse">LIVE REASONING</span>
              </div>

              {/* Step Flow */}
              <div className="space-y-3 min-h-[170px] flex flex-col justify-center">
                <div className="text-[10px] text-white/40 tracking-wider">
                  {steps[activeStep].phase}
                </div>

                <div className="p-2.5 bg-[#0d0d0e] border border-white/[0.06] rounded text-[11px] text-white/90 font-mono break-all">
                  {steps[activeStep].code}
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1">
                  <span className="text-white/40">TARGET:</span>
                  <span className="text-sky-300 font-semibold">{steps[activeStep].target}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] border-t border-white/[0.04] pt-2">
                  <span className="text-white/40">RESULT:</span>
                  <span className="text-emerald-400 font-medium">{steps[activeStep].status}</span>
                </div>
              </div>

              {/* Progress step indicators */}
              <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-white/[0.06]">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`h-1 rounded transition-colors ${
                      i === activeStep ? 'bg-white' : 'bg-white/10 hover:bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveHero;
