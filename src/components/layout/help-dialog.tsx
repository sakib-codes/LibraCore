"use client";

import { useState } from "react";
import {
  HelpCircle,
  BookOpen,
  Sparkles,
  Command,
  FileText,
  Search,
  Network,
  ShieldCheck,
  Mail,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HelpDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer active:scale-95"
          title="Academic Repository Help & Protocol"
          aria-label="Academic Repository Help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl p-6 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/25">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                LibrisAI Repository Protocol & Guide
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Institutional documentation for archival navigation, AI research, and keyboard shortcuts.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Quick Guide Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/70 bg-secondary/30 p-3 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Search className="h-3.5 w-3.5 text-primary" />
                <span>Catalog & Search</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Filter by academic discipline, format (PDF, EPUB, Audio), or access tier. Use the dual slider for publication years.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-secondary/30 p-3 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Libris AI Intelligence</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Powered by Gemini with MarkItDown section grounding, reducing prompt tokens by 70–96% for sub-3s scholarly Q&A.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-secondary/30 p-3 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Network className="h-3.5 w-3.5 text-indigo-400" />
                <span>Citation Network</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Navigate force-directed citation graphs with real physics, clustering foundational papers and incoming citations.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-secondary/30 p-3 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <FileText className="h-3.5 w-3.5 text-emerald-400" />
                <span>Canvas PDF Streamer</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Continuous high-DPI HTML5 canvas streaming with in-reader annotation bookmarks, dark mode paper filters, and BibTeX export.
              </p>
            </div>
          </div>

          {/* Keyboard Shortcuts Table */}
          <div className="rounded-xl border border-border/70 bg-secondary/20 p-3.5 space-y-2">
            <h4 className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
              Global Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Spotlight Search</span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/80 font-mono text-[10px]">
                  ⌘K / Ctrl+K
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Toggle Dark / Light</span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/80 font-mono text-[10px]">
                  ⌘D / Ctrl+D
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Open AI Librarian</span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/80 font-mono text-[10px]">
                  ⌘L / Ctrl+L
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Citation Graph</span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/80 font-mono text-[10px]">
                  ⌘G / Ctrl+G
                </kbd>
              </div>
            </div>
          </div>

          {/* Support Notice */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>LibrisAI Academic Architecture v3.5</span>
            </div>
            <a
              href="mailto:admin@libris.ai"
              className="text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <Mail className="h-3 w-3" />
              <span>Contact Chief Archivist</span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
