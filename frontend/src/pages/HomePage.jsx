import React, { useState } from 'react';
import { 
  Bug, 
  Upload, 
  Sparkles, 
  FolderGit2, 
  ArrowRight, 
  CheckCircle,
  Image as ImageIcon,
  X
} from 'lucide-react';

export function HomePage({ onStartSession }) {
  const [issueText, setIssueText] = useState(
    'Submitting the login form with an empty email causes an unhandled runtime error: TypeError: Cannot read properties of undefined (reading "trim").'
  );
  const [repoName, setRepoName] = useState('demo-bug-repo');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('/demo-assets/error-screenshot.png');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Multimodal Agent Powered by Gemma 4 31B</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
          Turn bug screenshots into evidence-backed code fixes.
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Provide an issue description and screenshot. PatchBridge inspects the repository using Model Context Protocol (MCP) tools and proposes verified, surgical fixes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Issue Diagnosis Inputs
            </h2>
          </div>
          <button
            type="button"
            onClick={handleLoadDemo}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline-offset-4 hover:underline"
          >
            Load Demo Scenario
          </button>
        </div>

        {/* Bug Description */}
        <div>
          <label htmlFor="issueText" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Bug / Issue Description
          </label>
          <textarea
            id="issueText"
            rows={4}
            value={issueText}
            onChange={(e) => setIssueText(e.target.value)}
            placeholder="Describe the bug, user action, and observed error..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 font-sans"
            required
          />
        </div>

        {/* Screenshot Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Error Screenshot (Multimodal Clue)
          </label>

          {previewUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
              <img
                src={previewUrl}
                alt="Error Screenshot Preview"
                className="max-h-56 w-auto mx-auto rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer bg-slate-950/40 transition-colors">
              <Upload className="h-8 w-8 text-slate-500 mb-2" />
              <span className="text-xs font-medium text-slate-300">
                Click to upload screenshot or drag & drop
              </span>
              <span className="text-[11px] text-slate-500 mt-1">
                PNG, JPG up to 10MB
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

        {/* Target Repository */}
        <div>
          <label htmlFor="repoName" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Target Repository
          </label>
          <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <FolderGit2 className="h-4 w-4 text-emerald-400" />
            <select
              id="repoName"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none flex-1 font-mono"
            >
              <option value="demo-bug-repo" className="bg-slate-900">
                examples/demo-bug-repo (Local Sandbox)
              </option>
            </select>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Verified
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/10"
        >
          <span>{isSubmitting ? 'Starting Investigation...' : 'Start Agent Triage'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

export default HomePage;
