import React, { useState } from 'react';
import AeroShards from './AeroShards';
import ElectricLogo from './ElectricLogo';

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

  return (
    <div className="relative pt-24 pb-28 border-b border-white/[0.08] overflow-hidden min-h-[640px] flex items-center">
      {/* 1. AeroShards Animated WebGPU Wind Sculpture in Graphite (High visibility) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-85">
        <AeroShards
          backgroundColor="#0d0d0e"
          shardColor="#383b47"
          accentColor="#9ca3af"
          placement="full"
          flow="stream"
          material="chrome"
          detail="balanced"
          effect="none"
          scale={1.15}
          spread={1.1}
          depth={1.2}
          speed={0.9}
          spin={1.1}
          interaction="repel"
          density={1.6}
          shardSize={1.25}
          stretch={1.1}
          turbulence={1.1}
          glow={1.2}
          edgeSoftness={1.8}
          bloom={0.65}
          grain={0.03}
          chromaticAberration={0.005}
          transitionDuration={1}
          interactionRadius={1.8}
          interactionStrength={0.7}
          rippleIntensity={1.2}
          holdToGather={true}
        />
      </div>

      {/* 2. Soft Architectural Contrast Backdrop behind content */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0d0e]/40 to-[#0d0d0e]/90 pointer-events-none z-[1]" />

      {/* 3. Hero Foreground Content - Shifted down with comfortable top spacing */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        {/* Top Tag & Electric Logo Badge */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2 font-mono text-[11px] text-white/50 tracking-wider uppercase bg-[#121215]/80 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>FIG. 000 // AUTONOMOUS MULTIMODAL DEBUGGING AGENT</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-white/40">
            <span>CORE: GEMMA 4</span>
            <span>•</span>
            <span>MCP ENABLED</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Electric Logo Feature + Editorial Hero Pitch */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-5">
              {/* Electric Logo Container with ambient electrical glow halo */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl bg-[#121215]/80 border border-white/10 p-1 backdrop-blur-md shadow-2xl flex items-center justify-center overflow-hidden group">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 to-emerald-500/20 blur-lg opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <ElectricLogo
                  src="/patchbridge-logo.svg"
                  color="#ffffff"
                  glowColor="#38bdf8"
                  scale={0.72}
                  strands={4}
                  bend={0.6}
                  crackle={1.5}
                  arcs={2}
                  speed={2.6}
                  interactive={true}
                  cursorIntensity={1}
                  cursorRadius={80}
                />
              </div>

              <div>
                <div className="font-mono text-[11px] text-sky-400 font-medium tracking-wider uppercase mb-1">
                  PATCHBRIDGE CORE
                </div>
                <h2 className="text-xl sm:text-2xl font-medium text-white tracking-tight font-sans">
                  Visual-to-Code Precision
                </h2>
                <p className="text-xs text-white/50 font-sans mt-0.5">
                  Direct multimodal synthesis with live MCP exploration
                </p>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-normal text-white tracking-tight leading-[1.1] font-sans">
              From visual error to verified unified diff.
            </h1>

            <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-xl font-sans">
              PatchBridge correlates issue screenshots with actual repository code using Google's{' '}
              <span className="text-white/90 font-mono">Gemma 4 (gemma-4-31b-it)</span> and the{' '}
              <span className="text-white/90 font-mono">Model Context Protocol</span>. Zero hallucinated line numbers.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 font-mono text-xs">
              <button
                onClick={onExploreClick}
                className="px-6 py-3 bg-white text-black hover:bg-white/90 active:scale-[0.98] font-medium rounded transition-transform cursor-pointer shadow-lg"
              >
                OPEN WORKSPACE STUDIO ›
              </button>
              <div className="px-3 py-2.5 border border-white/10 rounded text-white/60 text-[11px] bg-[#121215]/80 backdrop-blur-md">
                RESPONSE TIME: &lt; 20S
              </div>
            </div>
          </div>

          {/* Right: Animated Inspector / Radar Widget */}
          <div className="lg:col-span-5">
            <div className="bg-[#121215]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-5 font-mono text-xs shadow-2xl relative overflow-hidden">
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] text-[10px] text-white/40">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white/20"></span>
                  <span className="w-2 h-2 rounded-full bg-white/20"></span>
                  <span className="w-2 h-2 rounded-full bg-white/20"></span>
                  <span className="ml-2 tracking-wider">GEMMA-4 // RADAR</span>
                </div>
                <span className="text-emerald-400/90 font-medium animate-pulse">LIVE REASONING</span>
              </div>

              {/* Step Flow */}
              <div className="space-y-3 min-h-[170px] flex flex-col justify-center">
                <div className="text-[10px] text-white/40 tracking-wider">
                  {steps[activeStep].phase}
                </div>

                <div className="p-3 bg-[#0d0d0e]/90 border border-white/[0.08] rounded text-[11px] text-white/90 font-mono break-all leading-relaxed">
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
                    className={`h-1.5 rounded transition-colors ${
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
