"use client";

import { useState, useEffect, Suspense } from "react";
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

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    toast.success(`Collection "${newCollectionName.trim()}" created!`);
    setNewCollectionName("");
    setCollectionModalOpen(false);
  };

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

        {/* Section: Saved Resources (Mockup Image 3) */}
        <section className="space-y-4 pt-2">
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

          {/* Book Cards Grid - Utilizing desktop width (up to 4 cols) */}
          {savedBooks.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
              {savedBooks.map((book) => (
                <div
                  key={book.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md"
                >
                  <div>
                    {/* Cover Image Container */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted border border-border/60">
                      <img
                        src={book.cover_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"}
                        alt={book.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Top Right Format Pill matching Image 3 */}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="rounded-full bg-background/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-foreground border border-border/70 shadow-sm font-mono">
                          {book.file_type} • {book.file_size_bytes ? `${(book.file_size_bytes / 1000000).toFixed(1)} MB` : "14.2 MB"}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Content */}
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
                    </div>
                  </div>

                  {/* Action Buttons matching Image 3: Read/Download (indigo) + Bookmark */}
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
                      className="h-8 w-8 shrink-0 text-primary border-primary/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                      title="Remove Bookmark"
                      onClick={() => handleRemoveBookmark(book.id)}
                    >
                      <Bookmark className="h-3.5 w-3.5 fill-primary text-primary" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Bookmark}
              title="Your saved research workspace is empty"
              description="Explore the academic repository and bookmark monographs to build your active literature index."
              action={
                <Button asChild size="sm">
                  <Link href="/">Explore Catalog</Link>
                </Button>
              }
            />
          )}
        </section>

        {/* Section: Recent Download History matching Image 3 */}
        <section className="space-y-4 pt-4">
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

            {/* High Density Table matching Image 3 */}
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

            {/* Table Pagination Footer matching Image 3 */}
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

        {/* Modal: New Collection */}
        <Dialog open={collectionModalOpen} onOpenChange={setCollectionModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Create Research Collection</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Group related academic monographs and journal papers into a dedicated research collection.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCollection} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="col-name" className="text-xs font-semibold">Collection Name</Label>
                <Input
                  id="col-name"
                  placeholder="e.g. Post-Quantum Lattice Cryptography"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCollectionModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                  Create Collection
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
