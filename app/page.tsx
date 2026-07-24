'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  ArrowRight, 
  Sparkles, 
  ExternalLink,
  Download,
  Layers,
  BarChart3,
  Terminal,
  Cpu,
  Clock,
  ShieldCheck,
  Heading,
  Image as ImageIcon
} from 'lucide-react';

const MOCK_SAMPLES = [
  {
    url: 'https://digitalheroesco.com',
    status: 200,
    time: 88,
    h1: 1,
    missingAlt: 0,
    words: 950,
    title: 'Digital Heroes — Training & Engineering Excellence',
    meta: 'Empowering digital leaders and engineers with high performance tools and training.',
  },
  {
    url: 'https://vercel.com',
    status: 200,
    time: 124,
    h1: 1,
    missingAlt: 0,
    words: 1420,
    title: 'Vercel: Build and deploy the best web experiences',
    meta: 'Vercel’s frontend cloud gives developers frameworks, workflows, and infrastructure.',
  },
  {
    url: 'https://github.com',
    status: 200,
    time: 210,
    h1: 1,
    missingAlt: 2,
    words: 2310,
    title: 'GitHub: Let’s build from here',
    meta: 'GitHub is where over 100 million developers shape the future of software, together.',
  },
];

export default function Home() {
  // Simulated auto-typing advertisement demo state
  const [typedUrl, setTypedUrl] = useState('');
  const [sampleIdx, setSampleIdx] = useState(0);

  useEffect(() => {
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const currentSample = MOCK_SAMPLES[sampleIdx];

    const typeStep = () => {
      const targetText = currentSample.url;

      if (!isDeleting) {
        setTypedUrl(targetText.substring(0, charIndex + 1));
        charIndex++;

        if (charIndex === targetText.length) {
          // Pause when URL is fully typed to showcase the result cards
          timeoutId = setTimeout(() => {
            isDeleting = true;
            typeStep();
          }, 3500);
          return;
        }
      } else {
        setTypedUrl(targetText.substring(0, charIndex - 1));
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          setSampleIdx((prev) => (prev + 1) % MOCK_SAMPLES.length);
          timeoutId = setTimeout(typeStep, 500);
          return;
        }
      }

      const speed = isDeleting ? 25 : 55 + Math.random() * 35;
      timeoutId = setTimeout(typeStep, speed);
    };

    timeoutId = setTimeout(typeStep, 600);

    return () => clearTimeout(timeoutId);
  }, [sampleIdx]);

  const currentSample = MOCK_SAMPLES[sampleIdx];

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black font-sans relative overflow-hidden">
      {/* Ambient Cyberpunk Lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow [animation-delay:2s]" />

      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 max-w-6xl mx-auto px-4 py-6 w-full flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
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
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 text-center flex-1 flex flex-col items-center justify-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-wider uppercase backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)] mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Next-Gen Multi-URL Web Auditor</span>
        </div>

        {/* Animated Headline */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          Audit Web Performance <br />
          <span className="animate-shimmer">& SEO at Scale</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
          Run simultaneous audits on multiple URLs, analyze latency, missing alt tags, HTML structure, and export comprehensive PDF reports instantly.
        </p>

        {/* CTA Get Started Button */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold text-base transition-all duration-200 inline-flex items-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] active:scale-[0.98]"
          >
            <span>Get Started with Page Pulse</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Interactive Mock Advertisement Showcase */}
        <div className="w-full max-w-3xl mb-14 text-left animate-in fade-in slide-in-from-bottom-7 duration-1000">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>

            <div className="relative bg-[#0d121d]/90 border border-cyan-500/30 rounded-2xl p-5 sm:p-6 backdrop-blur-2xl shadow-2xl space-y-5">
              {/* Simulated Browser Header */}
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 font-mono text-xs text-cyan-300 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{typedUrl}</span>
                  <span className="w-1.5 h-4 bg-cyan-400 animate-pulse shrink-0" />
                </div>
              </div>

              {/* Simulated Results Preview */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span>STATUS</span>
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="text-base font-bold text-emerald-400">{currentSample.status} OK</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span>LATENCY</span>
                      <Clock className="w-3 h-3 text-cyan-400" />
                    </div>
                    <div className="text-base font-bold text-cyan-400">{currentSample.time} ms</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span>H1 TAGS</span>
                      <Heading className="w-3 h-3 text-indigo-400" />
                    </div>
                    <div className="text-base font-bold text-white">{currentSample.h1} Tag</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span>ALT MISSING</span>
                      <ImageIcon className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="text-base font-bold text-amber-400">{currentSample.missingAlt} Img</div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 font-mono">
                  <div className="text-xs font-bold text-slate-200 truncate">{currentSample.title}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 font-sans">{currentSample.meta}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="p-6 rounded-xl bg-[#0d121d]/80 border border-slate-800 backdrop-blur-xl hover:border-slate-700 hover:scale-[1.02] transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Simultaneous Multi-Audit</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Batch audit multiple URLs in parallel and analyze side-by-side performance metrics.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#0d121d]/80 border border-slate-800 backdrop-blur-xl hover:border-slate-700 hover:scale-[1.02] transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">PDF Report Export</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate clean, formatted PDF reports of individual URL audits with a single click.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#0d121d]/80 border border-slate-800 backdrop-blur-xl hover:border-slate-700 hover:scale-[1.02] transition-all duration-300">
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
