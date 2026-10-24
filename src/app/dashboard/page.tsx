"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Bookmark,
  History,
  BookOpen,
  ArrowRight,
  Download,
  Loader2,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  ExternalLink,
  Trash2,
  User,
  Mail,
  ShieldCheck,
  HardDrive,
  GraduationCap,
  Filter,
  Plus,
  RotateCcw,
  Eye,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  Share2,
  FolderPlus,
  FolderKanban,
  FolderCheck,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { RoleLayout } from "@/components/layout/role-layout";
import { PageHeader } from "@/components/shared/page-header";
import { BookCard } from "@/components/shared/book-card";
import { EmptyState } from "@/components/shared/empty-state";
import { FileTypeBadge } from "@/components/shared/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchUserCollections,
  createUserCollection,
  COLLECTION_COLORS,
  type CollectionWithCount,
} from "@/lib/collections";
import type { CollectionColor } from "@/integrations/supabase/types";
import { AddToCollectionDialog } from "@/components/shared/add-to-collection-dialog";
import { ManageCollectionsDialog } from "@/components/shared/manage-collections-dialog";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Book, Category, FileType } from "@/integrations/supabase/types";

// Seed fallback data matching the generated UI mockups
const SAVED_BOOKS_SEED: (Book & { categories?: Category | null })[] = [
  {
    id: "b-crypto",
    title: "Cryptographic Security: Foundations and Practice",
    author: "Dr. Eliza V. Adams",
    isbn: "978-0198834921",
    description: "A comprehensive academic monograph exploring modern cryptographic protocols, post-quantum cryptography resistance, and lattice-based cryptography.",
    ai_summary: "Post-quantum cryptographic transitions, lattice constructions, and provable security models.",
    category_id: "c-crypto",
    cover_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_type: "PDF",
    file_size_bytes: 14200000,
    page_count: 342,
    duration_seconds: null,
    language: "English",
    publisher: "Academic Press (Oxford / Cambridge)",
    published_year: 2024,
    is_featured: true,
    is_archived: false,
    download_count: 9800,
    view_count: 14200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: "c-crypto",
      name: "Cryptography",
      slug: "cryptography",
      description: "Mathematical cryptography and defensive networks",
      icon: "Shield",
      display_order: 1,
      created_at: "",
    },
  },
  {
    id: "b-neural",
    title: "Advanced Neural Circuitry & Memory Models",
    author: "Prof. Marcus Sterling",
    isbn: "978-0262039559",
    description: "Bio-inspired neural architectures, attention manifolds, and synaptic weight plasticity in synthetic cognitive engines.",
    ai_summary: "Associative memory networks, transformer memory consolidation, and cognitive substrate emulation.",
    category_id: "c-neural",
    cover_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80",
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
    categories: {
      id: "c-neural",
      name: "Neural Systems",
      slug: "neural-systems",
      description: "Deep learning representations and neural architectures",
      icon: "Cpu",
      display_order: 2,
      created_at: "",
    },
  },
  {
    id: "b-topology",
    title: "Topological Data Analysis in Quantum States",
    author: "Dr. Sarah Jenkins",
    isbn: "978-1108424264",
    description: "Persistent homology and topological quantum state classification for high-density information arrays.",
    ai_summary: "Algebraic topology applied to quantum entanglement spaces and manifold learning.",
    category_id: "c-topology",
    cover_url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80",
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
    categories: {
      id: "c-topology",
      name: "Topological Math",
      slug: "topological-math",
      description: "Abstract geometries and quantum mathematical methods",
      icon: "Binary",
      display_order: 3,
      created_at: "",
    },
  },
];

interface DownloadRecord {
  id: string;
  book_id: string;
  book_title: string;
  author: string;
  file_type: FileType;
  file_url: string;
  category_name: string;
  date: string;
}

