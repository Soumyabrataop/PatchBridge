import React, { useState, useRef } from 'react';
import { InteractiveHero } from '../components/InteractiveHero';
import { ProductFeatures } from '../components/ProductFeatures';

export function HomePage({ onStartSession }) {
  const [issueText, setIssueText] = useState(
    'Submitting the login form with an empty email causes an unhandled runtime error: TypeError: Cannot read properties of undefined (reading "trim").'
  );
  const [repoName, setRepoName] = useState('demo-bug-repo');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('/demo-assets/error-screenshot.png');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef(null);

  const handleScrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setScreenshotFile(null);
    setPreviewUrl(null);
  };

  const handleLoadDemo = () => {
    setIssueText(
      'Submitting the login form with an empty email causes an unhandled runtime error: TypeError: Cannot read properties of undefined (reading "trim").'
    );
    setRepoName('demo-bug-repo');
    setScreenshotFile(null);
    setPreviewUrl('/demo-assets/error-screenshot.png');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issueText.trim()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('issueText', issueText);
      formData.append('repoName', repoName);

      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }

      const res = await fetch('/api/sessions', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error(`Failed to create session: ${res.statusText}`);
      }

      const data = await res.json();
      onStartSession(data.sessionId);
    } catch (err) {
      alert(`Error creating session: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* 1. Hero Section with Interactive Radar */}
      <InteractiveHero onExploreClick={handleScrollToForm} />

      {/* 2. What the Product Does (Pillars & Architecture) */}
      <ProductFeatures />

      {/* 3. Direct Intake Section */}
      <div ref={formRef} className="max-w-4xl mx-auto px-4 sm:px-6 py-20 font-sans">
        <div className="mb-10 space-y-2">
          <div className="flex items-center gap-2 font-mono text-[11px] text-white/40 tracking-wider uppercase">
            <span>CHAPTER 02</span>
            <span>//</span>
            <span>DIRECT TRIAGE STUDIO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
            Execute manual repository investigation.
          </h2>
          <p className="text-xs sm:text-sm text-white/50 max-w-lg leading-relaxed">
            Attach an error artifact and issue narrative. The agent launches an ephemeral session with Server-Sent Events telemetry.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bento Grid Intake */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Card 1: Issue Description (7 cols) */}
            <div className="md:col-span-7 bg-[#121215] border border-white/[0.08] rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] font-mono text-xs">
                  <span className="text-white/40 uppercase tracking-wider text-[11px]">
                    01. PROBLEM DESCRIPTION
                  </span>
                  <button
                    type="button"
                    onClick={handleLoadDemo}
                    className="text-white/40 hover:text-white transition-colors text-[11px]"
                  >
                    [ LOAD SAMPLE ]
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="Paste defect report or stack trace..."
                  className="w-full bg-[#0d0d0e] border border-white/[0.06] rounded p-3 text-xs text-white/90 placeholder:text-white/20 focus:outline-none focus:border-white/30 font-mono leading-relaxed"
                  required
                />
              </div>
              <div className="pt-3 font-mono text-[10px] text-white/30 flex items-center justify-between">
                <span>MODE: DIRECT INTAKE</span>
                <span>SYNTAX: PLAIN / MARKDOWN</span>
              </div>
            </div>

            {/* Card 2: Target Repository (5 cols) */}
            <div className="md:col-span-5 bg-[#121215] border border-white/[0.08] rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] font-mono text-xs">
                  <span className="text-white/40 uppercase tracking-wider text-[11px]">
                    02. TARGET REPOSITORY
                  </span>
                  <span className="text-[10px] text-white/30">[ LOCAL ]</span>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-[10px] text-white/40 block mb-1.5 uppercase">
                      Sandbox Path
                    </label>
                    <select
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      className="w-full bg-[#0d0d0e] border border-white/[0.06] rounded p-2.5 text-xs text-white/80 focus:outline-none focus:border-white/30 font-mono"
                    >
                      <option value="demo-bug-repo">examples/demo-bug-repo</option>
                    </select>
                  </div>
                  <div className="p-2.5 bg-[#0d0d0e] border border-white/[0.04] rounded text-[11px] text-white/50 leading-relaxed font-sans">
                    Mounted local sandbox containing reproducible <code className="font-mono text-white/70">src/validation.js</code> defect.
                  </div>
                </div>
              </div>
              <div className="pt-3 font-mono text-[10px] text-white/30">
                STATUS: MOUNTED & VERIFIED
              </div>
            </div>

            {/* Card 3: Multimodal Screenshot (12 cols) */}
            <div className="md:col-span-12 bg-[#121215] border border-white/[0.08] rounded-lg p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06] font-mono text-xs">
                <span className="text-white/40 uppercase tracking-wider text-[11px]">
                  03. VISUAL ERROR ARTIFACT (SCREENSHOT)
                </span>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="text-white/40 hover:text-white transition-colors text-[11px]"
                  >
                    [ REMOVE ]
                  </button>
                )}
              </div>

              {previewUrl ? (
                <div className="bg-[#070708] border border-white/[0.06] rounded p-3 flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt="Error Screenshot"
                    className="max-h-64 rounded object-contain border border-white/[0.04]"
                  />
                  <span className="mt-2 text-[10px] font-mono text-white/30">
                    ARTIFACT LOADED FOR GEMMA 4 MULTIMODAL INFERENCE
                  </span>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 hover:border-white/20 rounded cursor-pointer bg-[#0d0d0e]/40 transition-colors">
                  <span className="font-mono text-xs text-white/60 mb-1">
                    Upload error screenshot or drag file
                  </span>
                  <span className="font-mono text-[10px] text-white/30">
                    PNG / JPG UP TO 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="font-mono text-[11px] text-white/40">
              REASONING ENGINE: <span className="text-white/70">GEMMA-4-31B-IT</span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-white text-black hover:bg-white/90 active:scale-[0.98] font-mono font-medium text-xs rounded transition-transform disabled:opacity-40"
            >
              {isSubmitting ? 'INITIALIZING INVESTIGATION...' : 'EXECUTE TRIAGE ›'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HomePage;
