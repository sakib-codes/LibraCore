"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  History,
  BookOpen,
  ArrowRight,
  Download,
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
} from "lucide-react";
import { toast } from "sonner";
import { RoleLayout } from "@/components/layout/role-layout";
import { PageHeader } from "@/components/shared/page-header";
import { BookCard } from "@/components/shared/book-card";
import { EmptyState } from "@/components/shared/empty-state";
import { FileTypeBadge } from "@/components/shared/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Book, Category, FileType } from "@/integrations/supabase/types";

// Seed fallback data for guest / offline mode
const SAVED_BOOKS_SEED: (Book & { categories?: Category | null })[] = [
  {
    id: "b1",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    isbn: "978-1449373320",
    description: "Reliable, scalable, and maintainable data systems.",
    ai_summary: "Distributed architectures, replication, and consensus.",
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
      description: null,
      icon: "Cpu",
      display_order: 1,
      created_at: "",
    },
  },
  {
    id: "b3",
    title: "Meditations: Audio Edition & Commentary",
    author: "Marcus Aurelius",
    isbn: "978-0140449334",
    description: "Stoic philosophical journal.",
    ai_summary: "Mindfulness of mortality and emotional equanimity.",
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
      description: null,
      icon: "Headphones",
      display_order: 4,
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
    book_id: "b1",
    book_title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    file_type: "PDF",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    category_name: "Computer Science",
    date: "Oct 23, 2026",
  },
  {
    id: "d2",
    book_id: "b3",
    book_title: "Meditations: Audio Edition & Commentary",
    author: "Marcus Aurelius",
    file_type: "AUDIO",
    file_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    category_name: "Audio Books",
    date: "Oct 22, 2026",
  },
];

