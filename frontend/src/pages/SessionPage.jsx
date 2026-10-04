import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  Copy, 
  Check, 
  FileCheck2,
  FileCode2,
  Flame,
  GitPullRequest
} from 'lucide-react';
import { TraceTimeline } from '../components/TraceTimeline';
import { DiffViewer } from '../components/DiffViewer';
import { TelemetryCard } from '../components/TelemetryCard';

export function SessionPage({ sessionId, onBack }) {
  const [session, setSession] = useState(null);
  const [trace, setTrace] = useState([]);
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState('analyzing');
  const [error, setError] = useState(null);
  const [prCopied, setPrCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    // Connect to Server-Sent Events stream
    const eventSource = new EventSource(`/api/sessions/${sessionId}/stream`);

    eventSource.addEventListener('init', (e) => {
      try {
        const data = JSON.parse(e.data);
        setSession(data);
        setStatus(data.status);
        if (data.trace) setTrace(data.trace);
        if (data.report) setReport(data.report);
      } catch (err) {
        console.error('Error parsing init event:', err);
      }
    });

    eventSource.addEventListener('trace', (e) => {
      try {
        const newStep = JSON.parse(e.data);
        setTrace((prev) => [...prev, newStep]);
      } catch (err) {
        console.error('Error parsing trace event:', err);
      }
    });

    eventSource.addEventListener('completed', (e) => {
      try {
        const data = JSON.parse(e.data);
        setStatus('completed');
        if (data.report) setReport(data.report);
      } catch (err) {
        console.error('Error parsing completed event:', err);
      }
      eventSource.close();
    });

    eventSource.addEventListener('failed', (e) => {
      try {
        const data = JSON.parse(e.data);
        setStatus('failed');
        setError(data.error || 'Investigation failed');
      } catch (err) {
        console.error('Error parsing failed event:', err);
      }
      eventSource.close();
    });

    eventSource.onerror = () => {
      // Fetch latest state via REST fallback if SSE encounters interruption
      fetch(`/api/sessions/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setSession(data);
          setStatus(data.status);
          if (data.trace) setTrace(data.trace);
          if (data.report) setReport(data.report);
        })
        .catch(console.error);
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  const handleCopyPrSummary = () => {
    if (!report?.prSummary) return;
    navigator.clipboard.writeText(report.prSummary);
    setPrCopied(true);
    setTimeout(() => setPrCopied(false), 2000);
  };

  const isRunning = status === 'analyzing' || status === 'pending';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Back to triage submission"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white font-mono">
                {sessionId}
              </h1>
              {isRunning && (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Investigating
                </span>
              )}
              {status === 'completed' && (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Triage Complete
                </span>
              )}
              {status === 'failed' && (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertCircle className="h-3 w-3" />
                  Failed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: <span className="font-mono text-slate-300">{session?.repoName || 'demo-bug-repo'}</span>
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Live SSE Feed Active
        </div>
      </div>

      {/* Main Grid: Trace and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Trace Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <TraceTimeline trace={trace} isRunning={isRunning} />
          {report?.telemetry && <TelemetryCard telemetry={report.telemetry} />}
        </div>

        {/* Right Column: Diagnosis, Evidence & Proposed Fix (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {isRunning && !report && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mx-auto" />
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Gemma 4 is investigating the repository
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Correlating multimodal screenshot stack traces with verified source lines.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-950/30 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
              <strong>Investigation Error:</strong> {error}
            </div>
          )}

          {report && (
            <>
              {/* Root Cause Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span>Identified Root Cause</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {report.rootCause}
                </p>
              </div>

              {/* Verified Code Evidence */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  <FileCode2 className="h-4 w-4 text-emerald-400" />
                  <span>Verified Codebase Evidence</span>
                </div>
                <div className="space-y-2">
                  {report.evidence?.map((ev, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
                        <span className="font-semibold text-sky-400">
                          {ev.filePath}:{ev.lineNumber}
                        </span>
                        <span className="text-slate-500">Evidence #{idx + 1}</span>
                      </div>
                      <div className="font-mono text-[11px] text-emerald-300 bg-slate-900 px-2 py-1 rounded">
                        {ev.snippet}
                      </div>
                      <p className="text-slate-400 text-[11px] font-sans pt-0.5">
                        {ev.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposed Unified Diff */}
              <DiffViewer patch={report.suggestedPatch} />

              {/* Test Plan */}
              {report.testPlan && report.testPlan.length > 0 && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    <FileCheck2 className="h-4 w-4 text-emerald-400" />
                    <span>Recommended Test Plan</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 font-sans">
                    {report.testPlan.map((testCase, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                        <span>{testCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* PR-Ready Summary */}
              {report.prSummary && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      <GitPullRequest className="h-4 w-4 text-blue-400" />
                      <span>Contribution-Ready PR Summary</span>
                    </div>
                    <button
                      onClick={handleCopyPrSummary}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition-colors"
                    >
                      {prCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-400" />
                          <span>Copy Markdown</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                    {report.prSummary}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SessionPage;
