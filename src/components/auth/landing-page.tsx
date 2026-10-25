"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  BookOpen,
  Sparkles,
  Network,
  Layers,
  ArrowRight,
  GraduationCap,
  Search,
  Quote,
  Atom,
  Building2,
  Globe,
  Zap,
  Shield,
  FileText,
  Headphones,
  CheckCircle2,
} from "lucide-react";

/* ─────────────── Marquee CSS (injected inline for isolation) ─────────────── */
const marqueeCSS = `
@keyframes lp-marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}
.lp-marquee-strip {
  display: flex;
  width: 200%;
  animation: lp-marquee 32s linear infinite;
}
.lp-marquee-strip:hover {
  animation-play-state: paused;
}
`;

/* ─────────────── Grid Pattern CSS ─────────────── */
const gridCSS = `
.lp-grid-bg {
  background-size: 36px 36px;
  background-image:
    linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px);
}
.dark .lp-grid-bg {
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px);
}
`;

const INSTITUTIONS = [
  { name: "Oxford Institute of Sciences", icon: GraduationCap },
  { name: "Cambridge Quantum Lab", icon: Atom },
  { name: "Stanford Neural Systems", icon: Network },
  { name: "MIT BioArchival", icon: Sparkles },
  { name: "ETH Zurich Research Foundation", icon: Building2 },
  { name: "Sorbonne Digital Codex", icon: BookOpen },
];