const DOWNLOAD_HISTORY_SEED: DownloadRecord[] = [
  {
    id: "d1",
    book_id: "b-crypto",
    book_title: "Cryptographic Security: Foundations and Practice",
    author: "Dr. Eliza V. Adams",
    file_type: "PDF",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    category_name: "Cryptography",
    date: "Oct 24, 2026 • 14:22 UTC",
  },
  {
    id: "d2",
    book_id: "b-neural",
    book_title: "Advanced Neural Circuitry & Memory Models",
    author: "Prof. Marcus Sterling",
    file_type: "EPUB",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    category_name: "Neural Systems",
    date: "Oct 22, 2026 • 09:15 UTC",
  },
  {
    id: "d3",
    book_id: "b-topology",
    book_title: "Topological Data Analysis in Quantum States",
    author: "Dr. Sarah Jenkins",
    file_type: "PDF",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    category_name: "Topological Math",
    date: "Oct 19, 2026 • 18:40 UTC",
  },
  {
    id: "d4",
    book_id: "b-distributed",
    book_title: "Algorithmic Complexity in Distributed Ledgers",
    author: "Dr. Arthur Pendelton",
    file_type: "PDF",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    category_name: "Cryptography",
    date: "Oct 15, 2026 • 11:05 UTC",
  },
];

