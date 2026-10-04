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
          SECTION 1: HERO PORTAL WITH UNBOUNDED ELECTRIC LOGO & SWIRLING AEROPARTICLES
          Full width, frameless, natural transparency with AeroShards flowing around and over it.
         ========================================================================= */}
      <section className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px] flex items-center justify-center overflow-hidden border-b border-white/[0.08]">
        {/* Layer 0: Background AeroShards Wind Sculpture */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <AeroShards
            backgroundColor="#0d0d0e"
            shardColor="#404454"
            accentColor="#a1a6b4"
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

        {/* Layer 1: Frameless, Unbounded Electric Logo scaled to maximum length */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-auto">
          <div className="w-full max-w-2xl h-[380px] sm:h-[480px] lg:h-[560px] relative flex items-center justify-center">
            <ElectricLogo
              src="/patchbridge-logo.svg"
              color="#ffffff"
              glowColor="#38bdf8"
              scale={0.88}
              intensity={1.2}
              glow={1.3}
              strands={5}
              bend={0.65}
              crackle={1.6}
              arcs={2}
              flicker={0.5}
              fill={0.04}
              speed={2.6}
              interactive={true}
              cursorIntensity={1.1}
              cursorRadius={110}
            />
          </div>
        </div>

        {/* Ambient bottom gradient blend into the content below */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0d0d0e] to-transparent pointer-events-none z-20" />
      </section>

      {/* =========================================================================
          SECTION 2: EDITORIAL PITCH & LIVE GEMMA 4 RADAR
         ========================================================================= */}
      <section className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Headline & Action */}
          <div className="lg:col-span-7 space-y-5">
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

        {/* BOTTOM TAG: FIG. 000 Pushed to Bottom of Hero */}
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
