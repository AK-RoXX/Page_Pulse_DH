'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Search, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Heading, 
  Image as ImageIcon, 
  FileCode2, 
  ExternalLink,
  ShieldCheck,
  Activity,
  ArrowRight,
  Download,
  Plus,
  Trash2,
  History,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface AuditMetrics {
  statusCode: number;
  responseTimeMs: number;
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  imagesMissingAltCount: number;
  wordCount: number;
}

export interface AuditItem {
  id: string;
  url: string;
  timestamp: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  result?: AuditMetrics;
  error?: string;
  statusErrCode?: number;
}

export default function Dashboard() {
  const [urlInputs, setUrlInputs] = useState<string[]>(['']);
  const [audits, setAudits] = useState<AuditItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Load audit history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('page_pulse_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAudits(parsed);
        if (parsed.length > 0) {
          setActiveTabId(parsed[0].id);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save audit history to localStorage when changed
  useEffect(() => {
    if (audits.length > 0) {
      try {
        localStorage.setItem('page_pulse_history', JSON.stringify(audits));
      } catch {
        // Ignore storage errors
      }
    }
  }, [audits]);

  const handleAddInput = () => {
    setUrlInputs([...urlInputs, '']);
  };

  const handleRemoveInput = (index: number) => {
    if (urlInputs.length > 1) {
      setUrlInputs(urlInputs.filter((_, i) => i !== index));
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const updated = [...urlInputs];
    updated[index] = value;
    setUrlInputs(updated);
  };

  const runSimultaneousAudits = async (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = urlInputs.map(u => u.trim()).filter(Boolean);
    if (validUrls.length === 0) return;

    // Create new batch item objects
    const newItems: AuditItem[] = validUrls.map((url) => ({
      id: Math.random().toString(36).substring(2, 9),
      url,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'loading',
    }));

    setAudits((prev) => [...newItems, ...prev]);
    setActiveTabId(newItems[0].id);

    // Execute audits concurrently
    await Promise.all(
      newItems.map(async (item) => {
        try {
          const res = await fetch('/api/audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: item.url }),
          });

          const data = await res.json();

          setAudits((prev) =>
            prev.map((a) => {
              if (a.id !== item.id) return a;
              if (!res.ok) {
                return {
                  ...a,
                  status: 'error',
                  statusErrCode: res.status,
                  error: data.error || 'An unexpected error occurred while analyzing the target URL.',
                };
              }
              return {
                ...a,
                status: 'success',
                result: data,
              };
            })
          );
        } catch {
          setAudits((prev) =>
            prev.map((a) =>
              a.id === item.id
                ? {
                    ...a,
                    status: 'error',
                    statusErrCode: 500,
                    error: 'Client-side failure. Could not communicate with Page Pulse audit service.',
                  }
                : a
            )
          );
        }
      })
    );
  };

  const clearHistory = () => {
    setAudits([]);
    setActiveTabId(null);
    localStorage.removeItem('page_pulse_history');
  };

  const downloadPdfReport = async () => {
    if (!reportRef.current || !activeAudit || !activeAudit.result) return;

    setIsExporting(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0d121d',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`page-pulse-audit-${activeAudit.url.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch {
      alert('Failed to generate PDF report.');
    } finally {
      setIsExporting(false);
    }
  };

  const activeAudit = audits.find((a) => a.id === activeTabId) || audits[0];

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#06080e]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span className="font-bold font-mono text-lg text-white">Page Pulse Dashboard</span>
          </div>
        </div>

        {audits.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-mono hover:bg-red-900/40 transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </header>

      {/* Main Workspace */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Multi-URL Input Section */}
        <section className="bg-[#0d121d]/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2 text-slate-200 font-mono text-sm font-semibold">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Simultaneous URL Auditor</span>
            </div>
            <button
              type="button"
              onClick={handleAddInput}
              className="px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono hover:border-cyan-400 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add URL</span>
            </button>
          </div>

          <form onSubmit={runSimultaneousAudits} className="space-y-3">
            {urlInputs.map((inputUrl, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={inputUrl}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                    required={idx === 0}
                  />
                </div>
                {urlInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveInput(idx)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Zap className="w-4 h-4 text-black fill-black" />
              <span>Run Simultaneous Audit ({urlInputs.filter(u => u.trim()).length || 1})</span>
            </button>
          </form>
        </section>

        {/* Audit Tabs & Analysis Dashboard */}
        {audits.length > 0 && (
          <section className="space-y-6">
            {/* Horizontal Tabs for Recent & Batch Audits */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 pr-2 shrink-0">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>Audits ({audits.length}):</span>
              </div>

              {audits.map((item) => {
                const isActive = item.id === activeAudit?.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTabId(item.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono shrink-0 transition-all flex items-center gap-2 border ${
                      isActive
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.status === 'loading' && <Activity className="w-3 h-3 animate-spin text-cyan-400" />}
                    {item.status === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {item.status === 'error' && <AlertTriangle className="w-3 h-3 text-red-400" />}
                    <span className="truncate max-w-[150px]">{item.url}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Audit Result View */}
            {activeAudit && (
              <div className="space-y-6">
                {/* Header bar with Export PDF option */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d121d]/80 border border-slate-800/80 p-4 rounded-xl backdrop-blur-xl">
                  <div>
                    <span className="text-xs font-mono text-slate-400">Target URL:</span>
                    <h2 className="text-lg font-bold font-mono text-cyan-300 truncate max-w-xl">
                      {activeAudit.url}
                    </h2>
                  </div>

                  {activeAudit.status === 'success' && activeAudit.result && (
                    <button
                      onClick={downloadPdfReport}
                      disabled={isExporting}
                      className="px-4 py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-xs hover:bg-emerald-900/50 hover:border-emerald-400 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50"
                    >
                      {isExporting ? (
                        <Activity className="w-4 h-4 animate-spin text-emerald-400" />
                      ) : (
                        <Download className="w-4 h-4 text-emerald-400" />
                      )}
                      <span>{isExporting ? 'Generating PDF...' : 'Download PDF Report'}</span>
                    </button>
                  )}
                </div>

                {/* Loading state */}
                {activeAudit.status === 'loading' && (
                  <div className="p-12 text-center rounded-2xl bg-[#0d121d]/60 border border-slate-800/60 space-y-3">
                    <Activity className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                    <p className="text-sm font-mono text-slate-300">Executing automated URL audit...</p>
                  </div>
                )}

                {/* Error State */}
                {activeAudit.status === 'error' && (
                  <div className="p-6 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 backdrop-blur-md flex items-start gap-3 shadow-[0_0_25px_rgba(239,68,68,0.15)]">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-mono text-xs font-semibold text-red-400 uppercase tracking-wider">
                        Error Response {activeAudit.statusErrCode ? `[HTTP ${activeAudit.statusErrCode}]` : ''}
                      </div>
                      <p className="text-sm font-sans">{activeAudit.error}</p>
                    </div>
                  </div>
                )}

                {/* PDF Printable Container & Display */}
                {activeAudit.status === 'success' && activeAudit.result && (
                  <div ref={reportRef} className="p-6 bg-[#0d121d] border border-slate-800 rounded-2xl space-y-6">
                    {/* Top Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Status Code */}
                      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-slate-400 uppercase">HTTP Status</span>
                          <ShieldCheck className={`w-4 h-4 ${activeAudit.result.statusCode >= 200 && activeAudit.result.statusCode < 300 ? 'text-emerald-400' : 'text-amber-400'}`} />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold font-mono text-white">{activeAudit.result.statusCode}</span>
                          <span className="text-xs text-slate-400 font-mono">
                            {activeAudit.result.statusCode >= 200 && activeAudit.result.statusCode < 300 ? 'OK' : 'Response'}
                          </span>
                        </div>
                      </div>

                      {/* Latency */}
                      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-slate-400 uppercase">Latency</span>
                          <Clock className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold font-mono text-cyan-400">{activeAudit.result.responseTimeMs}</span>
                          <span className="text-xs text-slate-400 font-mono">ms</span>
                        </div>
                      </div>

                      {/* H1 Count */}
                      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-slate-400 uppercase">H1 Tags</span>
                          <Heading className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold font-mono text-white">{activeAudit.result.h1Count}</span>
                          <span className="text-xs text-slate-400">
                            {activeAudit.result.h1Count === 1 ? 'Optimal' : activeAudit.result.h1Count === 0 ? 'Missing' : 'Multiple'}
                          </span>
                        </div>
                      </div>

                      {/* Missing Alt Images */}
                      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-slate-400 uppercase">Missing Alt</span>
                          <ImageIcon className={`w-4 h-4 ${activeAudit.result.imagesMissingAltCount === 0 ? 'text-emerald-400' : 'text-amber-400'}`} />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-3xl font-bold font-mono ${activeAudit.result.imagesMissingAltCount === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {activeAudit.result.imagesMissingAltCount}
                          </span>
                          <span className="text-xs text-slate-400">images</span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Title & Word Count Card */}
                      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <h3 className="text-sm font-mono font-semibold text-slate-200 uppercase">Page Identification</h3>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-mono text-slate-500 uppercase">Document Title</label>
                            <p className="text-sm font-medium text-slate-100 bg-slate-950 p-3 rounded-lg border border-slate-800 mt-1 font-mono break-all leading-snug">
                              {activeAudit.result.title ? activeAudit.result.title : <span className="text-slate-500 italic">No &lt;title&gt; element detected</span>}
                            </p>
                          </div>

                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-xs font-mono text-slate-400">Approximate Body Word Count:</span>
                            <span className="font-mono font-semibold text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-500/20 text-xs inline-flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" />
                              {activeAudit.result.wordCount.toLocaleString()} words
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Meta Description Card */}
                      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                          <FileCode2 className="w-4 h-4 text-emerald-400" />
                          <h3 className="text-sm font-mono font-semibold text-slate-200 uppercase">SEO Metadata</h3>
                        </div>

                        <div>
                          <label className="text-xs font-mono text-slate-500 uppercase">Meta Description</label>
                          <p className="text-sm font-medium text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800 mt-1 font-sans leading-relaxed break-words min-h-[90px]">
                            {activeAudit.result.metaDescription ? (
                              activeAudit.result.metaDescription
                            ) : (
                              <span className="text-slate-500 italic">No &lt;meta name="description"&gt; tag found</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer strictly meeting Requirement #3 */}
      <footer className="relative z-10 border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Page Pulse &copy; {new Date().getFullYear()}</span>
          <p>
            <a
              href="https://digitalheroesco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 underline underline-offset-4 transition-colors duration-200 inline-flex items-center gap-1"
            >
              Built for Digital Heroes Training Task
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
