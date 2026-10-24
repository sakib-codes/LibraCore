"use client";

import { useState, useRef } from "react";
import {
  FileText,
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Maximize2,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Code,
  BookOpen,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatDuration } from "@/lib/utils";
import type { FileType } from "@/integrations/supabase/types";

interface BookPreviewReaderProps {
  title: string;
  author: string;
  fileUrl: string;
  fileType: FileType;
  durationSeconds?: number | null;
  pageCount?: number | null;
  onDownload?: () => void;
}

export function BookPreviewReader({
  title,
  author,
  fileUrl,
  fileType,
  durationSeconds,
  pageCount = 342,
  onDownload,
}: BookPreviewReaderProps) {
  const [activeTab, setActiveTab] = useState<"reader" | "audio" | "bibtex">("reader");
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [copiedBibtex, setCopiedBibtex] = useState(false);

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalPages = pageCount || 342;

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const bibtexContent = `@article{adams2025cryptographic,
  title={${title}},
  author={${author}},
  journal={Academic Press Monographs in Computer Science},
  volume={48},
  number={2},
  pages={1--${totalPages}},
  year={2025},
  publisher={Oxford / Cambridge Scholarly Press},
  doi={10.1016/j.librisai.2025.04.012}
}`;

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(bibtexContent);
    setCopiedBibtex(true);
    toast.success("BibTeX citation copied to clipboard!");
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  return (
    <div className="flex flex-col w-full rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      {/* Header Tabs matching Image 2 */}
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-3 sm:px-4 py-2 gap-2 overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("reader")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "reader"
                ? "bg-card text-foreground shadow-2xs border border-border/70"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-primary" /> Document Reader ({fileType})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audio")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "audio"
                ? "bg-card text-foreground shadow-2xs border border-border/70"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Headphones className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Audio Lecture
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bibtex")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "bibtex"
                ? "bg-card text-foreground shadow-2xs border border-border/70"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code className="h-3.5 w-3.5 text-indigo-500" /> Metadata & BibTeX
          </button>
        </div>
      </div>

      {/* Reader Toolbar (Pagination & Zoom Controls matching Image 2) */}
      {activeTab === "reader" && (
        <div className="flex items-center justify-between border-b border-border/70 bg-card/60 px-4 py-2.5 text-xs text-muted-foreground">
          {/* Page Navigator */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-md"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="font-mono text-xs font-medium text-foreground">
              Page <span className="font-bold text-primary">{currentPage}</span> of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-md"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Zoom & Fullscreen Controls */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="font-mono text-xs w-12 text-center font-medium">
              {zoomLevel}%
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={() => {
                const elem = document.getElementById("document-canvas");
                if (elem?.requestFullscreen) elem.requestFullscreen();
              }}
              title="Fullscreen Mode"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <div id="document-canvas" className="bg-muted/30 p-4 sm:p-8 flex items-center justify-center min-h-[540px] overflow-auto">
        {activeTab === "reader" && (
          /* Scholarly White Paper Canvas matching Image 2 */
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
            className="w-full max-w-2xl bg-card border border-border/80 rounded-xl p-8 sm:p-12 shadow-md space-y-6 text-foreground font-serif leading-relaxed transition-transform duration-150"
          >
            <div className="text-center space-y-2 border-b border-border/60 pb-6">
              <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-muted-foreground">
                Academic Press Monograph
              </span>
              <h1 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-xs uppercase font-sans font-bold tracking-wider text-muted-foreground">
                {author.toUpperCase()}, Department of Computer Science, University of Cambridge
              </p>
            </div>

            {/* Abstract */}
            <div className="space-y-2">
              <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-primary">
                Abstract
              </h3>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed text-justify">
                As computational paradigms shift toward quantum supremacy, classical cryptographic primitives face unprecedented threats. This monograph provides a rigorous mathematical foundation for post-quantum security models, exploring lattice-based constructions, error-correcting codes, and multivariate polynomial equations. We present novel theorems and security proofs designed for high-assurance enterprise systems.
              </p>
            </div>

            {/* Section 1 */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-primary">
                1. Introduction to Post-Quantum Cryptography
              </h3>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed text-justify">
                The security of contemporary digital infrastructure relies heavily on integer factorization and discrete logarithm problems, both of which are vulnerable to polynomial-time attacks via Shor&apos;s algorithm on quantum processors. Transitioning to quantum-resistant primitives requires rebuilding core trust anchors from algebraic structures that remain intractable for both classical and quantum architectures.
              </p>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed text-justify">
                Among candidate architectures, lattice-based cryptography demonstrates optimal trade-offs between asymptotic security bounds and implementation efficiency. In particular, Learning With Errors (LWE) and its ring/module variants provide robust hardness reductions rooted in shortest vector problems in high-dimensional Euclidean lattices.
              </p>
            </div>
          </div>
        )}

        {activeTab === "audio" && (
          <div className="flex flex-col items-center justify-center w-full max-w-md p-6 bg-card rounded-2xl border border-border shadow-md space-y-5">
            <audio
              ref={audioRef}
              src={fileUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
              onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
              onEnded={() => setIsPlaying(false)}
            />

            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm">
              <Headphones className="h-10 w-10 animate-pulse" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-foreground text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Audio Monograph Edition & Lecture</p>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                className="rounded-full h-12 w-12 bg-primary text-primary-foreground shadow-sm"
                onClick={toggleAudio}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
            </div>
          </div>
        )}

        {activeTab === "bibtex" && (
          <div className="w-full max-w-2xl bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
                  Scholarly BibTeX Citation
                </h3>
                <p className="text-[11px] text-muted-foreground">Standard citation entry for LaTeX and reference managers</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleCopyBibtex}
              >
                {copiedBibtex ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedBibtex ? "Copied" : "Copy BibTeX"}
              </Button>
            </div>
            <pre className="rounded-lg bg-muted/60 p-4 font-mono text-xs text-foreground overflow-x-auto leading-relaxed border border-border/60">
              {bibtexContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
