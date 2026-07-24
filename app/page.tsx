'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  ArrowRight, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Clock,
  FileSearch,
  Download,
  Layers,
  BarChart3
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black font-sans relative overflow-hidden">
      {/* Ambient Cyberpunk Lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow [animation-delay:2s]" />

      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 max-w-6xl mx-auto px-4 py-6 w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-cyan-400" />
          <span className="font-bold font-mono text-xl tracking-tight text-white">Page Pulse</span>
        </div>

        <Link
          href="/dashboard"
          className="px-5 py-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-mono text-xs hover:border-cyan-400 transition-all duration-200 flex items-center gap-2"
        >
          <span>Open Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-16 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-wider uppercase backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)] mb-6">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Next-Gen Multi-URL Web Auditor</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight mb-6">
          Audit Web Performance <br />
          <span className="animate-shimmer">& SEO at Scale</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          Run simultaneous audits on multiple URLs, analyze latency, missing alt tags, HTML structure, and export comprehensive PDF reports instantly.
        </p>

        {/* CTA Get Started Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold text-base transition-all duration-200 flex items-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] active:scale-[0.98]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left max-w-4xl">
          <div className="p-6 rounded-xl bg-[#0d121d]/80 border border-slate-800 backdrop-blur-xl hover:border-slate-700 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Simultaneous Multi-Audit</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Batch audit multiple URLs in parallel and analyze side-by-side performance metrics.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#0d121d]/80 border border-slate-800 backdrop-blur-xl hover:border-slate-700 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">PDF Report Export</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate clean, formatted PDF reports of individual URL audits with a single click.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#0d121d]/80 border border-slate-800 backdrop-blur-xl hover:border-slate-700 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Recent Audits History</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Automatically track and revisit previous audit sessions stored in your dashboard.
            </p>
          </div>
        </div>
      </main>

      {/* Footer strictly meeting Requirement #3 */}
      <footer className="relative z-10 border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
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
