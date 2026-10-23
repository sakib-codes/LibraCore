"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BookOpen,
  Bookmark,
  Download,
  Share2,
  Calendar,
  Globe,
  Building2,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FileTypeBadge } from "@/components/shared/status-badge";
import { BookPreviewReader } from "@/components/shared/book-preview-reader";
import { BookAiPanel } from "@/components/shared/book-ai-panel";
import { formatBytes, formatDuration } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Book, Category, FileType } from "@/integrations/supabase/types";

// Book with strongly typed FileType and joined Category
type BookWithCategory = Omit<Book, "file_type"> & {
  file_type: FileType;
  categories: Category;
};

// Seed fallback library
const SEED_CATALOG: Record<string, BookWithCategory> = {
  b1: {
    id: "b1",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    isbn: "978-1449373320",
    description:
      "Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability. In addition, we have an overwhelming variety of tools to process and store data, including relational databases, NoSQL datastores, stream or batch processors, and message brokers. This book helps software architects and engineers navigate this diverse landscape.",
    ai_summary:
      "A seminal engineering work on distributed systems, data models, consensus algorithms, replication logs, and event-driven architectures for high-throughput computing.",
    category_id: "c1",
    cover_url:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
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
    categories: {
      id: "c1",
      name: "Computer Science",
      slug: "computer-science",
      description: "Systems, ML, and Architecture",
      icon: "Cpu",
      display_order: 1,
      created_at: "",
    },
  },
  b2: {
    id: "b2",
    title: "The Art of Computer Programming, Vol 1",
    author: "Donald E. Knuth",
    isbn: "978-0201896831",
    description:
      "Fundamental Algorithms: information structures, linear lists, trees, multilinked structures, dynamic storage allocation, and mathematical analysis of asymptotic algorithms.",
    ai_summary:
      "Foundational breakdown of memory allocation, trees, queues, and mathematical asymptotic runtime analysis.",
    category_id: "c1",
    cover_url:
      "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
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
    categories: {
      id: "c1",
      name: "Computer Science",
      slug: "computer-science",
      description: "Theoretical & Applied CS",
      icon: "Cpu",
      display_order: 1,
      created_at: "",
    },
  },
  b3: {
    id: "b3",
    title: "Meditations: Audio Edition & Commentary",
    author: "Marcus Aurelius",
    isbn: "978-0140449334",
    description:
      "Private personal reflections and stoic philosophical journal of the Roman Emperor. Recorded with scholarly commentary on leadership, mindfulness, and equanimity.",
    ai_summary:
      "Twelve books analyzing mindfulness of mortality, emotional equanimity, and ethical leadership in high-stakes environments.",
    category_id: "c4",
    cover_url:
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80",
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
    categories: {
      id: "c4",
      name: "Audio Books",
      slug: "audio-books",
      description: "Audio editions and lectures",
      icon: "Headphones",
      display_order: 4,
      created_at: "",
    },
  },
};

