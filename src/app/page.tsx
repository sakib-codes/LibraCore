"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookCard } from "@/components/shared/book-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Book, Category, FileType } from "@/integrations/supabase/types";

// Fallback Seed Catalog Data
const SAMPLE_CATEGORIES: Category[] = [
  { id: "c1", name: "Computer Science", slug: "computer-science", description: "Algorithms, Systems, Machine Learning", icon: "Cpu", display_order: 1, created_at: "" },
  { id: "c2", name: "Network Security", slug: "network-security", description: "Cryptography and defensive systems", icon: "Shield", display_order: 2, created_at: "" },
  { id: "c3", name: "Research Papers", slug: "research-papers", description: "Peer-reviewed scholarly monographs", icon: "FileText", display_order: 3, created_at: "" },
  { id: "c4", name: "Audio Books", slug: "audio-books", description: "High-fidelity audio editions and lectures", icon: "Headphones", display_order: 4, created_at: "" },
  { id: "c5", name: "eBooks & Literature", slug: "ebooks-literature", description: "Classics, philosophy, and essays", icon: "BookOpen", display_order: 5, created_at: "" },
];

const SAMPLE_BOOKS: (Book & { categories?: Category | null })[] = [
  {
    id: "b1",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    isbn: "978-1449373320",
    description: "The definitive guide to the architecture and storage systems powering modern reliable applications.",
    ai_summary: "Deep architectural principles covering consensus, partitioning, replication models, and distributed reliability.",
    category_id: "c1",
    cover_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_type: "PDF",
    file_size_bytes: 14500000,
    page_count: 616,
    duration_seconds: null,
    language: "English",
    publisher: "O'Reilly Media",
    published_year: 2017,
    is_featured: true,
    is_archived: false,
    download_count: 1420,
    view_count: 4890,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: SAMPLE_CATEGORIES[0],
  },
  {
    id: "b2",
    title: "The Art of Computer Programming, Vol 1",
    author: "Donald E. Knuth",
    isbn: "978-0201896831",
    description: "Fundamental Algorithms: the seminal classic in theoretical computer science.",
    ai_summary: "Foundational breakdown of memory allocation, trees, queues, and mathematical asymptotic runtime analysis.",
    category_id: "c1",
    cover_url: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80",
    file_url: "sample-data/taocp-v1.epub",
    file_type: "EPUB",
    file_size_bytes: 8200000,
    page_count: 672,
    duration_seconds: null,
    language: "English",
    publisher: "Addison-Wesley",
    published_year: 1997,
    is_featured: true,
    is_archived: false,
    download_count: 980,
    view_count: 3120,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: SAMPLE_CATEGORIES[0],
  },
  {
    id: "b3",
    title: "Meditations: Audio Edition & Commentary",
    author: "Marcus Aurelius",
    isbn: "978-0140449334",
    description: "Private personal reflections and stoic philosophical journal of the Roman Emperor.",
    ai_summary: "Twelve books analyzing mindfulness of mortality, emotional equanimity, and ethical leadership.",
    category_id: "c4",
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
    download_count: 2310,
    view_count: 7600,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: SAMPLE_CATEGORIES[3],
  },
  {
    id: "b4",
    title: "Deep Learning Foundations & Tensor Methods",
    author: "Ian Goodfellow, Yoshua Bengio",
    isbn: "978-0262035613",
    description: "A comprehensive textbook on deep learning covering neural networks, backpropagation, and generative models.",
    ai_summary: "Mathematical foundations of loss landscapes, optimization theory, and autoencoder architectures.",
    category_id: "c3",
    cover_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_type: "PDF",
    file_size_bytes: 22000000,
    page_count: 800,
    duration_seconds: null,
    language: "English",
    publisher: "MIT Press",
    published_year: 2016,
    is_featured: false,
    is_archived: false,
    download_count: 1890,
    view_count: 5200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: SAMPLE_CATEGORIES[2],
  },
];

function CatalogContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<(Book & { categories?: Category | null })[]>(SAMPLE_BOOKS);
  const [categories, setCategories] = useState<Category[]>(SAMPLE_CATEGORIES);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("ALL");
  const [savedBookIds, setSavedBookIds] = useState<Set<string>>(new Set(["b1"]));

  // Sync category & search from URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    const qParam = searchParams.get("q") || searchParams.get("search");
    if (qParam) {
      setSearchQuery(qParam);
    }
  }, [searchParams]);

  // Load books & categories from Supabase on mount
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [booksRes, catsRes] = await Promise.all([
          supabase
            .from("books")
            .select("*, categories(*)")
            .eq("is_archived", false)
            .order("created_at", { ascending: false }),
          supabase
            .from("categories")
            .select("*")
            .order("display_order", { ascending: true }),
        ]);

        if (catsRes.data && catsRes.data.length > 0) {
          setCategories(catsRes.data);
        }

        if (booksRes.data && booksRes.data.length > 0) {
          const mappedBooks = booksRes.data.map((b: any) => ({
            ...b,
            file_type: (b.file_type?.toUpperCase() || "PDF") as FileType,
          }));
          setBooks(mappedBooks);
        }
      } catch (err) {
        console.warn("Could not query Supabase catalog, using fallback seed catalog:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, []);

  // Sync user saved_books
  useEffect(() => {
    async function fetchSaved() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("saved_books")
          .select("book_id")
          .eq("user_id", user.id);

        if (!error && data) {
          setSavedBookIds(new Set((data as any[]).map((item) => item.book_id)));
        }
      } catch {
        // Fallback to local state
      }
    }
    fetchSaved();
  }, [user]);

  const toggleSave = async (bookId: string) => {
    const isCurrentlySaved = savedBookIds.has(bookId);

    // Optimistically update local UI
    setSavedBookIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) next.delete(bookId);
      else next.add(bookId);
      return next;
    });

    if (user) {
      try {
        if (isCurrentlySaved) {
          await (supabase
            .from("saved_books") as any)
            .delete()
            .match({ user_id: user.id, book_id: bookId });
          toast.info("Removed from your reading list");
        } else {
          await (supabase
            .from("saved_books") as any)
            .insert({ user_id: user.id, book_id: bookId });
          toast.success("Saved to your reading list!");
        }
      } catch (err) {
        toast.error("Failed to update bookmark in database.");
      }
    } else {
      toast.info(isCurrentlySaved ? "Removed from reading list" : "Saved to reading list (Sign in to sync across devices)");
    }
  };

  const filteredBooks = books.filter((book) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.description?.toLowerCase().includes(query) ||
      book.categories?.name?.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "all" ||
      book.category_id === selectedCategory ||
      book.categories?.slug === selectedCategory;

    const matchesFormat =
      selectedFormat === "ALL" || book.file_type === selectedFormat;

    return matchesSearch && matchesCategory && matchesFormat;
  });

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-indigo-500/10 via-background to-background p-6 sm:p-12 text-center shadow-xs">
        <div className="mx-auto max-w-3xl space-y-4">
          <Badge
            variant="secondary"
            className="gap-1.5 border-primary/20 bg-primary/10 text-primary py-1 px-3 text-xs font-semibold"
          >
            <Sparkles className="h-3.5 w-3.5" /> Intelligent Digital Library & AI Librarian
          </Badge>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Explore, Read & Research with{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              LibrisAI
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Access thousands of academic texts, research papers, ePubs, and audiobooks.
            Query any book interactively with our Google Gemini librarian.
          </p>

          {/* Search Bar */}
          <div className="relative mx-auto mt-6 max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search books by title, author, keyword, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-2xl bg-card pl-11 pr-4 text-sm shadow-md border-border/80 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* Category Pills & Format Filter */}
      <section id="categories" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Browse Academic Catalog
            </h2>
            <p className="text-xs text-muted-foreground">
              Showing {filteredBooks.length} of {books.length} digital resources
            </p>
          </div>

          {/* Format Tabs */}
          <Tabs
            value={selectedFormat}
            onValueChange={setSelectedFormat}
            className="w-full sm:w-auto overflow-x-auto"
          >
            <TabsList className="h-9 bg-muted/60 w-full sm:w-auto">
              <TabsTrigger value="ALL" className="text-xs flex-1 sm:flex-initial">All Formats</TabsTrigger>
              <TabsTrigger value="PDF" className="text-xs flex-1 sm:flex-initial">PDF</TabsTrigger>
              <TabsTrigger value="EPUB" className="text-xs flex-1 sm:flex-initial">ePub</TabsTrigger>
              <TabsTrigger value="AUDIO" className="text-xs flex-1 sm:flex-initial">Audio</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            size="sm"
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="h-8 rounded-full text-xs font-medium"
            onClick={() => setSelectedCategory("all")}
          >
            All Disciplines
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id || selectedCategory === cat.slug ? "default" : "outline"}
              className="h-8 rounded-full text-xs font-medium"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </section>

      {/* Books Grid */}
      <section id="featured">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isSaved={savedBookIds.has(book.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No matching books found"
            description="Try adjusting your keywords, category filter, or format selection."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedFormat("ALL");
                }}
              >
                Reset Search Filters
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Loading digital library catalog...</p>
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