export default function StudentDashboardPage() {
  const { user, profile } = useAuth();
  const [savedBooks, setSavedBooks] = useState<(Book & { categories?: Category | null })[]>(SAVED_BOOKS_SEED);
  const [downloads, setDownloads] = useState<DownloadRecord[]>(DOWNLOAD_HISTORY_SEED);
  const [loading, setLoading] = useState(true);

  // Fetch live bookmarks & downloads
  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [savedRes, dlRes] = await Promise.all([
          supabase
            .from("saved_books")
            .select("id, book_id, created_at, books(*, categories(*))")
            .eq("user_id", user.id),
          supabase
            .from("downloads")
            .select("id, book_id, downloaded_at, books(id, title, author, file_type, file_url, categories(name))")
            .eq("user_id", user.id)
            .order("downloaded_at", { ascending: false }),
        ]);

        if (savedRes.data && savedRes.data.length > 0) {
          const mappedSaved = savedRes.data
            .filter((row: any) => row.books)
            .map((row: any) => ({
              ...row.books,
              file_type: (row.books.file_type?.toUpperCase() || "PDF") as FileType,
              categories: row.books.categories,
            }));
          setSavedBooks(mappedSaved);
        }

        if (dlRes.data && dlRes.data.length > 0) {
          const mappedDl: DownloadRecord[] = dlRes.data
            .filter((row: any) => row.books)
            .map((row: any) => ({
              id: row.id,
              book_id: row.book_id,
              book_title: row.books.title,
              author: row.books.author,
              file_type: (row.books.file_type?.toUpperCase() || "PDF") as FileType,
              file_url: row.books.file_url,
              category_name: row.books.categories?.name || "General",
              date: new Date(row.downloaded_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            }));
          setDownloads(mappedDl);
        }
      } catch (err) {
        console.warn("Could not load user library data from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [user]);

  const handleRemoveBookmark = async (bookId: string) => {
    setSavedBooks((prev) => prev.filter((b) => b.id !== bookId));
    if (user) {
      try {
        await (supabase
          .from("saved_books") as any)
          .delete()
          .match({ user_id: user.id, book_id: bookId });
        toast.info("Removed bookmark from your dashboard");
      } catch {
        toast.error("Failed to update database.");
      }
    } else {
      toast.info("Removed from saved resources");
    }
  };

  const handleReDownload = async (item: DownloadRecord) => {
    toast.success(`Starting download for ${item.book_title}...`);
    if (user) {
      try {
        await (supabase.from("downloads") as any).insert({
          user_id: user.id,
          book_id: item.book_id,
        });
      } catch (err) {
        console.warn("Could not re-log download:", err);
      }
    }
    if (item.file_url) {
      window.open(item.file_url, "_blank");
    }
  };

  // Compute unique categories explored
  const categoriesExploredCount = new Set([
    ...savedBooks.map((b) => b.categories?.name).filter(Boolean),
    ...downloads.map((d) => d.category_name).filter(Boolean),
  ]).size;

  return (
    <RoleLayout allow="user">
      <div className="space-y-6">
        <PageHeader
          title={`Welcome, ${profile?.full_name || profile?.name || "Academic Scholar"}`}
          subtitle="Manage your personal study bookmarks, reading queues, and offline downloads."
          action={
            <Button asChild size="sm" className="gap-2 bg-primary text-primary-foreground font-semibold">
              <Link href="/">
                <BookOpen className="h-4 w-4" /> Explore Catalog
              </Link>
            </Button>
          }
        />

        {/* Reader KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-primary">
                <Bookmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Saved Books</p>
                <h3 className="text-2xl font-extrabold text-foreground">{savedBooks.length}</h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Downloads</p>
                <h3 className="text-2xl font-extrabold text-foreground">{downloads.length}</h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Categories Explored</p>
                <h3 className="text-2xl font-extrabold text-foreground">{categoriesExploredCount || 1}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs: Saved vs Downloads */}
        <Tabs defaultValue="saved" className="space-y-4">
          <TabsList className="w-full flex-wrap sm:flex-nowrap justify-start overflow-x-auto h-auto bg-muted/50 p-1 gap-1">
            <TabsTrigger value="saved" className="gap-1.5 text-xs flex-1 sm:flex-initial">
              <Bookmark className="h-3.5 w-3.5" /> Saved Resources ({savedBooks.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs flex-1 sm:flex-initial">
              <History className="h-3.5 w-3.5" /> Download History ({downloads.length})
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-1.5 text-xs flex-1 sm:flex-initial">
              <User className="h-3.5 w-3.5" /> Profile & Goals
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SAVED BOOKS */}
          <TabsContent value="saved" className="space-y-4">
            {savedBooks.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {savedBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isSaved={true}
                    onToggleSave={() => handleRemoveBookmark(book.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bookmark}
                title="Your saved reading list is empty"
                description="Explore our digital repository and click the bookmark button on any book to add it to your queue."
                action={
                  <Button asChild size="sm">
                    <Link href="/">Browse Library Catalog</Link>
                  </Button>
                }
              />
            )}
          </TabsContent>

          {/* TAB 2: DOWNLOAD HISTORY */}
          <TabsContent value="history">
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
              {downloads.length > 0 ? (
                <Table className="min-w-[560px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book & Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Downloaded At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {downloads.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-semibold text-foreground">{item.book_title}</div>
                          <div className="text-xs text-muted-foreground">{item.author}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.category_name}
                        </TableCell>
                        <TableCell>
                          <FileTypeBadge type={item.file_type} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.date}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs gap-1"
                              onClick={() => handleReDownload(item)}
                            >
                              <Download className="h-3.5 w-3.5 text-primary" /> Re-download
                            </Button>
                            <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
                              <Link href={`/books/${item.book_id}`}>View</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  icon={Download}
                  title="No downloads recorded yet"
                  description="Books and academic media you download will appear in your permanent study log."
                  action={
                    <Button asChild size="sm">
                      <Link href="/">Explore Catalog</Link>
                    </Button>
                  }
                />
              )}
            </div>
          </TabsContent>

          {/* TAB 3: SCHOLAR PROFILE & PREFERENCES */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Profile Card */}
              <div className="md:col-span-5 rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-xl shadow-md">
                    {(profile?.full_name || profile?.name || user?.email || "U")
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">
                      {profile?.full_name || profile?.name || "Academic Scholar"}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="h-3.5 w-3.5 text-primary" /> {user?.email || "scholar@libris.ai"}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary border border-primary/20">
                      Active Scholar Account
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-semibold text-foreground">Computer Science & AI</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Scholar ID</span>
                    <span className="font-mono text-foreground font-semibold">
                      {user?.id ? user.id.substring(0, 13) + "..." : "SCH-8842-DLMS"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Library Access Tier</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Open Access Full Tier</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Account Status</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Study Goals & Cloud Storage Card */}
              <div className="md:col-span-7 space-y-4">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-bold text-foreground">Cloud Bookshelf Quota</h4>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">5.0 GB Allocated</span>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div className="bg-primary h-2.5 rounded-full w-[8%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>42.6 MB used across {savedBooks.length} saved volumes</span>
                    <span className="text-primary font-semibold">99.2% Free</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-bold text-foreground">Research Interests & Focus</h4>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground">
                      Distributed Systems
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground">
                      Theoretical Algorithms
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground">
                      Stoic Philosophy
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground">
                      Deep Learning Architectures
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RoleLayout>
  );
}