export default function BookDetailPage() {
  const params = useParams();
  const bookId = typeof params?.id === "string" ? params.id : "b1";
  const { user } = useAuth();

  const [book, setBook] = useState<BookWithCategory>(
    SEED_CATALOG[bookId] || SEED_CATALOG["b1"]
  );
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [downloadCount, setDownloadCount] = useState(book.download_count);
  const [downloading, setDownloading] = useState(false);

  // Fetch book from Supabase
  useEffect(() => {
    async function loadBook() {
      try {
        const { data, error } = await supabase
          .from("books")
          .select("*, categories(*)")
          .eq("id", bookId)
          .maybeSingle();

        if (!error && data) {
          const d = data as any;
          const formatted: BookWithCategory = {
            ...d,
            file_type: (d.file_type?.toUpperCase() || "PDF") as FileType,
            categories: d.categories || {
              id: "c-general",
              name: "General Catalog",
              slug: "general",
              description: null,
              icon: "BookOpen",
              display_order: 99,
              created_at: "",
            },
          };
          setBook(formatted);
          setDownloadCount(formatted.download_count);
        } else if (SEED_CATALOG[bookId]) {
          setBook(SEED_CATALOG[bookId]);
          setDownloadCount(SEED_CATALOG[bookId].download_count);
        }
      } catch (err) {
        console.warn("Could not query book from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [bookId]);

  // Check if bookmarked
  useEffect(() => {
    async function checkSaved() {
      if (!user || !book?.id) return;
      try {
        const { data } = await supabase
          .from("saved_books")
          .select("id")
          .eq("user_id", user.id)
          .eq("book_id", book.id)
          .maybeSingle();

        setIsSaved(!!data);
      } catch {
        // Fallback
      }
    }
    checkSaved();
  }, [user, book?.id]);

  const handleToggleSave = async () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    if (user && book?.id) {
      try {
        if (nextSaved) {
          await (supabase
            .from("saved_books") as any)
            .insert({ user_id: user.id, book_id: book.id });
          toast.success("Added to your saved reading list!");
        } else {
          await (supabase
            .from("saved_books") as any)
            .delete()
            .match({ user_id: user.id, book_id: book.id });
          toast.info("Removed from your reading list");
        }
      } catch {
        toast.error("Could not sync bookmark with database.");
      }
    } else {
      toast.info(nextSaved ? "Added to your saved books!" : "Removed from your saved books!");
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadCount((prev) => prev + 1);

    if (user && book?.id) {
      try {
        // Records download in Supabase (trigger auto-increments download_count on books)
        await (supabase.from("downloads") as any).insert({
          user_id: user.id,
          book_id: book.id,
        });
      } catch (err) {
        console.warn("Could not record download:", err);
      }
    }

    toast.success(`Download ready for "${book.title}"`);

    // Initiate file open or download
    if (book.file_url) {
      if (typeof window !== "undefined") {
        window.open(book.file_url, "_blank");
      }
    }
    setTimeout(() => setDownloading(false), 800);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Resource link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Catalog</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/#${book.categories?.slug || "general"}`}>
              {book.categories?.name || "All Disciplines"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[200px] truncate sm:max-w-xs">
              {book.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Book Metadata Overview Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Cover Column */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
            <div className="relative aspect-[3/4] w-full max-w-[240px] rounded-2xl overflow-hidden shadow-lg border border-border/80 bg-muted">
              <img
                src={book.cover_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
                alt={book.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <FileTypeBadge type={book.file_type} className="backdrop-blur-md bg-background/90" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-4 w-full max-w-[240px]">
              <Button
                variant={isSaved ? "secondary" : "outline"}
                size="sm"
                className="flex-1 gap-1.5 text-xs font-medium"
                onClick={handleToggleSave}
              >
                <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-primary text-primary" : ""}`} />
                {isSaved ? "Saved" : "Save Bookmark"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={handleShare}
                title="Share link"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            <div className="space-y-1.5">
              <Badge variant="outline" className="text-xs">
                {book.categories?.name || "Academic Resource"}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {book.title}
              </h1>
              <p className="text-base text-muted-foreground font-medium">by {book.author}</p>
            </div>

            {/* Primary Action Buttons Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground font-semibold px-5 shadow-sm justify-center"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download Resource ({downloadCount.toLocaleString()} downloads)
              </Button>

              <BookAiPanel
                bookTitle={book.title}
                author={book.author}
                category={book.categories?.name || "General"}
                description={book.description || ""}
              />
            </div>

            {/* AI Summary Highlight Box */}
            {book.ai_summary && (
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" /> AI Executive Synthesis
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  {book.ai_summary}
                </p>
              </div>
            )}

            {/* Detailed Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Overview & Description
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {book.description || "No full description is currently available for this resource."}
              </p>
            </div>

            <Separator />

            {/* Specification Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block">Publisher</span>
                <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <Building2 className="h-3 w-3 text-primary" /> {book.publisher || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Published</span>
                <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3 text-primary" /> {book.published_year || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Language</span>
                <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <Globe className="h-3 w-3 text-primary" /> {book.language || "English"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">File Size</span>
                <span className="font-semibold text-foreground font-mono mt-0.5 block">
                  {formatBytes(book.file_size_bytes)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-Browser Reader / Media Viewer */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> In-Browser Document & Media Preview
          </h2>
        </div>

        <BookPreviewReader
          title={book.title}
          author={book.author}
          fileUrl={book.file_url}
          fileType={book.file_type}
          durationSeconds={book.duration_seconds}
          onDownload={handleDownload}
        />
      </section>
    </div>
  );
}
