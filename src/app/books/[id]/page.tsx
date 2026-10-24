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
  FolderPlus,
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
import { AddToCollectionDialog } from "@/components/shared/add-to-collection-dialog";
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
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);

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
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation matching Image 2 */}
      <Breadcrumb>
        <BreadcrumbList className="text-xs">
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="hover:text-foreground">Catalog</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/#${book.categories?.slug || "general"}`} className="hover:text-foreground">
              {book.categories?.name || "Cybersecurity"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[260px] truncate sm:max-w-md font-semibold text-foreground">
              {book.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 2-Column Desktop Grid matching Image 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Book Header & In-Browser Reader (approx 65% width) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Book Header Card matching Image 2 */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-2xs">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Cover Thumbnail with shadow & border */}
              <div className="relative aspect-[3/4] w-36 sm:w-44 shrink-0 rounded-xl overflow-hidden shadow-md border border-border/70 bg-muted self-center sm:self-start">
                <img
                  src={book.cover_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"}
                  alt={book.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Book Details */}
              <div className="flex-1 space-y-3">
                {/* Badges matching Image 2 */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 text-[10px] font-bold">
                    {book.file_type}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
                    {book.categories?.name || "Cybersecurity"}
                  </Badge>
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0 text-[10px] font-bold">
                    Open Access
                  </Badge>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-snug">
                  {book.title}
                </h1>

                {/* Author & Publisher */}
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  By <span className="font-semibold text-foreground">{book.author}</span> • {book.publisher || "Academic Press (Oxford / Cambridge)"}
                </p>

                {/* Rating, Citations, Downloads, Year matching Image 2 */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
                  <span className="flex items-center gap-1 font-semibold text-amber-500">
                    ★ 4.8 <span className="font-normal text-muted-foreground">(128 citations)</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    {(book.download_count || 9800).toLocaleString()} downloads
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Published {book.published_year || 2025}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed pt-1">
                  {book.description ||
                    "A comprehensive academic monograph exploring modern cryptographic protocols, post-quantum cryptography resistance, lattice-based cryptography, and provable security frameworks. Essential reading for researchers, engineers, and graduate scholars specializing in high-assurance systems."}
                </p>

                {/* Action Buttons matching Image 2: Download Resource (indigo) + Save Bookmark + Share */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <Button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="gap-2 bg-primary text-primary-foreground font-semibold px-5 text-xs shadow-2xs hover:bg-primary/90"
                  >
                    {downloading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    Download Resource
                  </Button>

                  <Button
                    variant={isSaved ? "secondary" : "outline"}
                    size="sm"
                    className="gap-1.5 text-xs font-semibold shadow-2xs"
                    onClick={handleToggleSave}
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-primary text-primary" : ""}`} />
                    {isSaved ? "Saved to Workspace" : "Save Bookmark"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs font-semibold shadow-2xs hover:bg-muted"
                    onClick={() => setCollectionDialogOpen(true)}
                  >
                    <FolderPlus className="h-3.5 w-3.5 text-indigo-500" />
                    Add to Collection
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg shadow-2xs"
                    onClick={handleShare}
                    title="Share link"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* In-Browser Document & Media Viewer */}
          <section className="space-y-3">
            <BookPreviewReader
              title={book.title}
              author={book.author}
              fileUrl={book.file_url}
              fileType={book.file_type}
              durationSeconds={book.duration_seconds}
              pageCount={book.page_count}
              onDownload={handleDownload}
            />
          </section>
        </div>

        {/* Right Column: Dedicated Ask Gemini AI Panel (approx 35% width matching Image 2) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 space-y-4">
          <BookAiPanel
            bookTitle={book.title}
            author={book.author}
            category={book.categories?.name || "Cybersecurity"}
            description={book.description || ""}
            variant="embedded"
          />
        </div>
      </div>

      {/* Add To Collection Modal */}
      {collectionDialogOpen && (
        <AddToCollectionDialog
          open={collectionDialogOpen}
          onOpenChange={setCollectionDialogOpen}
          bookId={book.id}
          bookTitle={book.title}
          userId={user?.id || "demo"}
        />
      )}
    </div>
  );
}
