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
    <div className="relative">
      {/* =========================================================================
          SECTION 1: HERO PORTAL WITH ELECTRIC LOGO ON LEFT & ANIMATED TEXT ON RIGHT
          AeroShards swirling continuously across the background underneath the transparent floating navbar.
         ========================================================================= */}
      <section className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center justify-center overflow-hidden border-b border-white/[0.08] pt-16">
        {/* Layer 0: Continuous Background AeroShards Wind Sculpture */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <AeroShards
            backgroundColor="#0d0d0e"
            shardColor="#454958"
            accentColor="#a6abbb"
            placement="full"
            flow="stream"
            material="chrome"
            detail="balanced"
            effect="none"
            scale={1.25}
            spread={1.2}
            depth={1.4}
            speed={1.0}
            spin={1.2}
            interaction="repel"
            density={1.75}
            shardSize={1.3}
            stretch={1.15}
            turbulence={1.2}
            glow={1.4}
            edgeSoftness={1.8}
            bloom={0.7}
            grain={0.03}
            chromaticAberration={0.006}
            transitionDuration={1}
            interactionRadius={1.8}
            interactionStrength={0.7}
            rippleIntensity={1.3}
            holdToGather={true}
          />
        </div>

        {/* Layer 1: Electric Logo (Left) + Animated Typography (Right) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Electric Logo (reduced scale, perfectly centered in bounds) */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="w-full max-w-[340px] sm:max-w-[400px] h-[300px] sm:h-[360px] relative flex items-center justify-center">
                <ElectricLogo
                  src="/patchbridge-logo.svg"
                  color="#f8fafc"
                  glowColor="#64748b"
                  scale={0.58}
                  intensity={1.15}
                  glow={1.0}
                  strands={4}
                  bend={0.5}
                  crackle={1.4}
                  arcs={2}
                  flicker={0.35}
                  fill={0.0}
                  speed={2.4}
                  interactive={true}
                  cursorIntensity={0.85}
                  cursorRadius={85}
                />
              </div>
            </div>

            {/* Right Column: Animated Typography & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] text-white/50 tracking-wider uppercase bg-[#121215]/60 border border-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>MULTIMODAL REASONING • GEMMA 4</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.08] font-sans">
                From visual error to <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                  verified unified diff.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-xl font-sans">
                PatchBridge parses issue screenshots and traverses live repository trees using{' '}
                <span className="text-white/90 font-mono">gemma-4-31b-it</span> and the{' '}
                <span className="text-white/90 font-mono">Model Context Protocol</span>. Zero hallucinated line numbers.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 font-mono text-xs">
                <button
                  onClick={onExploreClick}
                  className="px-6 py-3 bg-white text-black hover:bg-white/90 active:scale-[0.98] font-medium rounded transition-transform cursor-pointer shadow-lg"
                >
                  OPEN WORKSPACE STUDIO ›
                </button>
                <div className="px-4 py-3 border border-white/10 rounded text-white/60 text-[11px] bg-[#121215]/60 backdrop-blur-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                  <span>EVIDENCE-BACKED INVESTIGATION</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient bottom gradient blend into the content below */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d0d0e] to-transparent pointer-events-none z-20" />
      </section>

      {/* =========================================================================
          SECTION 2: LIVE GEMMA 4 RADAR INSPECTOR & REASONING FLOW
         ========================================================================= */}
      <section className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Section narrative */}
          <div className="lg:col-span-5 space-y-4">
            <div className="font-mono text-[11px] text-sky-400 tracking-wider uppercase">
              CHAPTER 01 // AUTONOMOUS REASONING LOOP
            </div>
            <h2 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
              Deterministic verification before proposing code.
            </h2>
            <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-sans">
              Watch real-time step observations as Gemma 4 queries MCP tools, confirms symbol declarations, and cites exact file lines before suggesting a unified patch.
            </p>
          </div>

          {/* Right: Animated Inspector / Radar Widget */}
          <div className="lg:col-span-7">
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
              <div className="space-y-3 min-h-[160px] flex flex-col justify-center">
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

        {/* BOTTOM TAG: FIG. 000 */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-[11px] text-white/50 tracking-wider uppercase bg-[#121215]/80 border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>FIG. 000 // AUTONOMOUS MULTIMODAL DEBUGGING AGENT</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-white/40">
            <span>SPEC: GEMMA-4-31B-IT</span>
            <span>•</span>
            <span>MCP PROTOCOL</span>
            <span>•</span>
            <span>ZERO-HALLUCINATION DIFF</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default InteractiveHero;