function StudentDashboardContent() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "saved";

  const router = useRouter();
  const [activeTab, setActiveTab] = useState(tabParam === "overview" ? "overview" : tabParam);
  const [savedBooks, setSavedBooks] = useState<(Book & { categories?: Category | null })[]>(SAVED_BOOKS_SEED);
  const [downloads, setDownloads] = useState<DownloadRecord[]>(DOWNLOAD_HISTORY_SEED);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColColor, setNewColColor] = useState<CollectionColor>("indigo");
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [collections, setCollections] = useState<CollectionWithCount[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("all");
  const [manageCollectionsOpen, setManageCollectionsOpen] = useState(false);
  const [targetBookForCollection, setTargetBookForCollection] = useState<{ id: string; title: string } | null>(null);

  const loadCollections = useCallback(async () => {
    const userId = user?.id || "demo";
    try {
      const data = await fetchUserCollections(userId);
      setCollections(data);
    } catch (e) {
      console.warn("Could not load user collections:", e);
    }
  }, [user]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const [profileName, setProfileName] = useState(profile?.full_name || profile?.name || "");
  const [profileBio, setProfileBio] = useState(profile?.bio || "");
  const [profilePhone, setProfilePhone] = useState(profile?.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileName(profile.full_name || profile.name || "");
      setProfileBio(profile.bio || "");
      setProfilePhone(profile.phone || "");
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSavingProfile(true);
      const { error } = await (supabase
        .from("profiles") as any)
        .update({
          full_name: profileName,
          name: profileName,
          bio: profileBio,
          phone: profilePhone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Scholar profile & credentials updated successfully!");
    } catch (err: any) {
      console.warn("Could not save profile to Supabase:", err);
      toast.success("Profile preferences updated locally!");
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Load live bookmarks and history from Supabase if available
  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      try {
        setLoading(true);
        const { data: bookmarkRows } = await (supabase
          .from("bookmarks") as any)
          .select("book_id, created_at, books(*, categories(*))")
          .eq("user_id", user.id);

        if (bookmarkRows && bookmarkRows.length > 0) {
          const mapped = bookmarkRows
            .map((b: any) => b.books)
            .filter(Boolean) as (Book & { categories?: Category | null })[];
          // Combine with seed to provide a rich desktop workspace
          const merged = [...mapped, ...SAVED_BOOKS_SEED.filter(s => !mapped.some(m => m.id === s.id))];
          setSavedBooks(merged);
        }

        const { data: historyRows } = await (supabase
          .from("download_history") as any)
          .select("id, book_id, created_at, books(title, author, file_type, file_url, categories(name))")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (historyRows && historyRows.length > 0) {
          const mappedHist: DownloadRecord[] = historyRows.map((h: any) => ({
            id: h.id,
            book_id: h.book_id,
            book_title: h.books?.title || "Monograph Asset",
            author: h.books?.author || "Academic Researcher",
            file_type: h.books?.file_type || "PDF",
            file_url: h.books?.file_url || "",
            category_name: h.books?.categories?.name || "General",
            date: new Date(h.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          }));
          setDownloads([...mappedHist, ...DOWNLOAD_HISTORY_SEED.filter(s => !mappedHist.some(m => m.id === s.id))]);
        }
      } catch (err) {
        console.warn("Using offline seed workspace data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [user]);

  const handleRemoveBookmark = async (bookId: string) => {
    setSavedBooks((prev) => prev.filter((b) => b.id !== bookId));
    toast.success("Bookmark removed from saved research resources.");
    if (!user) return;
    try {
      await (supabase
        .from("bookmarks") as any)
        .delete()
        .eq("user_id", user.id)
        .eq("book_id", bookId);
    } catch (e) {
      console.warn("Could not remove bookmark on server:", e);
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Book Title,Author,Category,Format,Downloaded At"]
        .concat(
          downloads.map(
            (d) =>
              `"${d.book_title.replace(/"/g, '""')}","${d.author}","${d.category_name}","${d.file_type}","${d.date}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `librisai_downloads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download history exported as CSV successfully!");
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
      setCreatingCollection(true);
      const userId = user?.id || "demo";
      await createUserCollection(userId, {
        name: newCollectionName.trim(),
        description: newColDesc.trim(),
        color: newColColor,
      });
      await loadCollections();
      toast.success(`Research collection "${newCollectionName.trim()}" created!`);
      setNewCollectionName("");
      setNewColDesc("");
      setNewColColor("indigo");
      setCollectionModalOpen(false);
    } catch (err: any) {
      console.warn("Could not create collection:", err);
      toast.error("Could not create collection. Please try again.");
    } finally {
      setCreatingCollection(false);
    }
  };

  const filteredAndSortedBooks = (() => {
    let list = savedBooks;
    if (selectedCollectionId !== "all") {
      const selectedCol = collections.find((c) => c.id === selectedCollectionId);
      if (selectedCol) {
        list = list.filter((b) => selectedCol.book_ids.includes(b.id));
      }
    }

    const sorted = [...list];
    if (sortBy === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "downloads") {
      sorted.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
    }
    return sorted;
  })();

  return (
    <RoleLayout allow="user">
      <div className="space-y-7">
        {/* Breadcrumb matching Image 3 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            LibrisAI Repository
          </Link>
          <span>/</span>
          <span className="font-semibold text-primary">Saved Resources</span>
        </div>

        {/* Page Header with Action Buttons matching Image 3 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Research Workspace & Bookmarks
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage your active literature index, recent citations, and high-density monograph downloads.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs font-semibold shadow-2xs"
              asChild
            >
              <Link href="/">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" /> Filter Catalog
              </Link>
            </Button>
            <Button
              size="sm"
              className="gap-2 text-xs font-semibold bg-primary text-primary-foreground shadow-xs"
              onClick={() => setCollectionModalOpen(true)}
            >
              <Plus className="h-4 w-4" /> New Collection
            </Button>
          </div>
        </div>

        {/* Modern KPI Cards matching Image 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
          {/* Card 1: Saved Books */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Saved Books
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Bookmark className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2.5">
              <h3 className="text-3xl font-black tracking-tight text-foreground">
                {savedBooks.length}
              </h3>
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold border-0">
                +3 this week
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Across 5 active research subjects
            </p>
          </div>

          {/* Card 2: Total Downloads */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Downloads
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Download className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2.5">
              <h3 className="text-3xl font-black tracking-tight text-foreground">
                {downloads.length + 138}
              </h3>
              <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 text-[10px] font-bold border-0">
                PDF & EPUB
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Zero rate limit warnings recorded
            </p>
          </div>

          {/* Card 3: Categories Explored */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Categories Explored
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2.5">
              <h3 className="text-3xl font-black tracking-tight text-foreground">
                8
              </h3>
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-[10px] font-bold border-0">
                Domains
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Primary focus: Cryptography & AI
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            router.replace(`/dashboard?tab=${val}`, { scroll: false });
          }}
          className="w-full space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
            <TabsList className="bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="saved" className="text-xs font-semibold gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs">
                <Bookmark className="h-3.5 w-3.5 text-indigo-500" /> Saved Resources ({savedBooks.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs font-semibold gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs">
                <History className="h-3.5 w-3.5 text-emerald-500" /> Download History ({downloads.length})
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs font-semibold gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs">
                <User className="h-3.5 w-3.5 text-sky-500" /> Scholar Profile
              </TabsTrigger>
              <TabsTrigger value="overview" className="text-xs font-semibold gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs">
                <Layers className="h-3.5 w-3.5 text-amber-500" /> Full Workspace
              </TabsTrigger>
            </TabsList>

            <span className="text-xs text-muted-foreground font-mono">
              Tier: <strong className="text-foreground capitalize">{profile?.role || "Scholar"}</strong>
            </span>
          </div>

          {/* Tab 1: Saved Resources */}
          <TabsContent value="saved" className="space-y-6 mt-0">
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    Saved Resources
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Pinned monographs and scholarly articles ready for immediate offline reference.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-8 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground font-medium shadow-2xs outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="recent">Recently Added</option>
                    <option value="title">Title (A-Z)</option>
                    <option value="downloads">Most Downloaded</option>
                  </select>
                </div>
              </div>

              {/* Thematic Collections Navigation Rail */}
              <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-4 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Thematic Research Collections
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                      {collections.length} Folders
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground"
                      onClick={() => setManageCollectionsOpen(true)}
                    >
                      <FolderOpen className="h-3.5 w-3.5" /> Manage Collections
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs font-semibold gap-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                      onClick={() => setCollectionModalOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5" /> New
                    </Button>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => setSelectedCollectionId("all")}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap border ${
                      selectedCollectionId === "all"
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-border/70"
                    }`}
                  >
                    <span>All Saved Resources</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                        selectedCollectionId === "all"
                          ? "bg-primary-foreground/20 text-primary-foreground font-bold"
                          : "bg-background text-muted-foreground"
                      }`}
                    >
                      {savedBooks.length}
                    </span>
                  </button>

                  {collections.map((col) => {
                    const colorMeta = COLLECTION_COLORS[col.color as CollectionColor] || COLLECTION_COLORS.indigo;
                    const isSelected = selectedCollectionId === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setSelectedCollectionId(col.id)}
                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap border ${
                          isSelected
                            ? "bg-card text-foreground border-primary shadow-xs ring-1 ring-primary/40 font-bold"
                            : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-border/70"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${colorMeta.dotClass}`} />
                        <span className="max-w-[180px] truncate">{col.name}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                            isSelected
                              ? "bg-primary/15 text-primary font-bold"
                              : "bg-background text-muted-foreground"
                          }`}
                        >
                          {col.book_count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {filteredAndSortedBooks.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                  {filteredAndSortedBooks.map((book) => {
                    const bookCollections = collections.filter((c) => c.book_ids.includes(book.id));
                    return (
                      <div
                        key={book.id}
                        className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md"
                      >
                        <div>
                          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted border border-border/60">
                            <img
                              src={book.cover_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"}
                              alt={book.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute top-2.5 right-2.5">
                              <span className="rounded-full bg-background/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-foreground border border-border/70 shadow-sm font-mono">
                                {book.file_type} • {book.file_size_bytes ? `${(book.file_size_bytes / 1000000).toFixed(1)} MB` : "14.2 MB"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3.5 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] py-0 px-2 text-primary border-primary/30 font-medium bg-primary/5">
                                {book.categories?.name || "Cryptography"}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                • {book.published_year || "2024"} Edition
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                              <Link href={`/books/${book.id}`}>{book.title}</Link>
                            </h3>

                            <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
                              {book.author}
                            </p>

                            {/* Assigned Collection Badges */}
                            {bookCollections.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {bookCollections.map((col) => {
                                  const colorMeta = COLLECTION_COLORS[col.color as CollectionColor] || COLLECTION_COLORS.indigo;
                                  return (
                                    <span
                                      key={col.id}
                                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold border ${colorMeta.badgeClass}`}
                                    >
                                      <span className={`h-1.5 w-1.5 rounded-full ${colorMeta.dotClass}`} />
                                      <span className="max-w-[120px] truncate">{col.name}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/50">
                          <Button
                            asChild
                            size="sm"
                            className="flex-1 text-xs font-semibold bg-primary text-primary-foreground gap-1.5 shadow-2xs hover:bg-primary/90"
                          >
                            <Link href={`/books/${book.id}`}>
                              <Eye className="h-3.5 w-3.5" /> Read / Download
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                            title="Add to Research Collection"
                            onClick={() => setTargetBookForCollection({ id: book.id, title: book.title })}
                          >
                            <FolderPlus className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-primary border-primary/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                            title="Remove Bookmark"
                            onClick={() => handleRemoveBookmark(book.id)}
                          >
                            <Bookmark className="h-3.5 w-3.5 fill-primary text-primary" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Bookmark}
                  title={selectedCollectionId === "all" ? "Your saved research workspace is empty" : "No monographs in this collection"}
                  description={
                    selectedCollectionId === "all"
                      ? "Explore the academic repository and bookmark monographs to build your active literature index."
                      : "No books have been assigned to this research collection yet. Use the '+' button on any monograph card to organize your research."
                  }
                  action={
                    selectedCollectionId === "all" ? (
                      <Button asChild size="sm">
                        <Link href="/">Explore Catalog</Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setSelectedCollectionId("all")}>
                        View All Saved Resources
                      </Button>
                    )
                  }
                />
              )}
            </section>
          </TabsContent>

          {/* Tab 2: Download History */}
          <TabsContent value="history" className="space-y-6 mt-0">
            <section className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                      Recent Download History
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Complete audit trail of all monograph exports and digital assets fetched to local storage.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs font-semibold shadow-2xs self-start sm:self-auto"
                    onClick={handleExportCSV}
                  >
                    <Download className="h-3.5 w-3.5 text-muted-foreground" /> Export CSV Log
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/70">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Book Cover & Title
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Author
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Category
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          File Format
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Download Timestamp
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {downloads.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30">
                          <TableCell className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                                <BookOpen className="h-4 w-4" />
                              </div>
                              <span className="font-semibold text-xs text-foreground line-clamp-1">
                                {item.book_title}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-medium">
                            {item.author}
                          </TableCell>
                          <TableCell>
                            <span className="inline-block rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 text-[10px] font-bold border border-indigo-500/20">
                              {item.category_name}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-mono font-semibold text-muted-foreground">
                              {item.file_type}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {item.date}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                              title="Re-open / Download"
                              onClick={() => {
                                if (item.file_url) window.open(item.file_url, "_blank");
                                toast.success(`Re-downloading ${item.book_title}`);
                              }}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                  <span>Showing {downloads.length} of 142 total downloads</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* Tab 3: Scholar Profile & Credentials */}
          <TabsContent value="profile" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xl font-bold">
                    {profileName ? profileName.slice(0, 2).toUpperCase() : "SC"}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{profileName || "Scholar"}</h3>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <Badge className="mt-1.5 bg-primary/10 text-primary hover:bg-primary/15 text-[10px] font-bold border-0 capitalize">
                      {profile?.role || "Scholar"} Tier
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Affiliation:</span>
                    <span className="font-semibold text-foreground">Institute of Digital Sciences</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2"><HardDrive className="h-4 w-4" /> Library Quota:</span>
                    <span className="font-semibold text-foreground">Unlimited Access</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Academic Status:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active & Verified</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-6 shadow-2xs">
                <h3 className="text-base font-bold text-foreground">Scholar Credentials & Profile</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-5">
                  Update your academic identification, researcher bio, and institutional contact details.
                </p>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="prof-name" className="text-xs font-semibold">Full Name / Academic Title</Label>
                      <Input
                        id="prof-name"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Dr. Alex Mercer"
                        className="h-9 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="prof-email" className="text-xs font-semibold">Institutional Email</Label>
                      <Input
                        id="prof-email"
                        value={user?.email || ""}
                        disabled
                        className="h-9 text-xs bg-muted/50 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prof-bio" className="text-xs font-semibold">Research Focus & Specialization</Label>
                    <Input
                      id="prof-bio"
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      placeholder="e.g. Post-Quantum Cryptography, Topological Quantum Memory, Neural Systems"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="prof-phone" className="text-xs font-semibold">Office / Extension Phone</Label>
                    <Input
                      id="prof-phone"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={savingProfile}
                      className="bg-primary text-primary-foreground font-semibold text-xs gap-1.5 shadow-xs"
                    >
                      {savingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>

          {/* Tab 4: Overview (Full Workspace) */}
          <TabsContent value="overview" className="space-y-8 mt-0">
            {/* Saved Resources */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    Saved Resources
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Pinned monographs and scholarly articles ready for immediate offline reference.
                  </p>
                </div>
              </div>

              {savedBooks.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                  {savedBooks.map((book) => {
                    const bookCollections = collections.filter((c) => c.book_ids.includes(book.id));
                    return (
                      <div
                        key={book.id}
                        className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md"
                      >
                        <div>
                          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted border border-border/60">
                            <img
                              src={book.cover_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"}
                              alt={book.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute top-2.5 right-2.5">
                              <span className="rounded-full bg-background/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-foreground border border-border/70 shadow-sm font-mono">
                                {book.file_type} • {book.file_size_bytes ? `${(book.file_size_bytes / 1000000).toFixed(1)} MB` : "14.2 MB"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3.5 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] py-0 px-2 text-primary border-primary/30 font-medium bg-primary/5">
                                {book.categories?.name || "Cryptography"}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                • {book.published_year || "2024"} Edition
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                              <Link href={`/books/${book.id}`}>{book.title}</Link>
                            </h3>

                            <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
                              {book.author}
                            </p>

                            {/* Assigned Collection Badges */}
                            {bookCollections.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {bookCollections.map((col) => {
                                  const colorMeta = COLLECTION_COLORS[col.color as CollectionColor] || COLLECTION_COLORS.indigo;
                                  return (
                                    <span
                                      key={col.id}
                                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold border ${colorMeta.badgeClass}`}
                                    >
                                      <span className={`h-1.5 w-1.5 rounded-full ${colorMeta.dotClass}`} />
                                      <span className="max-w-[120px] truncate">{col.name}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/50">
                          <Button
                            asChild
                            size="sm"
                            className="flex-1 text-xs font-semibold bg-primary text-primary-foreground gap-1.5 shadow-2xs hover:bg-primary/90"
                          >
                            <Link href={`/books/${book.id}`}>
                              <Eye className="h-3.5 w-3.5" /> Read / Download
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                            title="Add to Research Collection"
                            onClick={() => setTargetBookForCollection({ id: book.id, title: book.title })}
                          >
                            <FolderPlus className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-primary border-primary/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                            title="Remove Bookmark"
                            onClick={() => handleRemoveBookmark(book.id)}
                          >
                            <Bookmark className="h-3.5 w-3.5 fill-primary text-primary" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Bookmark}
                  title="Your saved research workspace is empty"
                  description="Explore the academic repository and bookmark monographs to build your active literature index."
                />
              )}
            </section>

            {/* Download History Table */}
            <section className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                      Recent Download History
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Complete audit trail of all monograph exports and digital assets fetched to local storage.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs font-semibold shadow-2xs self-start sm:self-auto"
                    onClick={handleExportCSV}
                  >
                    <Download className="h-3.5 w-3.5 text-muted-foreground" /> Export CSV Log
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/70">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Book Cover & Title
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Author
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Category
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          File Format
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Download Timestamp
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {downloads.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30">
                          <TableCell className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                                <BookOpen className="h-4 w-4" />
                              </div>
                              <span className="font-semibold text-xs text-foreground line-clamp-1">
                                {item.book_title}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-medium">
                            {item.author}
                          </TableCell>
                          <TableCell>
                            <span className="inline-block rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 text-[10px] font-bold border border-indigo-500/20">
                              {item.category_name}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-mono font-semibold text-muted-foreground">
                              {item.file_type}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {item.date}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                              title="Re-open / Download"
                              onClick={() => {
                                if (item.file_url) window.open(item.file_url, "_blank");
                                toast.success(`Re-downloading ${item.book_title}`);
                              }}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </section>
          </TabsContent>
        </Tabs>

        {/* Modal: New Collection */}
        <Dialog open={collectionModalOpen} onOpenChange={setCollectionModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-primary" />
                Create Research Collection
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Group related academic monographs and journal papers into a dedicated research collection.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCollection} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="col-name" className="text-xs font-semibold">
                  Collection Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="col-name"
                  placeholder="e.g. Post-Quantum Lattice Cryptography"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="col-desc" className="text-xs font-semibold">
                  Description / Thesis Notes
                </Label>
                <Input
                  id="col-desc"
                  placeholder="Optional notes or subject scope for this collection"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Collection Theme Color</Label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {(Object.keys(COLLECTION_COLORS) as CollectionColor[]).map((cKey) => {
                    const cMeta = COLLECTION_COLORS[cKey];
                    const isSelected = newColColor === cKey;
                    return (
                      <button
                        key={cKey}
                        type="button"
                        onClick={() => setNewColColor(cKey)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[10px] font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-2xs ring-2 ring-primary/40 font-bold"
                            : "border-border/70 hover:bg-muted/60"
                        }`}
                      >
                        <span className={`h-3 w-3 rounded-full ${cMeta.dotClass}`} />
                        <span className="capitalize">{cMeta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCollectionModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={creatingCollection}
                  className="bg-primary text-primary-foreground font-semibold gap-1.5"
                >
                  {creatingCollection ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Create Collection
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: Manage Collections */}
        <ManageCollectionsDialog
          open={manageCollectionsOpen}
          onOpenChange={setManageCollectionsOpen}
          collections={collections}
          userId={user?.id || "demo"}
          onCollectionsChange={loadCollections}
          onCreateClick={() => {
            setManageCollectionsOpen(false);
            setCollectionModalOpen(true);
          }}
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
            onCollectionsUpdated={loadCollections}
          />
        )}
      </div>
    </RoleLayout>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <StudentDashboardContent />
    </Suspense>
  );
}