export function LandingPage() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#080d1a] text-slate-800 dark:text-[#dee2f5] antialiased overflow-x-hidden font-sans selection:bg-indigo-500/30 selection:text-white transition-colors duration-300">
      {/* Injected styles */}
      <style dangerouslySetInnerHTML={{ __html: marqueeCSS + gridCSS }} />

      {/* ── Ambient Glow Effects ── */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.12)_0%,_rgba(79,70,229,0.04)_45%,_transparent_75%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.18)_0%,_rgba(79,70,229,0.06)_45%,_transparent_75%)] blur-3xl z-0" />
      <div className="pointer-events-none fixed -top-40 right-[-100px] w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(133,130,255,0.05)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle,_rgba(133,130,255,0.08)_0%,_transparent_70%)] blur-2xl z-0" />

      {/* ── Background Grid ── */}
      <div className="fixed inset-0 lp-grid-bg pointer-events-none opacity-80 z-0" />

      {/* ═══════════════════════════════════════════════════
          FLOATING CAPSULE HEADER
      ═══════════════════════════════════════════════════ */}
      <header className="sticky top-5 z-50 px-4 w-full">
        <div className="max-w-5xl mx-auto rounded-full bg-white/80 dark:bg-[#161b29]/80 backdrop-blur-xl border border-slate-200/80 dark:border-[#464554]/30 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-4 md:px-6 py-2.5 flex items-center justify-between transition-all duration-300 hover:border-slate-300 dark:hover:border-[#464554]/60">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-[#f8fafc] group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
              LibrisAI
            </span>
            <span className="hidden sm:inline text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1a1f2d] border border-slate-200 dark:border-[#464554]/40 text-indigo-700 dark:text-indigo-300 font-mono">
              Academic v2.4
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-[13px] font-medium text-slate-600 hover:text-slate-900 dark:text-[#908fa0] dark:hover:text-[#f8fafc] transition-colors">
              Repository
            </a>
            <a href="#how-it-works" className="text-[13px] font-medium text-slate-600 hover:text-slate-900 dark:text-[#908fa0] dark:hover:text-[#f8fafc] transition-colors">
              Neural Index
            </a>
            <a href="#institutions" className="text-[13px] font-medium text-slate-600 hover:text-slate-900 dark:text-[#908fa0] dark:hover:text-[#f8fafc] transition-colors">
              Institutions
            </a>
          </nav>

          {/* CTA Buttons & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center rounded-full bg-slate-100 dark:bg-[#1a1f2d] border border-slate-200 dark:border-[#464554]/40 p-0.5 shadow-sm">
              <ThemeToggle className="h-7 w-7 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white" />
            </div>

            {user ? (
              <Link
                href="/"
                className="text-[13px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.35)] flex items-center gap-1.5 transition-all"
              >
                <span>Enter Catalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[13px] font-medium text-slate-600 hover:text-slate-900 dark:text-[#908fa0] dark:hover:text-[#f8fafc] px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-[13px] font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#7577f8] hover:to-[#5a52f2] px-4 py-2 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_26px_rgba(99,102,241,0.55)] transition-all duration-200 active:scale-[0.98] flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════ */}
      <main className="relative z-10 pt-10 md:pt-16 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#161b29]/90 border border-slate-200 dark:border-[#464554]/40 shadow-sm mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 dark:bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-400" />
            </span>
            <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 tracking-wide uppercase">
              Introducing Neural Knowledge Synthesis
            </span>
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-300" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-[64px] font-bold tracking-[-0.03em] leading-[1.1] text-slate-900 dark:text-[#f8fafc] mb-4">
            The Future of{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#818CF8] dark:from-[#818CF8] dark:via-[#A5B4FC] dark:to-[#C7D2FE]">
              Academic Research
            </span>{" "}
            Starts Here
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-slate-600 dark:text-[#908fa0] max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered scholarly repository indexing over 2.4M+ peer-reviewed articles, doctoral dissertations, and preprint archives with verified citation lineages.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            {user ? (
              <>
                <Link
                  href="/"
                  className="w-full sm:w-auto text-[13px] font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#7173fa] hover:to-[#574ff0] px-7 py-3 rounded-full shadow-[0_0_28px_rgba(99,102,241,0.45)] hover:shadow-[0_0_36px_rgba(99,102,241,0.65)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Enter Monograph Catalog
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className="w-full sm:w-auto text-[13px] font-medium text-slate-700 dark:text-[#f8fafc] bg-white dark:bg-[#161b29]/70 hover:bg-slate-50 dark:hover:bg-[#1a1f2d]/70 border border-slate-200 dark:border-[#464554]/30 hover:border-slate-300 dark:hover:border-[#464554]/60 px-6 py-3 rounded-full backdrop-blur-md transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Shield className="h-4 w-4 text-slate-500 dark:text-[#908fa0]" />
                  {isAdmin ? "Admin Console" : "Research Workspace"}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto text-[13px] font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#7173fa] hover:to-[#574ff0] px-7 py-3 rounded-full shadow-[0_0_28px_rgba(99,102,241,0.45)] hover:shadow-[0_0_36px_rgba(99,102,241,0.65)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Start Exploring
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto text-[13px] font-medium text-slate-700 dark:text-[#f8fafc] bg-white dark:bg-[#161b29]/70 hover:bg-slate-50 dark:hover:bg-[#1a1f2d]/70 border border-slate-200 dark:border-[#464554]/30 hover:border-slate-300 dark:hover:border-[#464554]/60 px-6 py-3 rounded-full backdrop-blur-md transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Shield className="h-4 w-4 text-slate-500 dark:text-[#908fa0]" />
                  Access Portal
                </Link>
              </>
            )}
          </div>

          {/* ── 3 Stat Cards ── */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stat 1 */}
            <div className="p-6 rounded-xl bg-white/85 dark:bg-[#161b29]/60 backdrop-blur-xl border border-slate-200/90 dark:border-[#464554]/30 hover:border-indigo-500/40 transition-all duration-200 text-left relative overflow-hidden group shadow-md dark:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-100 dark:border-transparent">
                  <FileText className="h-3 w-3" />
                  Repository
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-[#908fa0] flex items-center gap-1">
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">+18k</span> this week
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-[#f8fafc] mb-1">2.4M+</div>
              <div className="text-xs text-slate-600 dark:text-[#908fa0]">Peer-Reviewed Articles &amp; Syntheses</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent group-hover:via-indigo-500/80 transition-all" />
            </div>

            {/* Stat 2 */}
            <div className="p-6 rounded-xl bg-white/85 dark:bg-[#161b29]/60 backdrop-blur-xl border border-slate-200/90 dark:border-[#464554]/30 hover:border-indigo-500/40 transition-all duration-200 text-left relative overflow-hidden group shadow-md dark:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-transparent">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  Live Pipeline
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-[#908fa0]">SLA Verified</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-[#f8fafc] mb-1">99.9%</div>
              <div className="text-xs text-slate-600 dark:text-[#908fa0]">Indexing &amp; Neural Query Uptime</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent group-hover:via-indigo-500/80 transition-all" />
            </div>

            {/* Stat 3 */}
            <div className="p-6 rounded-xl bg-white/85 dark:bg-[#161b29]/60 backdrop-blur-xl border border-slate-200/90 dark:border-[#464554]/30 hover:border-indigo-500/40 transition-all duration-200 text-left relative overflow-hidden group shadow-md dark:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-violet-700 dark:text-violet-300 flex items-center gap-1.5 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded border border-violet-100 dark:border-transparent">
                  <Globe className="h-3 w-3" />
                  Federation
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-[#908fa0]">42 countries</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-[#f8fafc] mb-1">150+</div>
              <div className="text-xs text-slate-600 dark:text-[#908fa0]">Global Institutional Campuses</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent group-hover:via-indigo-500/80 transition-all" />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            TRUSTED BY — Infinite Marquee
        ═══════════════════════════════════════════════════ */}
        <section className="mt-24 pt-10 border-t border-slate-200 dark:border-[#464554]/20" id="institutions">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-[#908fa0] mb-8">
            Trusted by leading research institutions &amp; faculties worldwide
          </p>
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
            <div className="lp-marquee-strip items-center gap-12 whitespace-nowrap py-3">
              {[...INSTITUTIONS, ...INSTITUTIONS].map((inst, i) => (
                <div key={i} className="flex items-center gap-2.5 text-slate-700 hover:text-slate-900 dark:text-[#c7c4d7]/80 dark:hover:text-[#f8fafc] transition-colors px-2">
                  <inst.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-mono font-medium tracking-tight">{inst.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            FEATURES SECTION — Bento Grid
        ═══════════════════════════════════════════════════ */}
        <section className="mt-24 pt-10" id="features">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1a1f2d] border border-slate-200 dark:border-[#464554]/30 text-indigo-700 dark:text-indigo-300 text-xs font-mono mb-3">
              Core Capabilities
            </div>
            <h2 className="text-3xl md:text-[40px] font-bold text-slate-900 dark:text-[#f8fafc] mb-3 tracking-tight leading-tight">
              Engineered for Scholarly Rigor
            </h2>
            <p className="text-base text-slate-600 dark:text-[#908fa0] leading-relaxed">
              Next-generation neural architecture that reads, synthesizes, and traces scientific discoveries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-8 rounded-2xl bg-white/85 dark:bg-[#161b29]/70 backdrop-blur-xl border border-slate-200/90 dark:border-[#464554]/30 hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-md dark:shadow-xl">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-[#1a1f2d] border border-indigo-100 dark:border-[#464554]/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-105 transition-transform shadow-sm">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-[#f8fafc] mb-2 tracking-tight">
                  AI-Powered Discovery
                </h3>
                <p className="text-sm text-slate-600 dark:text-[#908fa0] mb-6 leading-relaxed">
                  Semantic search powered by Gemini AI. Parse natural language queries across disparate academic disciplines with auto-extracted hypotheses.
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-[#090e1b]/80 border border-slate-200 dark:border-[#464554]/30 p-3 text-xs font-mono text-slate-800 dark:text-[#c7c4d7]">
                <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-200 dark:border-[#464554]/20 text-slate-600 dark:text-[#908fa0]">
                  <Search className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                  Query: &quot;crispr cas12a off-target kinetics&quot;
                </div>
                <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300">
                  <span>Synthesized: 14,812 papers</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">99.4% conf</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-2xl bg-white/85 dark:bg-[#161b29]/70 backdrop-blur-xl border border-slate-200/90 dark:border-[#464554]/30 hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-md dark:shadow-xl">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all duration-500" />
              <div>
                <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-[#1a1f2d] border border-violet-100 dark:border-[#464554]/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-105 transition-transform shadow-sm">
                  <Network className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-[#f8fafc] mb-2 tracking-tight">
                  Citation Graph Analysis
                </h3>
                <p className="text-sm text-slate-600 dark:text-[#908fa0] mb-6 leading-relaxed">
                  Interactive visual knowledge mapping with co-citation clustering and impact factor trajectory modeling across foundational and derivative works.
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-[#090e1b]/80 border border-slate-200 dark:border-[#464554]/30 p-3 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-600 dark:text-[#908fa0] mb-1.5">
                  <span>Lineage Depth</span>
                  <span className="text-indigo-700 dark:text-indigo-300 font-medium">Level 4 Connected</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#1a1f2d] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 rounded-full w-4/5" />
                </div>
                <div className="mt-2 text-[11px] text-slate-600 dark:text-[#908fa0] flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                  Primary source cluster verified
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-2xl bg-white/85 dark:bg-[#161b29]/70 backdrop-blur-xl border border-slate-200/90 dark:border-[#464554]/30 hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-md dark:shadow-xl">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#4F46E5]/15 rounded-full blur-2xl group-hover:bg-[#4F46E5]/25 transition-all duration-500" />
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-[#1a1f2d] border border-indigo-100 dark:border-[#464554]/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-105 transition-transform shadow-sm">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-[#f8fafc] mb-2 tracking-tight">
                  Multi-Format Library
                </h3>
                <p className="text-sm text-slate-600 dark:text-[#908fa0] mb-6 leading-relaxed">
                  Direct streaming and rendering of PDF, EPUB, LaTeX formulas, interactive Jupyter notebooks, and synchronized audio synthesis.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
                <div className="bg-slate-100 dark:bg-[#1a1f2d] py-1.5 rounded border border-slate-200 dark:border-[#464554]/30 text-slate-800 dark:text-[#f8fafc]">.PDF</div>
                <div className="bg-slate-100 dark:bg-[#1a1f2d] py-1.5 rounded border border-slate-200 dark:border-[#464554]/30 text-slate-800 dark:text-[#f8fafc]">.EPUB</div>
                <div className="bg-slate-100 dark:bg-[#1a1f2d] py-1.5 rounded border border-slate-200 dark:border-[#464554]/30 text-indigo-700 dark:text-indigo-300 font-medium">.AUDIO</div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════════════════ */}
        <section className="mt-24 pt-10" id="how-it-works">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1a1f2d] border border-slate-200 dark:border-[#464554]/30 text-indigo-700 dark:text-indigo-300 text-xs font-mono mb-3">
              Workflow Execution
            </div>
            <h2 className="text-3xl md:text-[40px] font-bold text-slate-900 dark:text-[#f8fafc] mb-3 tracking-tight leading-tight">
              Frictionless Research Pipeline
            </h2>
            <p className="text-base text-slate-600 dark:text-[#908fa0] leading-relaxed">
              Connect your institutional credentials and begin extracting verified literature insights within seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Connect institutional SSO via ORCID, Shibboleth, or institutional .edu credentials in under 30 seconds with automatic entitlement checks.",
                icon: Shield,
              },
              {
                step: "02",
                title: "Browse Catalog",
                desc: "Explore neural embeddings, run deep literature syntheses, compare preprints, and filter verified peer reviews across domains.",
                icon: Search,
              },
              {
                step: "03",
                title: "Download & Cite",
                desc: "Export formatted citations (BibTeX, APA, IEEE, Harvard) and full annotated manuscripts with verified lineage in a single keystroke.",
                icon: Quote,
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative p-8 rounded-2xl bg-white/80 dark:bg-[#161b29]/50 backdrop-blur-md border border-slate-200/90 dark:border-[#464554]/30 hover:border-slate-300 dark:hover:border-[#464554]/60 transition-all duration-200 shadow-sm dark:shadow-none"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono font-semibold text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                    {s.step}
                  </span>
                  <s.icon className="h-5 w-5 text-slate-500 dark:text-[#908fa0]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-[#f8fafc] mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 dark:text-[#908fa0] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            TESTIMONIAL
        ═══════════════════════════════════════════════════ */}
        <section className="mt-24 pt-10">
          <div className="max-w-4xl mx-auto rounded-3xl bg-white/90 dark:bg-[#161b29]/80 backdrop-blur-2xl border border-slate-200/90 dark:border-[#464554]/30 p-8 md:p-16 relative overflow-hidden shadow-xl dark:shadow-2xl">
            <div className="pointer-events-none absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full p-1 border-2 border-indigo-500/50 shadow-[0_0_24px_rgba(99,102,241,0.2)] dark:shadow-[0_0_24px_rgba(99,102,241,0.3)] overflow-hidden bg-indigo-50 dark:bg-[#1a1f2d] flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center">
                    <GraduationCap className="h-12 w-12 text-white/90" />
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="flex flex-col text-center md:text-left">
                <Quote className="h-8 w-8 text-indigo-600/70 dark:text-indigo-400/60 mb-3 mx-auto md:mx-0" />
                <p className="text-lg text-slate-800 dark:text-[#f8fafc] font-normal italic leading-relaxed mb-6">
                  &ldquo;LibrisAI transformed how our doctoral lab discovers cross-disciplinary connections. Synthesizing six decades of genomics and computational linguistics in seconds is no longer speculative—it is our daily standard.&rdquo;
                </p>
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-[#f8fafc]">Dr. Alistair Vance, Ph.D.</div>
                  <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                    Chair of Computational Biology &amp; Senior Fellow, Institute for Advanced Study
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════════ */}
        <section className="mt-24 pt-10 pb-10">
          <div className="relative rounded-3xl bg-gradient-to-b from-indigo-50/90 via-slate-50 to-white dark:from-[#10172e] dark:to-[#090e1b] border border-indigo-100 dark:border-[#464554]/40 p-8 md:p-24 text-center overflow-hidden shadow-xl dark:shadow-[0_12px_48px_rgba(0,0,0,0.6)]">
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse,_rgba(99,102,241,0.2)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse,_rgba(99,102,241,0.25)_0%,_transparent_70%)] blur-2xl" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-[40px] font-bold text-slate-900 dark:text-[#f8fafc] mb-3 tracking-tight leading-tight">
                Ready to accelerate your research?
              </h2>
              <p className="text-base text-slate-600 dark:text-[#908fa0] mb-10 leading-relaxed">
                Join over 120,000 academic researchers, fellows, and university librarians today. Institutional trials require zero IT overhead.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <>
                    <Link
                      href="/"
                      className="w-full sm:w-auto text-[13px] font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#7173fa] hover:to-[#574ff0] px-8 py-3.5 rounded-full shadow-[0_0_32px_rgba(99,102,241,0.5)] hover:shadow-[0_0_42px_rgba(99,102,241,0.7)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <span>Enter Monograph Catalog</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href={isAdmin ? "/admin" : "/dashboard"}
                      className="w-full sm:w-auto text-[13px] font-medium text-slate-700 dark:text-[#f8fafc] bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-8 py-3.5 rounded-full backdrop-blur-md transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Shield className="h-4 w-4 text-slate-500 dark:text-[#908fa0]" />
                      <span>{isAdmin ? "Admin Console" : "Research Workspace"}</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="w-full sm:w-auto text-[13px] font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:from-[#7173fa] hover:to-[#574ff0] px-8 py-3.5 rounded-full shadow-[0_0_32px_rgba(99,102,241,0.5)] hover:shadow-[0_0_42px_rgba(99,102,241,0.7)] transition-all duration-200 active:scale-[0.98]"
                    >
                      Create Free Account
                    </Link>
                    <Link
                      href="/login"
                      className="w-full sm:w-auto text-[13px] font-medium text-slate-700 dark:text-[#f8fafc] bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-8 py-3.5 rounded-full backdrop-blur-md transition-all duration-150 shadow-sm"
                    >
                      Sign In to Portal
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════
          MINIMAL FOOTER
      ═══════════════════════════════════════════════════ */}
      <footer className="w-full border-t border-slate-200 dark:border-[#464554]/30 bg-white dark:bg-[#090e1b] relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded overflow-hidden flex items-center justify-center bg-indigo-600">
                <BookOpen className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-[#f8fafc]">LibrisAI</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-[#464554]">|</span>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1a1f2d] border border-slate-200 dark:border-[#464554]/30 text-xs font-mono text-slate-600 dark:text-[#908fa0]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              All Neural Systems Operational
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold text-slate-600 dark:text-[#908fa0] uppercase tracking-wider">
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">About</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">Neural Index</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">Contact</a>
          </div>
        </div>

        <div className="border-t border-slate-200/80 dark:border-[#464554]/15 py-4 text-center text-xs text-slate-500 dark:text-[#908fa0]/70">
          <p>© 2026 LibrisAI Academic Repository. All citations peer-verified.</p>
        </div>
      </footer>
    </div>
  );
}
