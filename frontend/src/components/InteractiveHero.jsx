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
          CHAPTER 01: HERO PORTAL & LIVE REASONING RADAR
          - Background: Softened, harmonious AeroShards floating naturally.
          - Left: Electric Logo with blended warm platinum/graphite filament glow.
          - Right: Live animated typography and reasoning value proposition.
          - Interactive radar telemetry cleanly integrated into the chapter.
         ========================================================================= */}
      <section className="relative w-full min-h-[600px] lg:min-h-[680px] flex items-center justify-center overflow-hidden border-b border-white/[0.08] pt-16 pb-12">
        {/* Layer 0: AeroShards in warm graphite & slate monochrome */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          <AeroShards
            backgroundColor="#0d0d0e"
            shardColor="#2e313b"
            accentColor="#646877"
            placement="full"
            flow="stream"
            material="pearl"
            detail="balanced"
            effect="none"
            scale={1.1}
            spread={1.05}
            depth={1.1}
            speed={0.65}
            spin={0.8}
            interaction="repel"
            density={1.25}
            shardSize={1.05}
            stretch={1.0}
            turbulence={0.7}
            glow={0.7}
            edgeSoftness={2.0}
            bloom={0.35}
            grain={0.02}
            chromaticAberration={0.002}
            transitionDuration={1.2}
            interactionRadius={1.5}
            interactionStrength={0.45}
            rippleIntensity={0.8}
            holdToGather={true}
          />
        </div>

        {/* Ambient subtle vignette */}
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0d0e]/30 to-[#0d0d0e] pointer-events-none z-[1]" />

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 space-y-12">
          {/* Main Hero Grid: Logo + Typography */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Electric Logo, warm platinum/anodized silver blending with shards */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="w-full max-w-[320px] sm:max-w-[360px] h-[280px] sm:h-[320px] relative flex items-center justify-center">
                <ElectricLogo
                  src="/patchbridge-logo.svg"
                  color="#f1f5f9"
                  glowColor="#64748b"
                  scale={0.54}
                  intensity={0.95}
                  glow={0.75}
                  thickness={1.3}
                  strands={3}
                  bend={0.38}
                  crackle={1.1}
                  arcs={1}
                  flicker={0.25}
                  fill={0.0}
                  speed={1.8}
                  interactive={true}
                  cursorIntensity={0.65}
                  cursorRadius={75}
                />
              </div>
            </div>

            {/* Right: Typography Headline & CTAs */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 font-mono text-[11px] text-white/50 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>CHAPTER 01 // MULTIMODAL DEBUGGING INGESTION</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.08] font-sans">
                From visual error to <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                  verified unified diff.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-xl font-sans">
                PatchBridge correlates visual bug reports with repository ASTs using{' '}
                <span className="text-white/90 font-mono">gemma-4-31b-it</span> and the{' '}
                <span className="text-white/90 font-mono">Model Context Protocol</span>. Zero hallucinated file paths.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 font-mono text-xs">
                <button
                  onClick={onExploreClick}
                  className="px-6 py-3 bg-white text-black hover:bg-white/90 active:scale-[0.98] font-medium rounded transition-transform cursor-pointer shadow-lg"
                >
                  OPEN WORKSPACE STUDIO ›
                </button>
                <div className="px-4 py-3 border border-white/10 rounded text-white/60 text-[11px] bg-[#121215]/60 backdrop-blur-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                  <span>EVIDENCE-FIRST SPECIFICATION</span>
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Live Reasoning Loop Telemetry Box */}
          <div className="bg-[#121215]/80 backdrop-blur-md border border-white/[0.08] rounded-xl p-5 font-mono text-xs shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] text-[10px] text-white/40">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/20"></span>
                <span className="w-2 h-2 rounded-full bg-white/20"></span>
                <span className="w-2 h-2 rounded-full bg-white/20"></span>
                <span className="ml-2 tracking-wider">GEMMA-4 REASONING ENGINE // RADAR TRACE</span>
              </div>
              <span className="text-emerald-400/90 font-medium animate-pulse">LIVE REASONING</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-8 space-y-2.5">
                <div className="text-[10px] text-white/40 tracking-wider">
                  {steps[activeStep].phase}
                </div>
                <div className="p-3 bg-[#0d0d0e]/90 border border-white/[0.08] rounded text-[11px] text-white/90 font-mono break-all leading-relaxed">
                  {steps[activeStep].code}
                </div>
              </div>

              <div className="md:col-span-4 space-y-2 border-t md:border-t-0 md:border-l border-white/[0.06] pt-2 md:pt-0 md:pl-4">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/40">TARGET:</span>
                  <span className="text-sky-300 font-semibold">{steps[activeStep].target}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/40">VERIFICATION:</span>
                  <span className="text-emerald-400 font-medium">{steps[activeStep].status}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-3 mt-3 border-t border-white/[0.06]">
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
      </section>
    </div>
  );
}

export default InteractiveHero;
