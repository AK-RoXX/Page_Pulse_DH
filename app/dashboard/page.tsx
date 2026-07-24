'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  AlertTriangle,
  Clock,
  FileText,
  Heading,
  Image as ImageIcon,
  FileCode2,
  ExternalLink,
  ShieldCheck,
  Activity,
  Download,
  Plus,
  Trash2,
  History,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  XCircle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import type { AuditMetrics } from '@/lib/parser';

// ─── Types ───────────────────────────────────────────────────────────────────

type AuditStatus = 'idle' | 'loading' | 'success' | 'error';

interface AuditItem {
  id: string;
  url: string;
  timestamp: string;
  status: AuditStatus;
  result?: AuditMetrics;
  error?: string;
  statusErrCode?: number;
}

// ─── HTTP error explanations ──────────────────────────────────────────────────

const HTTP_ERROR_HINTS: Record<number, string> = {
  400: 'The URL format is invalid or the request was malformed.',
  422: 'The target page returned non-HTML content (e.g. JSON or binary).',
  502: 'Network failure — the server could not be reached. Check the URL.',
  504: 'Audit timed out after 8 seconds. The target server may be slow or offline.',
  500: 'Internal client error. Please try again.',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [urlInputs, setUrlInputs] = useState<string[]>(['']);
  const [audits, setAudits] = useState<AuditItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // ── Persistence ─────────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const saved = localStorage.getItem('page_pulse_history');
      if (saved) {
        const parsed: AuditItem[] = JSON.parse(saved);
        setAudits(parsed);
        if (parsed.length > 0) setActiveTabId(parsed[0].id);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  useEffect(() => {
    try {
      // Always persist — including empty array so "Clear History" propagates
      localStorage.setItem('page_pulse_history', JSON.stringify(audits));
    } catch {
      // Ignore storage errors
    }
  }, [audits]);

  // ── URL Input Handlers ───────────────────────────────────────────────────────

  const handleAddInput = () => setUrlInputs((prev) => [...prev, '']);

  const handleRemoveInput = (index: number) => {
    if (urlInputs.length > 1) {
      setUrlInputs((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleInputChange = (index: number, value: string) => {
    setUrlInputs((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // ── Audit Runner ─────────────────────────────────────────────────────────────

  const runAudits = async (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = urlInputs.map((u) => u.trim()).filter(Boolean);
    if (validUrls.length === 0) return;

    const newItems: AuditItem[] = validUrls.map((url) => ({
      id: Math.random().toString(36).substring(2, 9),
      url,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'loading' as AuditStatus,
    }));

    setAudits((prev) => [...newItems, ...prev]);
    setActiveTabId(newItems[0].id);

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
                  status: 'error' as AuditStatus,
                  statusErrCode: res.status,
                  error: data.error ?? 'An unexpected error occurred.',
                };
              }
              return { ...a, status: 'success' as AuditStatus, result: data as AuditMetrics };
            })
          );
        } catch {
          setAudits((prev) =>
            prev.map((a) =>
              a.id === item.id
                ? {
                    ...a,
                    status: 'error' as AuditStatus,
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

  // ── History ───────────────────────────────────────────────────────────────────

  const clearHistory = () => {
    setAudits([]);
    setActiveTabId(null);
  };

  // ── PDF Export ────────────────────────────────────────────────────────────────

  const downloadPdfReport = async () => {
    if (!activeAudit?.result) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const r = activeAudit.result;
      const cleanUrl = activeAudit.url;

      // Background
      doc.setFillColor(13, 18, 29);
      doc.rect(0, 0, 595.28, 841.89, 'F');

      // Header
      doc.setTextColor(6, 182, 212);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('Page Pulse — Audit Report', 40, 50);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 68);

      // URL box
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(40, 82, 515, 42, 6, 6, 'F');
      doc.setDrawColor(30, 41, 59);
      doc.roundedRect(40, 82, 515, 42, 6, 6, 'D');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('TARGET URL', 52, 98);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(56, 189, 248);
      doc.text(cleanUrl.length > 65 ? cleanUrl.substring(0, 62) + '...' : cleanUrl, 52, 114);

      // Metric cards
      const metrics = [
        { label: 'HTTP STATUS', val: `${r.statusCode}`, sub: r.statusCode < 400 ? 'OK' : 'Error', color: r.statusCode < 400 ? [16, 185, 129] : [245, 158, 11] },
        { label: 'LATENCY', val: `${r.responseTimeMs} ms`, sub: 'Response Time', color: [6, 182, 212] },
        { label: 'H1 TAGS', val: `${r.h1Count}`, sub: r.h1Count === 1 ? 'Optimal' : r.h1Count === 0 ? 'Missing' : 'Multiple', color: [129, 140, 248] },
        { label: 'MISSING ALT', val: `${r.imagesMissingAltCount}`, sub: 'Images', color: r.imagesMissingAltCount === 0 ? [16, 185, 129] : [245, 158, 11] },
      ];

      const cY = 142, cW = 120, cH = 68, cGap = 11.5;
      metrics.forEach((m, idx) => {
        const cx = 40 + idx * (cW + cGap);
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(cx, cY, cW, cH, 6, 6, 'F');
        doc.setDrawColor(30, 41, 59);
        doc.roundedRect(cx, cY, cW, cH, 6, 6, 'D');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(m.label, cx + 10, cY + 18);
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(m.color[0], m.color[1], m.color[2]);
        doc.text(m.val, cx + 10, cY + 42);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(m.sub, cx + 10, cY + 56);
      });

      // Page Identification
      const s1 = 230;
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(40, s1, 515, 110, 8, 8, 'F');
      doc.setDrawColor(30, 41, 59);
      doc.roundedRect(40, s1, 515, 110, 8, 8, 'D');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(226, 232, 240);
      doc.text('PAGE IDENTIFICATION & WORD COUNT', 55, s1 + 24);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('DOCUMENT TITLE:', 55, s1 + 42);
      doc.setFontSize(10);
      doc.setTextColor(241, 245, 249);
      doc.text(doc.splitTextToSize(r.title ?? 'No <title> element detected', 485), 55, s1 + 57);
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Body Word Count: ${r.wordCount.toLocaleString()} words`, 55, s1 + 95);

      // SEO Metadata
      const s2 = 358;
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(40, s2, 515, 135, 8, 8, 'F');
      doc.setDrawColor(30, 41, 59);
      doc.roundedRect(40, s2, 515, 135, 8, 8, 'D');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(226, 232, 240);
      doc.text('SEO METADATA ANALYSIS', 55, s2 + 24);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('META DESCRIPTION:', 55, s2 + 42);
      doc.setFontSize(9.5);
      doc.setTextColor(226, 232, 240);
      const metaText = r.metaDescription ?? 'No <meta name="description"> tag found.';
      doc.text(doc.splitTextToSize(metaText, 485), 55, s2 + 60);

      // Footer
      doc.setDrawColor(30, 41, 59);
      doc.line(40, 790, 555, 790);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Page Pulse Audit System', 40, 805);
      doc.text('Built for Digital Heroes Training Task — https://digitalheroesco.com', 220, 805);

      doc.save(`page-pulse-${cleanUrl.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to generate PDF report.');
    } finally {
      setIsExporting(false);
    }
  };

  const activeAudit = audits.find((a) => a.id === activeTabId) ?? audits[0];
  const validUrlCount = urlInputs.filter((u) => u.trim()).length || 1;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#06080e]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span className="font-bold font-mono text-lg text-white">Page Pulse</span>
            <span className="text-slate-500 font-mono text-sm">/</span>
            <span className="text-slate-400 font-mono text-sm">Dashboard</span>
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

      {/* Main */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8">

        {/* Multi-URL Input */}
        <section className="bg-[#0d121d]/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2 text-slate-200 font-mono text-sm font-semibold">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>URL Auditor</span>
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

          <form onSubmit={runAudits} className="space-y-3">
            {urlInputs.map((inputUrl, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`https://example${idx > 0 ? `-${idx + 1}` : ''}.com`}
                  value={inputUrl}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  required={idx === 0}
                />
                {urlInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveInput(idx)}
                    aria-label="Remove URL"
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.99]"
            >
              <Zap className="w-4 h-4 text-black fill-black" />
              <span>Run Audit{validUrlCount > 1 ? `s (${validUrlCount})` : ''}</span>
            </button>
          </form>
        </section>

        {/* Results Section */}
        {audits.length > 0 && (
          <section className="space-y-5">
            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 pr-2 shrink-0">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>Recent ({audits.length}):</span>
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
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {item.status === 'loading' && <Activity className="w-3 h-3 animate-spin text-cyan-400" />}
                    {item.status === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {item.status === 'error' && <XCircle className="w-3 h-3 text-red-400" />}
                    <span className="truncate max-w-[160px]">{item.url}</span>
                    {item.status === 'error' && item.statusErrCode && (
                      <span className="ml-0.5 px-1 py-0.5 text-[10px] rounded bg-red-900/60 text-red-300 font-mono">
                        {item.statusErrCode}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Audit Result */}
            {activeAudit && (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Result header bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d121d]/80 border border-slate-800/80 p-4 rounded-xl backdrop-blur-xl">
                  <div className="min-w-0">
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Target URL</span>
                    <h2 className="text-lg font-bold font-mono text-cyan-300 truncate">
                      {activeAudit.url}
                    </h2>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      Audited at {activeAudit.timestamp}
                      {activeAudit.status === 'success' && (
                        <span className="ml-2 text-emerald-400">✓ Success</span>
                      )}
                      {activeAudit.status === 'error' && (
                        <span className="ml-2 text-red-400">
                          ✗ Failed
                          {activeAudit.statusErrCode ? ` — HTTP ${activeAudit.statusErrCode}` : ''}
                        </span>
                      )}
                      {activeAudit.status === 'loading' && (
                        <span className="ml-2 text-cyan-400">· Auditing…</span>
                      )}
                    </p>
                  </div>

                  {activeAudit.status === 'success' && activeAudit.result && (
                    <button
                      onClick={downloadPdfReport}
                      disabled={isExporting}
                      className="shrink-0 px-4 py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-xs hover:bg-emerald-900/50 hover:border-emerald-400 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50"
                    >
                      {isExporting ? (
                        <Activity className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>{isExporting ? 'Generating PDF…' : 'Download PDF Report'}</span>
                    </button>
                  )}
                </div>

                {/* Loading */}
                {activeAudit.status === 'loading' && (
                  <div className="p-12 text-center rounded-2xl bg-[#0d121d]/60 border border-slate-800/60 space-y-4">
                    <Activity className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                    <p className="text-sm font-mono text-slate-300">Executing automated URL audit…</p>
                    <p className="text-xs font-mono text-slate-500">Fetching {activeAudit.url}</p>
                  </div>
                )}

                {/* Error */}
                {activeAudit.status === 'error' && (
                  <div className="rounded-xl bg-red-950/30 border border-red-500/40 text-red-200 backdrop-blur-md overflow-hidden shadow-[0_0_25px_rgba(239,68,68,0.12)]">
                    {/* Error title bar */}
                    <div className="flex items-center gap-3 px-5 py-3 bg-red-950/50 border-b border-red-500/30">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="font-mono text-xs font-semibold text-red-300 uppercase tracking-widest">
                        Audit Failed
                        {activeAudit.statusErrCode ? ` — HTTP ${activeAudit.statusErrCode}` : ''}
                      </span>
                    </div>

                    {/* Error body */}
                    <div className="px-5 py-4 space-y-3">
                      <p className="text-sm text-red-200 font-sans">{activeAudit.error}</p>

                      {activeAudit.statusErrCode && HTTP_ERROR_HINTS[activeAudit.statusErrCode] && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/50 border border-red-800/40">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-800/60 text-red-300 shrink-0 mt-0.5">
                            HINT
                          </span>
                          <p className="text-xs text-red-300 font-sans">
                            {HTTP_ERROR_HINTS[activeAudit.statusErrCode]}
                          </p>
                        </div>
                      )}

                      <p className="text-[11px] font-mono text-red-500">
                        URL: {activeAudit.url} · {activeAudit.timestamp}
                      </p>
                    </div>
                  </div>
                )}

                {/* Success — Metrics Dashboard */}
                {activeAudit.status === 'success' && activeAudit.result && (
                  <div className="p-6 bg-[#0d121d] border border-slate-800 rounded-2xl space-y-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* HTTP Status */}
                      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:scale-[1.01] transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-slate-400 uppercase">HTTP Status</span>
                          <ShieldCheck className={`w-4 h-4 ${activeAudit.result.statusCode < 400 ? 'text-emerald-400' : 'text-amber-400'}`} />
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold font-mono text-white">{activeAudit.result.statusCode}</span>
                          <span className="text-xs text-slate-400 font-mono">
                            {activeAudit.result.statusCode < 400 ? 'OK' : 'Error'}
                          </span>
                        </div>
                      </div>

                      {/* Latency */}
                      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:scale-[1.01] transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-slate-400 uppercase">Latency</span>
                          <Clock className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold font-mono text-cyan-400">{activeAudit.result.responseTimeMs}</span>
                          <span className="text-xs text-slate-400 font-mono">ms</span>
                        </div>
                      </div>

                      {/* H1 Tags */}
                      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:scale-[1.01] transition-all duration-200">
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

                      {/* Missing Alt */}
                      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:scale-[1.01] transition-all duration-200">
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

                    {/* Detail Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Title + Word Count */}
                      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <h3 className="text-sm font-mono font-semibold text-slate-200 uppercase">Page Identification</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-mono text-slate-500 uppercase">Document Title</label>
                            <p className="text-sm font-medium text-slate-100 bg-slate-950 p-3 rounded-lg border border-slate-800 mt-1 font-mono break-all leading-snug">
                              {activeAudit.result.title ?? <span className="text-slate-500 italic">No &lt;title&gt; element detected</span>}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-mono text-slate-400">Body Word Count:</span>
                            <span className="font-mono font-semibold text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-500/20 text-xs inline-flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" />
                              {activeAudit.result.wordCount.toLocaleString()} words
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Meta Description */}
                      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                          <FileCode2 className="w-4 h-4 text-emerald-400" />
                          <h3 className="text-sm font-mono font-semibold text-slate-200 uppercase">SEO Metadata</h3>
                        </div>
                        <div>
                          <label className="text-xs font-mono text-slate-500 uppercase">Meta Description</label>
                          <p className="text-sm font-medium text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800 mt-1 font-sans leading-relaxed break-words min-h-[90px]">
                            {activeAudit.result.metaDescription ?? (
                              <span className="text-slate-500 italic">No &lt;meta name=&quot;description&quot;&gt; tag found</span>
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

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-5 text-xs text-slate-500 font-mono shrink-0">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Page Pulse &copy; {new Date().getFullYear()}</span>
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 underline underline-offset-4 transition-colors inline-flex items-center gap-1"
          >
            Built for Digital Heroes Training Task
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}
