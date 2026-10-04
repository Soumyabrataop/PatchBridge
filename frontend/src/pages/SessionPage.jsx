import React, { useEffect, useState } from 'react';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8 font-sans">
      {/* Session Monitor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-2.5 py-1 rounded bg-[#121215] hover:bg-[#1a1a1e] border border-white/10 text-white/50 hover:text-white font-mono text-xs transition-colors"
          >
            ‹ BACK
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-white tracking-wide">
                {sessionId}
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-white/10 text-white/60">
                {isRunning ? 'STATUS: INVESTIGATING' : status === 'completed' ? 'STATUS: COMPLETE' : 'STATUS: FAILED'}
              </span>
            </div>
            <div className="font-mono text-[11px] text-white/40 mt-1">
              TARGET: <span className="text-white/70">{session?.repoName || 'demo-bug-repo'}</span>
            </div>
          </div>
        </div>

        <div className="font-mono text-[11px] text-white/30">
          FEED: STREAMING // SSE
        </div>
      </div>

      {/* Main Grid: Trace & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Trace Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <TraceTimeline trace={trace} isRunning={isRunning} />
          {report?.telemetry && <TelemetryCard telemetry={report.telemetry} />}
        </div>

        {/* Right Column: Evidence & Report (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {isRunning && !report && (
            <div className="bg-[#121215] border border-white/[0.08] rounded-lg p-10 text-center space-y-3 font-mono">
              <div className="text-xs text-white/70">
                Gemma 4 is executing MCP repository investigation...
              </div>
              <div className="text-[11px] text-white/30 max-w-sm mx-auto font-sans leading-relaxed">
                Mapping visual crash tokens to codebase lines using deterministic tools.
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-lg text-rose-300 font-mono text-xs">
              ERROR: {error}
            </div>
          )}

          {report && (
            <>
              {/* Root Cause Card */}
              <div className="bg-[#121215] border border-white/[0.08] rounded-lg p-5 space-y-2">
                <div className="font-mono text-[11px] text-white/40 uppercase tracking-wider pb-2 border-b border-white/[0.06]">
                  01. IDENTIFIED ROOT CAUSE
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans pt-1">
                  {report.rootCause}
                </p>
              </div>

              {/* Verified Code Evidence */}
              <div className="bg-[#121215] border border-white/[0.08] rounded-lg p-5 space-y-3">
                <div className="font-mono text-[11px] text-white/40 uppercase tracking-wider pb-2 border-b border-white/[0.06]">
                  02. VERIFIED CODEBASE EVIDENCE
                </div>
                <div className="space-y-2.5 font-mono text-xs">
                  {report.evidence?.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#0d0d0e] border border-white/[0.06] rounded space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white/90">
                          {ev.filePath}:{ev.lineNumber}
                        </span>
                        <span className="text-white/30">[REF #{idx + 1}]</span>
                      </div>
                      <div className="text-[11px] text-emerald-400 bg-white/[0.02] p-1.5 rounded border border-white/[0.04]">
                        {ev.snippet}
                      </div>
                      <div className="text-[11px] text-white/50 font-sans leading-relaxed">
                        {ev.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposed Unified Diff */}
              <DiffViewer patch={report.suggestedPatch} />

              {/* Test Plan */}
              {report.testPlan && report.testPlan.length > 0 && (
                <div className="bg-[#121215] border border-white/[0.08] rounded-lg p-5 space-y-3">
                  <div className="font-mono text-[11px] text-white/40 uppercase tracking-wider pb-2 border-b border-white/[0.06]">
                    03. VERIFICATION TEST PLAN
                  </div>
                  <ul className="space-y-2 text-xs text-white/70 font-sans">
                    {report.testPlan.map((testCase, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-white/40 font-mono text-[11px]">[{idx + 1}]</span>
                        <span className="leading-relaxed">{testCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contribution-Ready PR Summary */}
              {report.prSummary && (
                <div className="bg-[#121215] border border-white/[0.08] rounded-lg p-5 space-y-3 font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-[11px] text-white/40 uppercase tracking-wider">
                      04. PULL REQUEST SUMMARY
                    </span>
                    <button
                      onClick={handleCopyPrSummary}
                      className="text-[11px] text-white/50 hover:text-white transition-colors"
                    >
                      {prCopied ? '[ COPIED ✓ ]' : '[ COPY MARKDOWN ]'}
                    </button>
                  </div>
                  <pre className="p-3 bg-[#0d0d0e] border border-white/[0.04] rounded text-[11px] text-white/70 whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto leading-relaxed">
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
