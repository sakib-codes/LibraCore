"use client";

import { useState, useRef, useEffect } from "react";
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
  Bookmark,
  BookmarkCheck,
  PenTool,
  Sparkles,
  Trash2,
  Share2,
  Type,
  FileDown,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatDuration } from "@/lib/utils";
import type { FileType } from "@/integrations/supabase/types";

export interface ResearchNote {
  id: string;
  page: number;
  text: string;
  timestamp: string;
  tag?: string;
}

export interface PageBookmark {
  id: string;
  page: number;
  label: string;
  timestamp: string;
}

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
  const [paperTheme, setPaperTheme] = useState<"paper" | "parchment" | "midnight">("paper");
  const [fontFamily, setFontFamily] = useState<"serif" | "sans" | "mono">("serif");
  const [lineSpacing, setLineSpacing] = useState<"normal" | "relaxed" | "loose">("relaxed");
  const [pageInput, setPageInput] = useState(String(currentPage));
  const [copiedBibtex, setCopiedBibtex] = useState(false);

  // In-Reader Annotation & Bookmarks State (Milestone 10)
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [notebookTab, setNotebookTab] = useState<"bookmarks" | "notes" | "appearance">("bookmarks");
  const [bookmarks, setBookmarks] = useState<PageBookmark[]>([]);
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [newBookmarkLabel, setNewBookmarkLabel] = useState("");
  const [showAddBookmarkInput, setShowAddBookmarkInput] = useState(false);

  const totalPages = pageCount || 342;
  const storageKeyPrefix = `libris_research_${title.slice(0, 24).replace(/\s+/g, "_")}`;

  // Load saved annotations from localStorage
  useEffect(() => {
    try {
      const savedBm = localStorage.getItem(`${storageKeyPrefix}_bookmarks`);
      if (savedBm) {
        setBookmarks(JSON.parse(savedBm));
      } else {
        // Initial sample scholarly anchor
        setBookmarks([
          {
            id: "bm-1",
            page: 1,
            label: "Introduction & Theoretical Bounds",
            timestamp: "Initial Archive Index",
          },
        ]);
      }

      const savedNotes = localStorage.getItem(`${storageKeyPrefix}_notes`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      } else {
        setNotes([
          {
            id: "note-1",
            page: 1,
            text: "Core theorem reduction to high-dimensional shortest vector problem (SVP). Cross-reference with Regev 2005.",
            timestamp: new Date().toLocaleDateString(),
            tag: "Methodology",
          },
        ]);
      }
    } catch {
      // local storage unavailable fallback
    }
  }, [storageKeyPrefix]);

  // Sync state to localStorage
  const saveBookmarksToStorage = (updated: PageBookmark[]) => {
    setBookmarks(updated);
    try {
      localStorage.setItem(`${storageKeyPrefix}_bookmarks`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const saveNotesToStorage = (updated: ResearchNote[]) => {
    setNotes(updated);
    try {
      localStorage.setItem(`${storageKeyPrefix}_notes`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Add / remove bookmarks
  const isCurrentPageBookmarked = bookmarks.some((b) => b.page === currentPage);

  const togglePageBookmark = () => {
    if (isCurrentPageBookmarked) {
      const updated = bookmarks.filter((b) => b.page !== currentPage);
      saveBookmarksToStorage(updated);
      toast.info(`Removed bookmark for Page ${currentPage}`);
    } else {
      const newBm: PageBookmark = {
        id: `bm-${Date.now()}`,
        page: currentPage,
        label: newBookmarkLabel.trim() || `Bookmark at Page ${currentPage}`,
        timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
      const updated = [...bookmarks, newBm].sort((a, b) => a.page - b.page);
      saveBookmarksToStorage(updated);
      setNewBookmarkLabel("");
      setShowAddBookmarkInput(false);
      toast.success(`Bookmarked Page ${currentPage}!`);
    }
  };

  const deleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.filter((b) => b.id !== id);
    saveBookmarksToStorage(updated);
    toast.info("Bookmark removed");
  };

  // Add research note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: ResearchNote = {
      id: `note-${Date.now()}`,
      page: currentPage,
      text: newNoteText.trim(),
      timestamp: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      tag: "Marginalia",
    };

    const updated = [newNote, ...notes];
    saveNotesToStorage(updated);
    setNewNoteText("");
    toast.success(`Research note saved for Page ${currentPage}!`);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotesToStorage(updated);
    toast.info("Note removed");
  };

  // Export research notes to Markdown
  const handleExportNotesMarkdown = () => {
    if (notes.length === 0) {
      toast.info("No research notes to export yet.");
      return;
    }

    const mdLines = [
      `# Research Notes: ${title}`,
      `**Author:** ${author}`,
      `**Export Date:** ${new Date().toISOString()}`,
      `**Total Notes:** ${notes.length}`,
      "",
      "---",
      "",
    ];

    notes.forEach((n, idx) => {
      mdLines.push(`### Note ${idx + 1} — Page ${n.page}`);
      mdLines.push(`*Recorded on ${n.timestamp}*`);
      mdLines.push("");
      mdLines.push(`> ${n.text}`);
      mdLines.push("");
    });

    const blob = new Blob([mdLines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.slice(0, 20).replace(/\s+/g, "_")}_Notes.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Research notes downloaded as Markdown!");
  };

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const handlePageJump = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    } else {
      setPageInput(String(currentPage));
    }
  };

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

        {/* Notebook Toggle Button with Badges */}
        {activeTab === "reader" && (
          <Button
            type="button"
            variant={notebookOpen ? "default" : "outline"}
            size="sm"
            onClick={() => setNotebookOpen(!notebookOpen)}
            className="h-7 px-2.5 text-xs font-semibold gap-1.5 shadow-2xs shrink-0"
          >
            <PenTool className="h-3 w-3" />
            <span className="hidden sm:inline">Research Notebook</span>
            {(bookmarks.length > 0 || notes.length > 0) && (
              <span className="ml-0.5 rounded-full bg-primary-foreground/20 px-1.5 py-0.2 text-[10px] font-mono">
                {bookmarks.length + notes.length}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Reader Toolbar (Pagination, Jump, Tone & Zoom Controls) */}
      {activeTab === "reader" && (
        <div className="flex flex-wrap items-center justify-between border-b border-border/70 bg-card/60 px-4 py-2.5 text-xs text-muted-foreground gap-3">
          {/* Page Navigator & Direct Input */}
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
            <form onSubmit={handlePageJump} className="flex items-center gap-1">
              <span className="font-mono text-xs">Page</span>
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={handlePageJump}
                className="h-6 w-9 rounded border border-border/80 bg-background text-center font-bold font-mono text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                title="Enter page number and hit Enter"
              />
              <span className="font-mono text-xs text-muted-foreground">of {totalPages}</span>
            </form>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-md"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>

            {/* Quick Bookmark Button for Current Page */}
            <Button
              variant={isCurrentPageBookmarked ? "secondary" : "ghost"}
              size="sm"
              onClick={togglePageBookmark}
              className={`h-7 px-2 text-xs gap-1 font-medium transition-colors ${
                isCurrentPageBookmarked ? "text-primary font-bold bg-primary/10" : ""
              }`}
              title={isCurrentPageBookmarked ? "Page is bookmarked" : "Bookmark this page"}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isCurrentPageBookmarked ? "fill-primary text-primary" : ""}`} />
              <span className="hidden md:inline">{isCurrentPageBookmarked ? "Bookmarked" : "Bookmark Page"}</span>
            </Button>
          </div>

          {/* Paper Tone Selector & Zoom */}
          <div className="flex items-center gap-3">
            {/* Tone Selector */}
            <div className="hidden sm:flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setPaperTheme("paper")}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  paperTheme === "paper" ? "bg-card text-foreground font-bold shadow-2xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                White
              </button>
              <button
                type="button"
                onClick={() => setPaperTheme("parchment")}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  paperTheme === "parchment" ? "bg-[#FAF7F2] text-[#27272A] font-bold shadow-2xs border border-amber-200/50" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Parchment
              </button>
              <button
                type="button"
                onClick={() => setPaperTheme("midnight")}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  paperTheme === "midnight" ? "bg-[#090D16] text-[#F8FAFC] font-bold shadow-2xs border border-slate-700" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Midnight
              </button>
            </div>

            {/* Zoom Controls */}
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
              <span className="font-mono text-xs w-10 text-center font-medium">
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
              <div className="h-4 w-px bg-border mx-0.5" />
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
        </div>
      )}

      {/* Main Container: Reading Canvas + Slide-out Research Notebook */}
      <div className="relative flex flex-col lg:flex-row w-full min-h-[580px] overflow-hidden">
        {/* Main Canvas Area */}
        <div
          id="document-canvas"
          className="flex-1 bg-muted/30 p-4 sm:p-8 flex items-center justify-center min-h-[540px] overflow-auto transition-all"
        >
          {activeTab === "reader" && (
            /* Scholarly Manuscript Canvas matching Image 2 */
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
              className={`w-full max-w-2xl border rounded-2xl p-8 sm:p-12 shadow-lg space-y-6 transition-all duration-200 ${
                fontFamily === "serif" ? "font-serif" : fontFamily === "mono" ? "font-mono" : "font-sans"
              } ${
                lineSpacing === "loose"
                  ? "leading-loose"
                  : lineSpacing === "relaxed"
                  ? "leading-relaxed"
                  : "leading-normal"
              } ${
                paperTheme === "parchment"
                  ? "bg-[#FAF7F2] text-[#27272A] border-[#E8E2D8] shadow-amber-900/5"
                  : paperTheme === "midnight"
                  ? "bg-[#090D16] text-[#E2E8F0] border-slate-800 shadow-2xl"
                  : "bg-card text-foreground border-border/80"
              }`}
            >
              {/* Manuscript Page Header */}
              <div className="text-center space-y-2 border-b border-border/60 pb-6 relative">
                {isCurrentPageBookmarked && (
                  <div className="absolute top-0 right-0 flex items-center gap-1 text-[11px] font-sans font-bold text-primary">
                    <BookmarkCheck className="h-3.5 w-3.5" />
                    <span>Page {currentPage} Bookmarked</span>
                  </div>
                )}
                <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-muted-foreground">
                  Academic Press Monograph • Page {currentPage}
                </span>
                <h1 className="text-xl sm:text-2xl font-black font-sans tracking-tight">
                  {title}
                </h1>
                <p className="text-xs uppercase font-sans font-bold tracking-wider text-muted-foreground">
                  {author.toUpperCase()}, Department of Computer Science
                </p>
              </div>

              {/* Dynamic Content based on current page */}
              {currentPage === 1 ? (
                <>
                  {/* Abstract */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-primary">
                      Abstract
                    </h3>
                    <p className="text-xs sm:text-sm text-justify opacity-90">
                      As computational paradigms shift toward quantum supremacy, classical cryptographic primitives face unprecedented threats. This monograph provides a rigorous mathematical foundation for post-quantum security models, exploring lattice-based constructions, error-correcting codes, and multivariate polynomial equations. We present novel theorems and security proofs designed for high-assurance enterprise systems.
                    </p>
                  </div>

                  {/* Section 1 with Editorial Drop Cap */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-primary">
                      1. Introduction to Post-Quantum Cryptography
                    </h3>
                    <p className="dropcap text-xs sm:text-sm text-justify opacity-90">
                      The security of contemporary digital infrastructure relies heavily on integer factorization and discrete logarithm problems, both of which are vulnerable to polynomial-time attacks via Shor&apos;s algorithm on quantum processors. Transitioning to quantum-resistant primitives requires rebuilding core trust anchors from algebraic structures that remain intractable for both classical and quantum architectures.
                    </p>
                    <p className="text-xs sm:text-sm text-justify opacity-90">
                      Among candidate architectures, lattice-based cryptography demonstrates optimal trade-offs between asymptotic security bounds and implementation efficiency. In particular, Learning With Errors (LWE) and its ring/module variants provide robust hardness reductions rooted in shortest vector problems in high-dimensional Euclidean lattices.
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-border/40 text-xs font-sans font-medium text-muted-foreground">
                    <span>Section {(currentPage % 7) + 1}.{currentPage} Theorem Formulation</span>
                    <span>DOI: 10.1016/libris.2025.{currentPage}</span>
                  </div>
                  <h3 className="text-sm font-sans font-bold text-foreground">
                    Mathematical Hardness Guarantees across Dimension n = {currentPage * 128}
                  </h3>
                  <p className="text-xs sm:text-sm text-justify opacity-90">
                    Let $\Lambda \subset \mathbb&#123;R&#125;^n$ denote a full-rank discrete submodule. The shortest independent vectors problem ($SIVP_\gamma$) posits that no probabilistic polynomial-time algorithm can approximate the Minkowski successive minima within sub-exponential factor $\gamma = O(n^{1.5})$.
                  </p>
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/60 font-mono text-xs overflow-x-auto text-primary">
                    ||v_1|| ≤ 2^&#123;n/4&#125; · (det \Lambda)^&#123;1/n&#125; + \epsilon(n)
                  </div>
                  <p className="text-xs sm:text-sm text-justify opacity-90">
                    Empirical evaluations confirm that noise parameter distributions $\chi_\sigma$ under discrete Gaussian sampling preserve indistinguishability under chosen-ciphertext attack (IND-CCA2) even under adversarial quantum query models.
                  </p>
                </div>
              )}

              {/* Manuscript Page Footer */}
              <div className="flex items-center justify-between border-t border-border/60 pt-4 text-[10px] font-sans text-muted-foreground font-mono">
                <span>LibrisAI Repository Protocol</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            </div>
          )}

          {activeTab === "audio" && (
            <div className="flex flex-col items-center justify-center w-full max-w-md p-6 bg-card rounded-2xl border border-border shadow-md space-y-5">
              <audio
                ref={audioRef}
                src={fileUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}
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

        {/* Docked Research Notebook & Annotations Drawer (Milestone 10) */}
        {activeTab === "reader" && notebookOpen && (
          <aside className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-border/80 bg-card/95 backdrop-blur-md p-4 flex flex-col justify-between shadow-lg shrink-0">
            <div className="space-y-4">
              {/* Notebook Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <PenTool className="h-4 w-4 text-primary" />
                  <h3 className="font-bold text-sm text-foreground tracking-tight">Research Notebook</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                  onClick={() => setNotebookOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Notebook Sub-Tabs */}
              <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setNotebookTab("bookmarks")}
                  className={`flex-1 py-1 px-2 rounded-md font-semibold text-center transition-all ${
                    notebookTab === "bookmarks"
                      ? "bg-card text-foreground shadow-2xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Bookmarks ({bookmarks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotebookTab("notes")}
                  className={`flex-1 py-1 px-2 rounded-md font-semibold text-center transition-all ${
                    notebookTab === "notes"
                      ? "bg-card text-foreground shadow-2xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Notes ({notes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotebookTab("appearance")}
                  className={`flex-1 py-1 px-2 rounded-md font-semibold text-center transition-all ${
                    notebookTab === "appearance"
                      ? "bg-card text-foreground shadow-2xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Typography
                </button>
              </div>

              {/* Tab 1: Bookmarks List */}
              {notebookTab === "bookmarks" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Saved Page Anchors
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddBookmarkInput(!showAddBookmarkInput)}
                      className="h-6 px-2 text-[11px] text-primary gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add for Page {currentPage}
                    </Button>
                  </div>

                  {showAddBookmarkInput && (
                    <div className="p-2.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                      <input
                        type="text"
                        placeholder={`Bookmark label (e.g. Proof on Page ${currentPage})`}
                        value={newBookmarkLabel}
                        onChange={(e) => setNewBookmarkLabel(e.target.value)}
                        className="w-full h-8 text-xs px-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowAddBookmarkInput(false)}
                          className="h-6 px-2 text-[11px]"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={togglePageBookmark}
                          className="h-6 px-2.5 text-[11px] bg-primary text-primary-foreground font-semibold"
                        >
                          Save Anchor
                        </Button>
                      </div>
                    </div>
                  )}

                  {bookmarks.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      No bookmarks saved yet. Click &quot;Bookmark Page&quot; on any page to anchor research.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                      {bookmarks.map((bm) => (
                        <div
                          key={bm.id}
                          onClick={() => setCurrentPage(bm.page)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between group ${
                            bm.page === currentPage
                              ? "border-primary bg-primary/5 shadow-2xs"
                              : "border-border/70 hover:border-primary/40 bg-card"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono font-bold text-primary border-primary/30">
                                P. {bm.page}
                              </Badge>
                              <span className="font-semibold text-foreground truncate max-w-[170px]">
                                {bm.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">{bm.timestamp}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              Jump →
                            </span>
                            <button
                              type="button"
                              onClick={(e) => deleteBookmark(bm.id, e)}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete bookmark"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Research Marginalia & Notes */}
              {notebookTab === "notes" && (
                <div className="space-y-3">
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <span>Annotate Page {currentPage}</span>
                      <span className="text-primary font-mono">P. {currentPage}</span>
                    </div>
                    <textarea
                      rows={3}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Add scholarly note, citation cross-reference, or methodology thesis..."
                      className="w-full text-xs p-2.5 rounded-xl border border-border bg-muted/30 text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!newNoteText.trim()}
                        className="h-7 text-xs font-semibold bg-primary text-primary-foreground gap-1"
                      >
                        <Plus className="h-3 w-3" /> Save Note
                      </Button>
                    </div>
                  </form>

                  <div className="border-t border-border/60 pt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Saved Notes ({notes.length})
                      </span>
                      {notes.length > 0 && (
                        <button
                          type="button"
                          onClick={handleExportNotesMarkdown}
                          className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                        >
                          <FileDown className="h-3 w-3" /> Export .md
                        </button>
                      )}
                    </div>

                    {notes.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No marginalia notes yet for this monograph.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                        {notes.map((note) => (
                          <div
                            key={note.id}
                            className="p-2.5 rounded-xl border border-border/70 bg-card space-y-1.5 text-xs relative group"
                          >
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="outline"
                                onClick={() => setCurrentPage(note.page)}
                                className="cursor-pointer text-[10px] py-0 px-1.5 font-mono text-primary border-primary/30 hover:bg-primary/10"
                                title="Click to jump to this page"
                              >
                                Page {note.page}
                              </Badge>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span>{note.timestamp}</span>
                                <button
                                  type="button"
                                  onClick={() => deleteNote(note.id)}
                                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Delete note"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <p className="text-foreground/90 leading-relaxed font-serif text-[11.5px] bg-muted/20 p-2 rounded-lg">
                              {note.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Typography & Reading Comfort */}
              {notebookTab === "appearance" && (
                <div className="space-y-4 text-xs">
                  {/* Font Family Selector */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">Typeface</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant={fontFamily === "serif" ? "default" : "outline"}
                        className="h-8 text-xs font-serif"
                        onClick={() => setFontFamily("serif")}
                      >
                        Academic
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={fontFamily === "sans" ? "default" : "outline"}
                        className="h-8 text-xs font-sans"
                        onClick={() => setFontFamily("sans")}
                      >
                        Modern
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={fontFamily === "mono" ? "default" : "outline"}
                        className="h-8 text-xs font-mono"
                        onClick={() => setFontFamily("mono")}
                      >
                        Technical
                      </Button>
                    </div>
                  </div>

                  {/* Line Spacing */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">Line Height</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant={lineSpacing === "normal" ? "default" : "outline"}
                        className="h-8 text-xs"
                        onClick={() => setLineSpacing("normal")}
                      >
                        Compact
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={lineSpacing === "relaxed" ? "default" : "outline"}
                        className="h-8 text-xs"
                        onClick={() => setLineSpacing("relaxed")}
                      >
                        Balanced
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={lineSpacing === "loose" ? "default" : "outline"}
                        className="h-8 text-xs"
                        onClick={() => setLineSpacing("loose")}
                      >
                        Editorial
                      </Button>
                    </div>
                  </div>

                  {/* Paper Tone in Appearance */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground">Background Tone</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant={paperTheme === "paper" ? "default" : "outline"}
                        className="h-8 text-xs"
                        onClick={() => setPaperTheme("paper")}
                      >
                        Pure White
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={paperTheme === "parchment" ? "default" : "outline"}
                        className="h-8 text-xs bg-[#FAF7F2] text-[#27272A] border-amber-200"
                        onClick={() => setPaperTheme("parchment")}
                      >
                        Parchment
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={paperTheme === "midnight" ? "default" : "outline"}
                        className="h-8 text-xs bg-[#090D16] text-[#F8FAFC] border-slate-700"
                        onClick={() => setPaperTheme("midnight")}
                      >
                        Midnight
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Export Actions */}
            <div className="pt-3 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportNotesMarkdown}
                className="w-full text-xs font-semibold gap-1.5"
              >
                <FileDown className="h-3.5 w-3.5" /> Export All Research Notes (.md)
              </Button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
