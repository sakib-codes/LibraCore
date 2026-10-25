"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  Network,
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
import { formatBytes, formatDuration, getAllCoverImages } from "@/lib/utils";
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
  "b-crypto": {
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
    categories: {
      id: "c2",
      name: "Cybersecurity & Crypto",
      slug: "cybersecurity",
      description: "Cryptography and post-quantum security",
      icon: "Shield",
      display_order: 2,
      created_at: "",
    },
  },
  "b-deep-gen": {
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
    categories: {
      id: "c3",
      name: "Neural Systems & AI",
      slug: "neural-systems",
      description: "Transformer architectures, attention mechanisms, LLMs",
      icon: "Sparkles",
      display_order: 3,
      created_at: "",
    },
  },
  "b-llm-retrieval": {
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
    categories: {
      id: "c3",
      name: "Neural Systems & AI",
      slug: "neural-systems",
      description: "Transformer architectures, attention mechanisms, LLMs",
      icon: "Sparkles",
      display_order: 3,
      created_at: "",
    },
  },
  "b-neural-circuitry": {
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
    categories: {
      id: "c3",
      name: "Neural Systems & AI",
      slug: "neural-systems",
      description: "Transformer architectures, attention mechanisms, LLMs",
      icon: "Sparkles",
      display_order: 3,
      created_at: "",
    },
  },
  "b-topology-quantum": {
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
    categories: {
      id: "c4",
      name: "Topological Math",
      slug: "topological-math",
      description: "Algebraic topology, persistent homology, quantum manifolds",
      icon: "Binary",
      display_order: 4,
      created_at: "",
    },
  },
  "b-audio-meditations": {
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
    download_count: 2310,
    view_count: 7600,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: {
      id: "c5",
      name: "Audio Books & Lectures",
      slug: "audio-books",
      description: "Scholarly audio recordings and lectures",
      icon: "Headphones",
      display_order: 5,
      created_at: "",
    },
  },
};

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = typeof params?.id === "string" ? params.id : "b-crypto";
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirectTo=/books/${bookId}`);
    }
  }, [user, authLoading, router, bookId]);

  const [book, setBook] = useState<BookWithCategory>(
    SEED_CATALOG[bookId] || SEED_CATALOG["b-crypto"] || SEED_CATALOG["b1"]
  );
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [downloadCount, setDownloadCount] = useState(book.download_count);
  const [downloading, setDownloading] = useState(false);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
            .eq("user_id", user.id)
            .eq("book_id", book.id);
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

  if (authLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-14rem)] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-mono">Verifying monograph access permissions...</p>
      </div>
    );
  }

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
              {/* Cover Thumbnail with shadow & border, plus multi-image preview gallery */}
              {(() => {
                const allImages = getAllCoverImages(book.cover_url);
                const activeSrc = allImages[activeImageIndex] || allImages[0];
                return (
                  <div className="flex flex-col items-center sm:items-start shrink-0 self-center sm:self-start">
                    <div className="relative aspect-[3/4] w-36 sm:w-44 shrink-0 rounded-xl overflow-hidden shadow-md border border-border/70 bg-muted">
                      <img
                        src={activeSrc}
                        alt={book.title}
                        className="h-full w-full object-cover transition-opacity duration-200"
                      />
                      {allImages.length > 1 && (
                        <div className="absolute top-2 left-2 pointer-events-none">
                          <span className="rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs backdrop-blur-xs font-mono">
                            {activeImageIndex === 0
                              ? "Cover"
                              : `Preview ${activeImageIndex + 1}/${allImages.length}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Multi-image preview thumbnail switcher */}
                    {allImages.length > 1 && (
                      <div className="flex items-center gap-1.5 pt-2 max-w-[176px] overflow-x-auto pb-0.5">
                        {allImages.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImageIndex(idx)}
                            className={`relative h-11 w-8 rounded-md overflow-hidden border transition-all shrink-0 cursor-pointer ${
                              activeImageIndex === idx
                                ? "border-primary ring-2 ring-primary/40 scale-105"
                                : "border-border/70 opacity-60 hover:opacity-100"
                            }`}
                            title={idx === 0 ? "Book Cover" : `Preview Page ${idx + 1}`}
                          >
                            <img
                              src={imgUrl}
                              alt={`Thumbnail ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}


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
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground/95 leading-snug">
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

                  <Link href={`/catalog/graph?focus=${book.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs font-semibold shadow-2xs hover:bg-muted text-indigo-400 border-indigo-500/30 hover:border-indigo-500/50"
                      title="Explore cross-citations, precedents & descendants in the Citation Graph"
                    >
                      <Network className="h-3.5 w-3.5 text-indigo-400" />
                      Citation Graph
                    </Button>
                  </Link>

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
              id={book.id}
              bookId={book.id}
              title={book.title}
              author={book.author}
              fileUrl={book.file_url}
              fileType={book.file_type}
              durationSeconds={book.duration_seconds}
              pageCount={book.page_count}
              onDownload={handleDownload}
              description={book.description || undefined}
            />
          </section>
        </div>

        {/* Right Column: Dedicated Ask Libris AI Panel (approx 35% width matching Image 2) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 space-y-4">
          <BookAiPanel
            bookTitle={book.title}
            author={book.author}
            category={book.categories?.name || "Cybersecurity"}
            description={book.description || ""}
            fileUrl={book.file_url}
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
