"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Sparkles,
  Filter,
  GraduationCap,
  Cpu,
  Binary,
  Compass,
  Headphones,
  Atom,
  Loader2,
  Bookmark,
  ArrowRight,
  Shield,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
  X,
  RotateCcw,
  Network,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookCard } from "@/components/shared/book-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { AddToCollectionDialog } from "@/components/shared/add-to-collection-dialog";
import {
  CatalogFilterModal,
  FilterCriteria,
  DEFAULT_FILTER_CRITERIA,
} from "@/components/shared/catalog-filter-modal";
import { useAuth } from "@/hooks/use-auth";
import { LandingPage } from "@/components/auth/landing-page";
import { supabase } from "@/integrations/supabase/client";
import type { Book, Category, FileType } from "@/integrations/supabase/types";

// Fallback Seed Catalog Data matching Image 2, 3, 5
const SAMPLE_CATEGORIES: Category[] = [
  { id: "c1", name: "Computer Science", slug: "computer-science", description: "Algorithms, Systems, Machine Learning", icon: "Cpu", display_order: 1, created_at: "" },
  { id: "c2", name: "Cybersecurity & Crypto", slug: "cybersecurity", description: "Cryptography and post-quantum security", icon: "Shield", display_order: 2, created_at: "" },
  { id: "c3", name: "Neural Systems & AI", slug: "neural-systems", description: "Transformer architectures, attention mechanisms, LLMs", icon: "Sparkles", display_order: 3, created_at: "" },
  { id: "c4", name: "Topological Math", slug: "topological-math", description: "Algebraic topology, persistent homology, quantum manifolds", icon: "Binary", display_order: 4, created_at: "" },
  { id: "c5", name: "Audio Books & Lectures", slug: "audio-books", description: "Scholarly audio recordings and lectures", icon: "Headphones", display_order: 5, created_at: "" },
];

const SAMPLE_BOOKS: (Book & { categories?: Category | null })[] = [
  {
    id: "b-crypto",
    title: "Cryptographic Security: Foundations and Practice",
    author: "Dr. Eliza V. Adams",
    isbn: "978-0198834921",
    description: "A comprehensive academic monograph exploring modern cryptographic protocols, post-quantum cryptography resistance, and lattice-based cryptography.",
    ai_summary: "Post-quantum cryptographic transitions, lattice constructions, and provable security models.",
    category_id: "c2",
    cover_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_type: "PDF",
    file_size_bytes: 14200000,
    page_count: 342,
    duration_seconds: null,
    language: "English",
    publisher: "Academic Press (Oxford / Cambridge)",
    published_year: 2025,
    is_featured: true,
    is_archived: false,
    download_count: 9800,
    view_count: 14200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: SAMPLE_CATEGORIES[1],
  },
  {
    id: "b-deep-gen",
    title: "Foundations of Deep Generative Networks",
    author: "Dr. Aris Thorne",
    isbn: "978-0262045611",
    description: "A comprehensive treatise on modern probabilistic modeling, score-based generative systems, and transformer architectures in academic contexts.",
    ai_summary: "Diffusion models, continuous score matching, and latent variable generative formulations.",
    category_id: "c3",
    cover_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_type: "PDF",
    file_size_bytes: 18500000,
    page_count: 480,
    duration_seconds: null,
    language: "English",
    publisher: "MIT Press",
    published_year: 2024,
    is_featured: true,
    is_archived: false,
    download_count: 6720,
    view_count: 12100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: SAMPLE_CATEGORIES[2],
  },
  {
    id: "b-llm-retrieval",
    title: "Large Language Models in Scholarly Retrieval",
    author: "Elena Rostova",
    isbn: "978-1492080510",
    description: "Investigating retrieval-augmented generation pipelines for automated academic literature reviews and precise citation tracing.",
    ai_summary: "Dense embedding retrieval, vector indexing, and hallucinations mitigation in scholarly synthesis.",
    category_id: "c3",
    cover_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_type: "PDF",
    file_size_bytes: 11400000,
    page_count: 360,
    duration_seconds: null,
    language: "English",
    publisher: "Stanford Univ. Press",
    published_year: 2024,
    is_featured: true,
    is_archived: false,
    download_count: 8430,
    view_count: 15300,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: SAMPLE_CATEGORIES[2],
  },
  {
    id: "b-neural-circuitry",
    title: "Advanced Neural Circuitry & Memory Models",
    author: "Prof. Marcus Sterling",
    isbn: "978-0262039559",
    description: "Bio-inspired neural architectures, attention manifolds, and synaptic weight plasticity in synthetic cognitive engines.",
    ai_summary: "Associative memory networks, transformer memory consolidation, and cognitive substrate emulation.",
    category_id: "c3",
    cover_url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_type: "EPUB",
    file_size_bytes: 8500000,
    page_count: 420,
    duration_seconds: null,
    language: "English",
    publisher: "LibrisAI Press",
    published_year: 2024,
    is_featured: true,
    is_archived: false,
    download_count: 3450,
    view_count: 8900,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: SAMPLE_CATEGORIES[2],
  },
  {
    id: "b-topology-quantum",
    title: "Topological Data Analysis in Quantum States",
    author: "Dr. Sarah Jenkins",
    isbn: "978-1108424264",
    description: "Persistent homology and topological quantum state classification for high-density information arrays.",
    ai_summary: "Algebraic topology applied to quantum entanglement spaces and manifold learning.",
    category_id: "c4",
    cover_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_type: "PDF",
    file_size_bytes: 22100000,
    page_count: 512,
    duration_seconds: null,
    language: "English",
    publisher: "Cambridge Monograph Series",
    published_year: 2023,
    is_featured: true,
    is_archived: false,
    download_count: 2100,
    view_count: 6700,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: SAMPLE_CATEGORIES[3],
  },
  {
    id: "b-audio-meditations",
    title: "Meditations: Audio Edition & Academic Commentary",
    author: "Marcus Aurelius",
    isbn: "978-0140449334",
    description: "Private personal reflections and stoic philosophical journal of the Roman Emperor with academic annotations.",
    ai_summary: "Twelve books analyzing mindfulness of mortality, emotional equanimity, and ethical leadership.",
    category_id: "c5",
    cover_url: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80",
    file_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    file_type: "AUDIO",
    file_size_bytes: 48500000,
    page_count: null,
    duration_seconds: 18450,
    language: "English",
    publisher: "LibrisAI Classical Editions",
    published_year: 2024,
    is_featured: true,
    is_archived: false,
    download_count: 4210,
    view_count: 9800,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: SAMPLE_CATEGORIES[4],
  },
];

function CatalogHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "all";
  const { user } = useAuth();

  const [books, setBooks] = useState<(Book & { categories?: Category | null })[]>(SAMPLE_BOOKS);
  const [categories, setCategories] = useState<Category[]>(SAMPLE_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedFormat, setSelectedFormat] = useState<string>("ALL");
  const [savedBookIds, setSavedBookIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [targetBookForCollection, setTargetBookForCollection] = useState<{ id: string; title: string } | null>(null);

  // Milestone 12: Advanced Filter Criteria State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(DEFAULT_FILTER_CRITERIA);

  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [queryParam]);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoading(true);
        const { data: dbCategories } = await (supabase
          .from("categories") as any)
          .select("*")
          .order("display_order", { ascending: true });

        if (dbCategories && dbCategories.length > 0) {
          setCategories(dbCategories);
        }

        const { data: dbBooks } = await (supabase
          .from("books") as any)
          .select("*, categories(*)")
          .eq("is_archived", false)
          .order("created_at", { ascending: false });

        if (dbBooks && dbBooks.length > 0) {
          const merged = [...dbBooks, ...SAMPLE_BOOKS.filter(s => !dbBooks.some((b: any) => b.id === s.id))];
          setBooks(merged);
        }

        if (user) {
          const { data: savedRows } = await (supabase
            .from("saved_books") as any)
            .select("book_id")
            .eq("user_id", user.id);

          if (savedRows) {
            setSavedBookIds(new Set(savedRows.map((b: any) => b.book_id)));
          }
        }
      } catch (err) {
        console.warn("Using sample fallback catalog:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, [user]);

  const toggleSave = async (bookId: string) => {
    if (!user) {
      toast.info("Sign in to save books to your personal library queue.");
      return;
    }

    const nextSaved = new Set(savedBookIds);
    const isSaved = nextSaved.has(bookId);

    if (isSaved) {
      nextSaved.delete(bookId);
      setSavedBookIds(nextSaved);
      toast.info("Removed from saved reading queue.");
      await (supabase.from("saved_books") as any).delete().eq("user_id", user.id).eq("book_id", bookId);
    } else {
      nextSaved.add(bookId);
      setSavedBookIds(nextSaved);
      toast.success("Saved to reading queue!");
      await (supabase.from("saved_books") as any).insert({ user_id: user.id, book_id: bookId });
    }
  };

  const activeFiltersCount = [
    filterCriteria.minYear > 2010 || filterCriteria.maxYear < 2026,
    filterCriteria.accessTier !== "all",
    filterCriteria.format !== "ALL",
    filterCriteria.minRating > 0,
    filterCriteria.sortBy !== "popular",
  ].filter(Boolean).length;

  const filteredBooks = books
    .filter((book) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        (book.description && book.description.toLowerCase().includes(q)) ||
        (book.isbn && book.isbn.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === "all" ||
        book.category_id === selectedCategory ||
        book.categories?.slug === selectedCategory;

      const activeFmt = filterCriteria.format !== "ALL" ? filterCriteria.format : selectedFormat;
      const matchesFormat = activeFmt === "ALL" || book.file_type === activeFmt;

      const year = book.published_year || 2024;
      const matchesYear = year >= filterCriteria.minYear && year <= filterCriteria.maxYear;

      const matchesAccessTier =
        filterCriteria.accessTier === "all" ||
        (filterCriteria.accessTier === "open-access" && (book.file_type === "PDF" || book.is_featured)) ||
        (filterCriteria.accessTier === "peer-reviewed" && (book.publisher?.toLowerCase().includes("press") || book.download_count > 5000));

      const matchesRating =
        filterCriteria.minRating === 0 ||
        (filterCriteria.minRating <= 4.0) ||
        (filterCriteria.minRating <= 4.5 && (book.download_count > 5000 || book.is_featured)) ||
        (filterCriteria.minRating <= 4.8 && book.is_featured);

      return matchesSearch && matchesCategory && matchesFormat && matchesYear && matchesAccessTier && matchesRating;
    })
    .sort((a, b) => {
      if (filterCriteria.sortBy === "recent") {
        return (b.published_year || 2024) - (a.published_year || 2024);
      }
      if (filterCriteria.sortBy === "citations") {
        return (b.view_count || 0) - (a.view_count || 0);
      }
      if (filterCriteria.sortBy === "year") {
        return (b.published_year || 0) - (a.published_year || 0);
      }
      return (b.download_count || 0) - (a.download_count || 0);
    });


  return (
    <div className="space-y-6">
      {/* Live Academic Repository Network Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 px-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-2xs text-xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-foreground tracking-tight">Institutional Repository Protocol</span>
          <span className="text-border">|</span>
          <span className="text-muted-foreground hidden md:inline">MIT • Oxford • Cambridge • Stanford Indexed Nodes</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground font-mono text-[11px]">
          <Link
            href="/landing"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-sans font-medium text-indigo-600 dark:text-indigo-400 hover:underline mr-1"
          >
            <Sparkles className="h-3 w-3" />
            <span>Platform Overview</span>
          </Link>
          <span>4,280,150 Digital Objects</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">99.98% Protocol Uptime</span>
        </div>
      </div>

      {/* 2-Column Desktop Layout matching Image 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 items-start">
        {/* Left Side Rail (Mockup Image 5: Repository Search & Active Collections) */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-20">
          {/* Repository Search Card matching Image 5 */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-foreground tracking-tight">Repository Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Filter monographs by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 h-10 text-xs rounded-xl bg-muted/40 border-border/70"
              />
            </div>

            {/* Quick Tag Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setSearchQuery("Machine Learning")}
                className="rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2.5 py-1 text-[11px] font-medium hover:bg-indigo-500/20 transition-colors"
              >
                Machine Learning
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedFormat("PDF");
                  setFilterCriteria((prev) => ({ ...prev, format: "PDF" }));
                }}
                className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-medium hover:bg-emerald-500/20 transition-colors"
              >
                Open Access
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedFormat("AUDIO");
                  setFilterCriteria((prev) => ({ ...prev, format: "AUDIO" }));
                }}
                className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 text-[11px] font-medium hover:bg-amber-500/20 transition-colors"
              >
                Audio Lectures
              </button>
            </div>
          </div>

          {/* Active Collections Card matching Image 5 */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <h3 className="font-bold text-sm text-foreground tracking-tight">Active Collections</h3>
              <span className="text-[10px] text-muted-foreground font-mono">MIT/Harvard Index</span>
            </div>

            <div className="space-y-2 text-xs">
              <Link
                href="/?q=neural"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/60 transition-colors text-foreground font-medium"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="truncate">Neural Architecture Archives</span>
                </div>
                <span className="text-muted-foreground font-mono text-[11px]">1,420</span>
              </Link>

              <Link
                href="/?q=quantum"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/60 transition-colors text-foreground font-medium"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="truncate">Quantum Computing Index</span>
                </div>
                <span className="text-muted-foreground font-mono text-[11px]">850</span>
              </Link>

              <Link
                href="/?q=linguistics"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/60 transition-colors text-foreground font-medium"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="truncate">Computational Linguistics</span>
                </div>
                <span className="text-muted-foreground font-mono text-[11px]">2,115</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Main Content (Streamlined & Space-Efficient) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Featured Monograph Highlights - Compact Scholarly Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Featured 1 */}
            <div className="rounded-xl border border-border/70 bg-card/60 hover:bg-card p-3 shadow-2xs transition-colors flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 text-[10px] font-medium py-0 px-1.5 border-0">
                    Featured Text
                  </Badge>
                  <span className="text-[10px] text-muted-foreground truncate font-mono">Dr. Aris Thorne • MIT</span>
                </div>
                <h3 className="font-medium text-xs sm:text-sm text-foreground/95 tracking-tight truncate">
                  Foundations of Deep Generative Networks
                </h3>
              </div>
              <Button asChild size="sm" variant="outline" className="h-7 px-2.5 text-xs font-medium shrink-0 rounded-lg hover:bg-secondary">
                <Link href="/books/b-deep-gen">
                  <span>Access</span>
                  <ArrowRight className="h-3 w-3 ml-1 text-muted-foreground" />
                </Link>
              </Button>
            </div>

            {/* Featured 2 */}
            <div className="rounded-xl border border-border/70 bg-card/60 hover:bg-card p-3 shadow-2xs transition-colors flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-medium py-0 px-1.5 border-0">
                    Open Access
                  </Badge>
                  <span className="text-[10px] text-muted-foreground truncate font-mono">Elena Rostova • Stanford</span>
                </div>
                <h3 className="font-medium text-xs sm:text-sm text-foreground/95 tracking-tight truncate">
                  Large Language Models in Scholarly Retrieval
                </h3>
              </div>
              <Button asChild size="sm" variant="outline" className="h-7 px-2.5 text-xs font-medium shrink-0 rounded-lg hover:bg-secondary">
                <Link href="/books/b-llm-retrieval">
                  <span>Access</span>
                  <ArrowRight className="h-3 w-3 ml-1 text-muted-foreground" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Catalog Format & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Scholarly Monograph Index
              </h2>
              <p className="text-xs text-muted-foreground">
                Showing {filteredBooks.length} indexed publications and media items
              </p>
            </div>

            {/* Filter Trigger & Format Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={activeFiltersCount > 0 ? "default" : "outline"}
                size="sm"
                onClick={() => setIsFilterModalOpen(true)}
                className="h-9 px-3 text-xs font-semibold gap-1.5 shadow-2xs"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filter & Refine</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-0.5 rounded-full bg-primary-foreground/20 px-1.5 py-0.2 text-[10px] font-mono">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {/* Format Tabs */}
              <Tabs
                value={selectedFormat}
                onValueChange={(val) => {
                  setSelectedFormat(val);
                  setFilterCriteria((prev) => ({ ...prev, format: val as any }));
                }}
                className="w-full sm:w-auto"
              >
                <TabsList className="h-9 bg-muted/60 p-1">
                  <TabsTrigger value="ALL" className="text-xs font-medium">All Formats</TabsTrigger>
                  <TabsTrigger value="PDF" className="text-xs font-medium">PDF</TabsTrigger>
                  <TabsTrigger value="EPUB" className="text-xs font-medium">ePub</TabsTrigger>
                  <TabsTrigger value="AUDIO" className="text-xs font-medium">Audio</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* View Mode Switcher (Compact Grid vs Dense List) */}
              <div className="flex items-center rounded-lg border border-border/80 bg-secondary/50 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    viewMode === "grid"
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Compact Grid View"
                  aria-label="Compact Grid View"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    viewMode === "list"
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Dense Scholarly List View"
                  aria-label="Dense Scholarly List View"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Discipline Badges */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedCategory === "all" ? "default" : "outline"}
              className="h-8 rounded-full text-xs font-semibold shadow-2xs"
              onClick={() => setSelectedCategory("all")}
            >
              All Disciplines
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                variant={selectedCategory === cat.id || selectedCategory === cat.slug ? "default" : "outline"}
                className="h-8 rounded-full text-xs font-medium shadow-2xs"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Active Filter Chips Bar (Milestone 12) */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl border border-primary/20 bg-primary/5 text-xs">
              <span className="text-[11px] font-bold text-primary flex items-center gap-1 mr-1">
                <Filter className="h-3 w-3" /> Active Filters:
              </span>
              {(filterCriteria.minYear > 2010 || filterCriteria.maxYear < 2026) && (
                <Badge variant="outline" className="text-[11px] bg-card gap-1 py-0.5 border-border">
                  <span>Year: {filterCriteria.minYear}–{filterCriteria.maxYear}</span>
                  <X
                    className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setFilterCriteria({ ...filterCriteria, minYear: 2010, maxYear: 2026 })}
                  />
                </Badge>
              )}
              {filterCriteria.accessTier !== "all" && (
                <Badge variant="outline" className="text-[11px] bg-card gap-1 py-0.5 border-border">
                  <span>Tier: {filterCriteria.accessTier === "open-access" ? "Open Access" : "Peer Reviewed"}</span>
                  <X
                    className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setFilterCriteria({ ...filterCriteria, accessTier: "all" })}
                  />
                </Badge>
              )}
              {filterCriteria.format !== "ALL" && (
                <Badge variant="outline" className="text-[11px] bg-card gap-1 py-0.5 border-border">
                  <span>Format: {filterCriteria.format}</span>
                  <X
                    className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setFilterCriteria({ ...filterCriteria, format: "ALL" });
                      setSelectedFormat("ALL");
                    }}
                  />
                </Badge>
              )}
              {filterCriteria.minRating > 0 && (
                <Badge variant="outline" className="text-[11px] bg-card gap-1 py-0.5 border-border">
                  <span>Rating: ★ {filterCriteria.minRating}+</span>
                  <X
                    className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setFilterCriteria({ ...filterCriteria, minRating: 0 })}
                  />
                </Badge>
              )}
              {filterCriteria.sortBy !== "popular" && (
                <Badge variant="outline" className="text-[11px] bg-card gap-1 py-0.5 border-border">
                  <span>Sort: {filterCriteria.sortBy}</span>
                  <X
                    className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setFilterCriteria({ ...filterCriteria, sortBy: "popular" })}
                  />
                </Badge>
              )}
              <button
                type="button"
                onClick={() => {
                  setFilterCriteria(DEFAULT_FILTER_CRITERIA);
                  setSelectedFormat("ALL");
                }}
                className="text-[11px] text-muted-foreground hover:text-primary underline ml-auto font-medium"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Monographs Catalog - Responsive Grid or Dense Scholarly List */}
          <section id="featured-books">
            {loading ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
                    : "flex flex-col gap-2.5"
                }
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <LoadingSkeleton key={i} variant={viewMode === "grid" ? "card" : "row"} />
                ))}
              </div>
            ) : filteredBooks.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
                    : "flex flex-col gap-2.5"
                }
              >
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isSaved={savedBookIds.has(book.id)}
                    onToggleSave={toggleSave}
                    onAddToCollection={(target) => setTargetBookForCollection(target)}
                    variant={viewMode}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No matching scholarly texts found"
                description="Try clearing your search filters or select All Disciplines."
                action={
                  <Button size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSelectedFormat("ALL"); }}>
                    Reset Filters
                  </Button>
                }
              />
            )}
          </section>
        </div>
      </div>

      {/* Advanced Catalog Multi-Filter Modal (Milestone 12) */}
      <CatalogFilterModal
        open={isFilterModalOpen}
        onOpenChange={setIsFilterModalOpen}
        criteria={filterCriteria}
        onApply={(applied) => {
          setFilterCriteria(applied);
          if (applied.format !== "ALL") {
            setSelectedFormat(applied.format);
          }
          toast.success("Catalog filters updated!");
        }}
        onReset={() => {
          setFilterCriteria(DEFAULT_FILTER_CRITERIA);
          setSelectedFormat("ALL");
          toast.info("Catalog filters reset.");
        }}
        totalResultsCount={filteredBooks.length}
      />

      {/* Modal: Add to Collection */}
      {targetBookForCollection && (
        <AddToCollectionDialog
          open={!!targetBookForCollection}
          onOpenChange={(open) => {
            if (!open) setTargetBookForCollection(null);
          }}
          bookId={targetBookForCollection.id}
          bookTitle={targetBookForCollection.title}
          userId={user?.id || "demo"}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();

  // If user is authenticated, render the Monograph Catalog Explorer ("this screen")
  if (user) {
    return (
      <Suspense
        fallback={
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
            <Loader2 className="h-9 w-9 animate-spin text-primary" />
          </div>
        }
      >
        <CatalogHome />
      </Suspense>
    );
  }

  // During initial auth check, render a clean, precisely centered full-screen loader
  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
      </div>
    );
  }

  // Otherwise, the index should always be the landing page!
  return <LandingPage />;
}
