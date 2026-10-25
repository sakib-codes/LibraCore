"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Network,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Share2,
  Info,
  Layers,
  Compass,
  GraduationCap,
  GitBranch,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from "@/hooks/use-auth";
import { CitationGraphView } from "@/components/catalog/citation-graph-view";

function GraphContent() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("focus") || undefined;

  return (
    <div className="space-y-6">
      {/* Interactive Graph Surface */}
      <CitationGraphView initialFocusId={focusId} />

      {/* Scholarly Topology Guide & Methodology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="rounded-2xl border border-border/70 bg-card/60 dark:bg-[#121620]/80 p-5 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400">
              <GitBranch className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Directed Citation Edges</h3>
              <p className="text-[11px] text-muted-foreground">Predecessors & Descendants</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Arrows illustrate knowledge transfer: a directed link from Monograph A to Paper B indicates that Monograph A cites and builds upon B&apos;s mathematical theorems, empirical benchmarks, or algorithmic architecture.
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 dark:bg-[#121620]/80 p-5 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/25 text-sky-400">
              <Layers className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Disciplinary Clustering</h3>
              <p className="text-[11px] text-muted-foreground">Topological Field Groupings</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Node colors categorize academic faculties: Sky Blue for Neural Systems, Indigo for Cryptography, Soft Purple for Distributed Systems, and Emerald for Quantum Topology. Filter by field to isolate disciplinary sub-networks.
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 dark:bg-[#121620]/80 p-5 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400">
              <GraduationCap className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">In-Library Synchronization</h3>
              <p className="text-[11px] text-muted-foreground">Direct Manuscript Deep Links</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Nodes encircled with dual halo rings represent full monographs cataloged in LibrisAI. Click any node to open its research synopsis or immediately launch the full typeset text in our high-DPI reader.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CitationGraphPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirectTo=/catalog/graph");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-14rem)] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-mono">
          Verifying citation topology access permissions...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top Academic Navigation Bar */}
      <div className="border-b border-border/80 bg-background/90 backdrop-blur-md sticky top-16 z-30">
        <div className="mx-auto flex max-w-[1720px] items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-xs">
                  Repository Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-xs">
                  Catalog
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Network className="h-3.5 w-3.5 text-primary" />
                  Citation Network Graph
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Link href="/">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Catalog Grid
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-8 pt-6">
        {/* Page Hero Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/25">
                Academic Topology & Bibliometrics
              </Badge>
              <span className="text-xs text-muted-foreground">• Live Interactive Physics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Interactive Citation Graph & Academic Network
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              Visualize cross-monograph citations, co-authorship dependencies, and foundational scientific milestones across theoretical computer science, cryptography, and neural architectures.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                <BookOpen className="h-3.5 w-3.5" />
                My Research Workspace
              </Button>
            </Link>
          </div>
        </div>

        {/* Suspense-guarded Graph Component for searchParams */}
        <Suspense
          fallback={
            <div className="h-[800px] w-full rounded-2xl border border-border/80 bg-secondary/20 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs text-muted-foreground">Initializing academic network simulation…</p>
            </div>
          }
        >
          <GraphContent />
        </Suspense>
      </main>
    </div>
  );
}
