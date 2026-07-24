'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Terminal,
  Cpu
} from 'lucide-react';

interface AuditResult {
  statusCode: number;
  responseTimeMs: number;
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  imagesMissingAltCount: number;
  wordCount: number;
}

const MOCK_PREVIEWS = [
  {
    url: 'https://vercel.com',
    status: 200,
    time: 124,
    h1: 1,
    missingAlt: 0,
    words: 1420,
    title: 'Vercel: Build and deploy the best web experiences',
    meta: 'Vercel’s frontend cloud gives developers frameworks, workflows, and infrastructure to build a faster Web.',
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
  {
    url: 'https://digitalheroesco.com',
    status: 200,
    time: 88,
    h1: 1,
    missingAlt: 0,
    words: 950,
    title: 'Digital Heroes - Training & Engineering Excellence',
    meta: 'Empowering digital leaders and engineers with high performance tools and training.',
  },
];

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusErrCode, setStatusErrCode] = useState<number | null>(null);

  // Parallax tilt state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Simulated typing background animation state
  const [typedUrl, setTypedUrl] = useState('');
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isTypingFinished, setIsTypingFinished] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Typing simulator loop
  useEffect(() => {
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const currentMock = MOCK_PREVIEWS[activePreviewIndex];

    const typeStep = () => {
      const targetText = currentMock.url;

      if (!isDeleting) {
        setTypedUrl(targetText.substring(0, charIndex + 1));
        charIndex++;

        if (charIndex === targetText.length) {
          setIsTypingFinished(true);
          // Pause when URL is fully typed to display mock result
          timeoutId = setTimeout(() => {
            isDeleting = true;
            setIsTypingFinished(false);
            typeStep();
          }, 4500);
          return;
        }
      } else {
        setTypedUrl(targetText.substring(0, charIndex - 1));
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          setActivePreviewIndex((prev) => (prev + 1) % MOCK_PREVIEWS.length);
          timeoutId = setTimeout(typeStep, 600);
          return;
        }
      }

      const speed = isDeleting ? 30 : 60 + Math.random() * 40;
      timeoutId = setTimeout(typeStep, speed);
    };

    timeoutId = setTimeout(typeStep, 800);

    return () => clearTimeout(timeoutId);
  }, [activePreviewIndex]);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setStatusErrCode(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusErrCode(res.status);
        setError(data.error || 'An unexpected error occurred while analyzing the target URL.');
      } else {
        setResult(data);
      }
    } catch {
      setStatusErrCode(500);
      setError('Client-side failure. Could not communicate with Page Pulse audit service.');
    } finally {
      setLoading(false);
    }
  };

  const currentMock = MOCK_PREVIEWS[activePreviewIndex];

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black font-sans relative overflow-hidden [perspective:1000px]">
      {/* Dynamic Cyberpunk Ambient Animated Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow [animation-delay:2s]" />
      <div className="absolute top-[30%] right-[15%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-float-slow" />

      {/* Subtle Terminal Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* 3D Parallax Simulated Background Window */}
      <div
        className="absolute inset-0 pointer-events-none flex items-end sm:items-center justify-start z-0 opacity-15 sm:opacity-20 transition-transform duration-300 ease-out p-4 sm:p-12 md:pl-20 md:pt-44"
        style={{
          transform: `rotateY(${mousePos.x * 10 - 4}deg) rotateX(${-mousePos.y * 10 + 4}deg) translateY(60px) translateX(-40px) translateZ(-100px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="w-[90%] max-w-2xl bg-[#0a0f1d]/90 border border-cyan-500/20 rounded-2xl p-5 backdrop-blur-3xl shadow-[0_0_60px_rgba(6,182,212,0.15)] space-y-4">
          {/* Mock Browser Header */}
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-cyan-300 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>{typedUrl}</span>
              <span className="w-1.5 h-4 bg-cyan-400 animate-pulse" />
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400 animate-spin" />
              <span>Live Simulation</span>
            </div>
          </div>

          {/* Mock Analytics Cards Grid inside background */}
          <div className="grid grid-cols-4 gap-3 opacity-90">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 font-mono">
              <div className="text-[10px] text-slate-500">HTTP STATUS</div>
              <div className="text-lg font-bold text-emerald-400">{currentMock.status} OK</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 font-mono">
              <div className="text-[10px] text-slate-500">LATENCY</div>
              <div className="text-lg font-bold text-cyan-400">{currentMock.time} ms</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 font-mono">
              <div className="text-[10px] text-slate-500">H1 TAGS</div>
              <div className="text-lg font-bold text-indigo-400">{currentMock.h1} Optimal</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 font-mono">
              <div className="text-[10px] text-slate-500">BODY WORDS</div>
              <div className="text-lg font-bold text-white">{currentMock.words}</div>
            </div>
          </div>

          {/* Mock Result Preview */}
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/60 font-mono text-xs space-y-2">
            <div className="text-cyan-400 font-semibold truncate">&gt; {currentMock.title}</div>
            <div className="text-slate-400 line-clamp-2">{currentMock.meta}</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-12 sm:py-16 flex-1 w-full">
        {/* Header Section */}
        <header className="text-center space-y-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-wider uppercase backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:border-cyan-400/50 transition-all duration-300">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Web Page Auditor</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight py-1">
            <span className="animate-shimmer">Page Pulse</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Audit websites instantly for response time, title & meta tag health, missing image alt attributes, and structural SEO metrics.
          </p>
        </header>

        {/* Input Form */}
        <form onSubmit={handleAudit} className="mb-12 max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-500 group-hover:duration-200"></div>
            
            <div className="relative flex flex-col sm:flex-row items-center bg-[#0d121d]/90 backdrop-blur-xl border border-slate-800 rounded-xl p-2 shadow-2xl transition duration-300 group-hover:border-slate-700">
              <div className="flex items-center pl-3 w-full sm:w-auto">
                <Search className="w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full sm:w-80 bg-transparent px-3 py-2.5 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-black" />
                    <span>Auditing...</span>
                  </>
                ) : (
                  <>
                    <span>Run Audit</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-10 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 backdrop-blur-md flex items-start gap-3 shadow-[0_0_25px_rgba(239,68,68,0.15)] animate-in fade-in slide-in-from-bottom-3 duration-300">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-bounce" />
            <div className="space-y-1">
              <div className="font-mono text-xs font-semibold text-red-400 uppercase tracking-wider">
                Error Response {statusErrCode ? `[HTTP ${statusErrCode}]` : ''}
              </div>
              <p className="text-sm font-sans">{error}</p>
            </div>
          </div>
        )}

        {/* Audit Results Dashboard */}
        {result && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Status Code */}
              <div className="p-5 rounded-xl bg-[#0d121d]/80 border border-slate-800/80 backdrop-blur-xl shadow-lg hover:border-slate-700 hover:scale-[1.02] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">HTTP Status</span>
                  <ShieldCheck className={`w-4 h-4 transition-transform group-hover:scale-110 ${result.statusCode >= 200 && result.statusCode < 300 ? 'text-emerald-400' : 'text-amber-400'}`} />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-white">{result.statusCode}</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {result.statusCode >= 200 && result.statusCode < 300 ? 'OK' : 'Response'}
                  </span>
                </div>
              </div>

              {/* Response Time */}
              <div className="p-5 rounded-xl bg-[#0d121d]/80 border border-slate-800/80 backdrop-blur-xl shadow-lg hover:border-slate-700 hover:scale-[1.02] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Latency</span>
                  <Clock className="w-4 h-4 text-cyan-400 transition-transform group-hover:scale-110" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-cyan-400">{result.responseTimeMs}</span>
                  <span className="text-xs text-slate-400 font-mono">ms</span>
                </div>
              </div>

              {/* H1 Count */}
              <div className="p-5 rounded-xl bg-[#0d121d]/80 border border-slate-800/80 backdrop-blur-xl shadow-lg hover:border-slate-700 hover:scale-[1.02] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">H1 Tags</span>
                  <Heading className="w-4 h-4 text-indigo-400 transition-transform group-hover:scale-110" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-white">{result.h1Count}</span>
                  <span className="text-xs text-slate-400">
                    {result.h1Count === 1 ? 'Optimal' : result.h1Count === 0 ? 'Missing' : 'Multiple'}
                  </span>
                </div>
              </div>

              {/* Missing Alt Images */}
              <div className="p-5 rounded-xl bg-[#0d121d]/80 border border-slate-800/80 backdrop-blur-xl shadow-lg hover:border-slate-700 hover:scale-[1.02] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Missing Alt</span>
                  <ImageIcon className={`w-4 h-4 transition-transform group-hover:scale-110 ${result.imagesMissingAltCount === 0 ? 'text-emerald-400' : 'text-amber-400'}`} />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold font-mono ${result.imagesMissingAltCount === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {result.imagesMissingAltCount}
                  </span>
                  <span className="text-xs text-slate-400">images</span>
                </div>
              </div>
            </div>

            {/* Detailed Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Page Title & Word Count Card */}
              <div className="p-6 rounded-xl bg-[#0d121d]/80 border border-slate-800/80 backdrop-blur-xl space-y-4 hover:border-slate-700 transition-all duration-300">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-mono font-semibold text-slate-200 uppercase tracking-wider">Page Identification</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-mono text-slate-500 uppercase">Document Title</label>
                    <p className="text-sm font-medium text-slate-100 bg-slate-900/60 p-3 rounded-lg border border-slate-800/60 mt-1 font-mono break-all leading-snug">
                      {result.title ? result.title : <span className="text-slate-500 italic">No &lt;title&gt; element detected</span>}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Approximate Body Word Count:</span>
                    <span className="font-mono font-semibold text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-500/20 text-xs inline-flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      {result.wordCount.toLocaleString()} words
                    </span>
                  </div>
                </div>
              </div>

              {/* Meta Description Card */}
              <div className="p-6 rounded-xl bg-[#0d121d]/80 border border-slate-800/80 backdrop-blur-xl space-y-4 hover:border-slate-700 transition-all duration-300">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <FileCode2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-mono font-semibold text-slate-200 uppercase tracking-wider">SEO Metadata</h3>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-500 uppercase">Meta Description</label>
                  <p className="text-sm font-medium text-slate-200 bg-slate-900/60 p-3 rounded-lg border border-slate-800/60 mt-1 font-sans leading-relaxed break-words min-h-[90px]">
                    {result.metaDescription ? (
                      result.metaDescription
                    ) : (
                      <span className="text-slate-500 italic">No &lt;meta name="description"&gt; tag found</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
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
