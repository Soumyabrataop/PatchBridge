import React from 'react';

export function ProductFeatures() {
  const features = [
    {
      num: '01',
      tag: 'VISION // GEMMA 4 31B',
      title: 'Multimodal Error Grounding',
      description:
        'Decodes stack traces, UI console exceptions, and visual error states directly from screenshots. Maps visual clues into exact search queries without manual transcription.'
    },
    {
      num: '02',
      tag: 'PROTOCOL // MCP TOOLS',
      title: 'Autonomous Code Exploration',
      description:
        'Systematically inspects files using Model Context Protocol (MCP) primitives (list_files, search_repo, read_file). Operates with strict rate limits and directory filters.'
    },
    {
      num: '03',
      tag: 'STANDARD // EVIDENCE FIRST',
      title: 'Zero Hallucinated Lines',
      description:
        'Every diagnostic claim cites verified file paths and line numbers verified by deterministic tools. If evidence is insufficient, it explicitly escalates to human review.'
    },
    {
      num: '04',
      tag: 'AUTOMATION // GITHUB BOT',
      title: 'Two-Phase Issue Workflow',
      description:
        'Responds to /patchbridge on GitHub issues. Phase 1 posts an instant live session URL within 2 seconds. Phase 2 posts the verified unified diff and test plan.'
    }
  ];

  return (
    <div className="py-16 border-b border-white/[0.08]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 font-mono text-[11px] text-white/40 tracking-wider uppercase mb-8">
          <span>FIG. 001 // SYSTEM ARCHITECTURE & CAPABILITIES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-[#121215] border border-white/[0.08] hover:border-white/20 transition-colors rounded-lg p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] font-mono text-xs">
                  <span className="text-white/40 text-[10px] tracking-wider uppercase">
                    {f.tag}
                  </span>
                  <span className="text-white/30 text-[11px]">{f.num}</span>
                </div>
                <h3 className="text-base font-medium text-white mb-2 font-sans">
                  {f.title}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed font-sans">
                  {f.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.04] font-mono text-[10px] text-white/30 flex items-center justify-between">
                <span>STATUS: VERIFIED</span>
                <span>ZERO DRIFT</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductFeatures;
