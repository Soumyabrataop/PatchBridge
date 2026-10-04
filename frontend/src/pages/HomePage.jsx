import React from 'react';
import { InteractiveHero } from '../components/InteractiveHero';
import { ProductFeatures } from '../components/ProductFeatures';

export function HomePage({ onOpenWorkspace }) {
  return (
    <div>
      {/* 1. Hero Section with AeroShards and Interactive Radar */}
      <InteractiveHero onExploreClick={onOpenWorkspace} />

      {/* 2. What the Product Does (Pillars & Architecture) */}
      <ProductFeatures />

      {/* 3. Streamlined Editorial Call-to-Action */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 font-sans border-t border-white/[0.06]">
        <div className="bg-[#121215] border border-white/[0.08] rounded-xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 font-mono text-[11px] text-white/40 tracking-wider uppercase">
              <span>WORKSPACE READY</span>
              <span>//</span>
              <span>DEVELOPER PORTAL</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-normal text-white tracking-tight font-sans">
              Authenticate via GitHub to run direct triage & manage repositories.
            </h3>
            <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-sans">
              All manual session uploads, local sandbox mounting, and automated <code className="text-white/70 font-mono">/patchbridge</code> webhook routing live inside your workspace dashboard.
            </p>
          </div>

          <button
            onClick={onOpenWorkspace}
            className="px-6 py-3 bg-white text-black hover:bg-white/90 active:scale-[0.98] font-mono text-xs font-medium rounded transition-transform shrink-0"
          >
            ENTER WORKSPACE ›
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
