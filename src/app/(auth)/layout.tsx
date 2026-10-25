import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

/**
 * Auth Layout — Clean, distraction-free shell for /login, /register, and /reset-password.
 * Completely strips the standard AppShell Navbar, Footer, and Chat Widget.
 * Seamlessly connects users back to the Stitch-designed Landing Page (/landing) and Catalog (/).
 * Fits seamlessly within desktop viewports without unnecessary scrolling.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen lg:h-screen lg:max-h-screen w-full bg-slate-100 dark:bg-[#080d1a] text-slate-900 dark:text-[#dee2f5] flex flex-col justify-between p-3 sm:p-4 md:px-6 md:py-3 lg:overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-white transition-colors duration-300">
      {/* ── Ambient Background Glow & Academic Grid ── */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.12)_0%,_rgba(79,70,229,0.04)_45%,_transparent_75%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.18)_0%,_rgba(79,70,229,0.06)_45%,_transparent_75%)] blur-3xl z-0" />
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:36px_36px]"
      />

      {/* ── Top Auth Navigation Header ── */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between py-1.5 px-1 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors group px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-[#161b29]/80 hover:bg-slate-50 dark:hover:bg-[#1f2638] border border-slate-200 dark:border-slate-700/60 backdrop-blur-md shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 text-indigo-600 dark:text-indigo-400" />
          <span>Platform Overview</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span>Institutional Access Portal</span>
          </div>

          <div className="flex items-center rounded-full bg-white/80 dark:bg-[#161b29]/80 border border-slate-200 dark:border-slate-700/60 p-0.5 shadow-sm backdrop-blur-md">
            <ThemeToggle className="h-7 w-7 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white" />
          </div>
        </div>
      </header>

      {/* ── Main Auth Card Container ── */}
      <main className="relative z-10 w-full max-w-5xl mx-auto my-auto py-1 sm:py-2 flex items-center justify-center min-h-0">
        {children}
      </main>

      {/* ── Institutional Security Footer ── */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono border-t border-slate-200 dark:border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>256-Bit SSL Institutional Security Protocol</span>
        </div>
        <div className="flex items-center gap-3">
          <span>© 2026 LibrisAI Academic Repository</span>
          <span>•</span>
          <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            About Platform
          </Link>
          <span>•</span>
          <Link href="/#features" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            Open Access Protocol
          </Link>
        </div>
      </footer>
    </div>
  );
}
