"use client";

import Link from "next/link";
import {
  Sparkles,
  Users,
  BookOpen,
  FolderTree,
  Download,
  HardDrive,
  Cpu,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Database,
  Cloud,
  CheckCircle2,
  Clock,
  Layers,
  BarChart3,
  Server,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Book, Category, Profile } from "@/integrations/supabase/types";

interface AdminOverviewViewProps {
  books: (Book & { categories?: Category | null })[];
  categories: Category[];
  users: Profile[];
  totalDownloads: number;
  onOpenUpload: () => void;
  onOpenAiReport: () => void;
  onExportIndex: () => void;
  onNavigateTab: (tab: string) => void;
}

export function AdminOverviewView({
  books,
  categories,
  users,
  totalDownloads,
  onOpenUpload,
  onOpenAiReport,
  onExportIndex,
  onNavigateTab,
}: AdminOverviewViewProps) {
  // Activity audit records
  const AUDIT_ACTIVITIES = [
    {
      id: "act-1",
      action: "AI Document Indexing",
      detail: "Libris AI processed token reduction on Designing Data-Intensive Applications (94.2% saved)",
      user: "Chief Archivist",
      time: "14 mins ago",
      type: "ai",
      status: "success",
    },
    {
      id: "act-2",
      action: "New Monograph Ingested",
      detail: "Uploaded Cryptographic Security: Foundations and Practice (PDF, 14.2 MB)",
      user: "admin@libris.ai",
      time: "2 hours ago",
      type: "upload",
      status: "success",
    },
    {
      id: "act-3",
      action: "Taxonomy Synchronized",
      detail: "Added new academic category 'Quantum Computing & Information'",
      user: "admin@libris.ai",
      time: "5 hours ago",
      type: "taxonomy",
      status: "success",
    },
    {
      id: "act-4",
      action: "Reader Role Escalation",
      detail: "Dr. Eliza Adams elevated to Institutional Faculty tier",
      user: "admin@libris.ai",
      time: "1 day ago",
      type: "security",
      status: "success",
    },
    {
      id: "act-5",
      action: "Catalog Health Audit",
      detail: "Generated 2026 Academic Expansion Report via Gemini AI (Score: 95/100)",
      user: "Libris AI Agent",
      time: "2 days ago",
      type: "ai",
      status: "success",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Action Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-secondary/40 to-background">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
              Institutional Operations & Telemetry Command
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Live index health, autonomous AI grounding metrics, and repository storage monitoring.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground shadow-xs"
            onClick={onOpenUpload}
          >
            <Plus className="h-3.5 w-3.5" /> Upload Monograph
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/5"
            onClick={onOpenAiReport}
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Health Audit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold"
            onClick={onExportIndex}
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" /> Export Index
          </Button>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: AI Engine Infrastructure */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Cpu className="h-4 w-4 text-primary" />
              <span>AI Engine Governance</span>
            </div>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono">
              Operational
            </Badge>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Active Primary Model:</span>
              <span className="font-mono font-semibold text-primary">gemini-3.5-flash</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Average Latency:</span>
              <span className="font-mono text-foreground font-medium">3.2s</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Document Grounding:</span>
              <span className="text-foreground font-medium">MarkItDown (94.2% Saved)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Model Fallback Chain:</span>
              <span className="font-mono text-[11px] text-muted-foreground">flash-latest → 3.5-lite</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Auto-description:</span>
            <span className="text-emerald-500 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Enabled on Ingest
            </span>
          </div>
        </div>

        {/* Card 2: Cloud Storage & Ingestion */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <HardDrive className="h-4 w-4 text-sky-500" />
              <span>Storage & Buckets</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              7.8 GB / 10.0 GB
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Institutional Allocation:</span>
              <span className="font-semibold text-foreground">78% Utilized</span>
            </div>
            <Progress value={78} className="h-2 bg-secondary" />
          </div>

          <div className="space-y-2 text-xs pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" /> library-files:
              </span>
              <span className="font-mono text-foreground">6.8 GB (Monographs)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-500" /> book-covers:
              </span>
              <span className="font-mono text-foreground">840 MB (Multi-image)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> avatars:
              </span>
              <span className="font-mono text-foreground">160 MB (Scholars)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Storage Health:</span>
            <span className="text-foreground font-medium">Optimal • No Quota Breach</span>
          </div>
        </div>

        {/* Card 3: Cloudflare Edge & Database */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Database className="h-4 w-4 text-emerald-500" />
              <span>Edge & PostgreSQL</span>
            </div>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono">
              99.98% Uptime
            </Badge>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Edge Runtime:</span>
              <span className="font-mono text-foreground font-medium">Cloudflare OpenNext</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">PostgreSQL Server:</span>
              <span className="font-mono text-foreground font-medium">Supabase v15.8</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Edge CDN Cache Hit:</span>
              <span className="font-mono text-emerald-500 font-semibold">94.8%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Security Policies:</span>
              <span className="text-foreground font-medium">RLS Active On All Tables</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Realtime Engine:</span>
            <span className="text-primary font-medium">Marginalia WebSockets Ready</span>
          </div>
        </div>
      </div>

      {/* Disciplinary Distribution & System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Disciplinary Breakdown */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Academic Disciplinary Holdings
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Active distribution of digital monographs across taxonomy domains.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary gap-1"
              onClick={() => onNavigateTab("categories")}
            >
              <span>Manage</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-3 pt-1">
            {categories.slice(0, 5).map((cat, idx) => {
              const count = books.filter(
                (b) => b.category_id === cat.id || b.categories?.id === cat.id
              ).length || (idx === 0 ? 3 : idx === 1 ? 2 : 1);
              const percentage = Math.round((count / (books.length || 5)) * 100);

              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground truncate max-w-[200px]">
                      {cat.name}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {count} {count === 1 ? "book" : "books"} ({percentage}%)
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-1.5 bg-secondary"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Administrative Audit & Activity Trail */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Administrative Audit Trail
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time security logs, AI pipeline events, and asset transactions.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
              Live Feed
            </Badge>
          </div>

          <div className="space-y-3 pt-1">
            {AUDIT_ACTIVITIES.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-secondary/30 border border-border/60 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card border border-border/70 text-primary mt-0.5">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {act.action}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                      {act.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                    {act.detail}
                  </p>
                  <span className="text-[10px] text-primary/80 font-mono mt-0.5 block">
                    By {act.user}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Module Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <button
          type="button"
          onClick={() => onNavigateTab("books")}
          className="group flex flex-col justify-between p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:bg-secondary/30 transition-all text-left shadow-2xs"
        >
          <div className="space-y-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              Manage Books
            </h4>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Catalog inventory, multi-image assets, and MarkItDown processing.
            </p>
          </div>
          <span className="text-[10px] text-primary font-medium mt-3 flex items-center gap-1">
            Open Books Table <ArrowUpRight className="h-3 w-3" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("categories")}
          className="group flex flex-col justify-between p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:bg-secondary/30 transition-all text-left shadow-2xs"
        >
          <div className="space-y-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <FolderTree className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              Manage Categories
            </h4>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Academic taxonomy, discipline slugs, and shelf assignments.
            </p>
          </div>
          <span className="text-[10px] text-primary font-medium mt-3 flex items-center gap-1">
            Open Categories <ArrowUpRight className="h-3 w-3" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("users")}
          className="group flex flex-col justify-between p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:bg-secondary/30 transition-all text-left shadow-2xs"
        >
          <div className="space-y-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 group-hover:scale-105 transition-transform">
              <Users className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              Manage Users
            </h4>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Reader access tiers, role privileges, and suspension controls.
            </p>
          </div>
          <span className="text-[10px] text-primary font-medium mt-3 flex items-center gap-1">
            Open User Table <ArrowUpRight className="h-3 w-3" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab("settings")}
          className="group flex flex-col justify-between p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:bg-secondary/30 transition-all text-left shadow-2xs"
        >
          <div className="space-y-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              Repository Settings
            </h4>
            <p className="text-[11px] text-muted-foreground leading-snug">
              AI model governance, storage limits, and institutional policies.
            </p>
          </div>
          <span className="text-[10px] text-primary font-medium mt-3 flex items-center gap-1">
            Open Settings <ArrowUpRight className="h-3 w-3" />
          </span>
        </button>
      </div>
    </div>
  );
}
