"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Download,
  HardDrive,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  ShieldAlert,
  Search,
  Filter,
  FolderTree,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { RoleLayout } from "@/components/layout/role-layout";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { FileTypeBadge, StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/shared/user-avatar";
import { supabase } from "@/integrations/supabase/client";
import type { Book, Category, Profile, FileType } from "@/integrations/supabase/types";

// Fallback seed data
const FALLBACK_CATEGORIES: Category[] = [
  { id: "c1", name: "Computer Science", slug: "computer-science", description: "Algorithms, Systems, Machine Learning", icon: "Cpu", display_order: 1, created_at: "" },
  { id: "c2", name: "Network Security", slug: "network-security", description: "Cryptography and defensive systems", icon: "Shield", display_order: 2, created_at: "" },
  { id: "c3", name: "Research Papers", slug: "research-papers", description: "Peer-reviewed scholarly monographs", icon: "FileText", display_order: 3, created_at: "" },
  { id: "c4", name: "Audio Books", slug: "audio-books", description: "High-fidelity audio editions and lectures", icon: "Headphones", display_order: 4, created_at: "" },
  { id: "c5", name: "eBooks & Literature", slug: "ebooks-literature", description: "Classics, philosophy, and essays", icon: "BookOpen", display_order: 5, created_at: "" },
];

const FALLBACK_BOOKS: (Book & { categories?: Category | null })[] = [
  {
    id: "b1",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    isbn: "978-1449373320",
    description: "The definitive guide to the architecture and storage systems powering modern reliable applications.",
    ai_summary: "Distributed architectures, consensus, replication, and data systems.",
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
    categories: FALLBACK_CATEGORIES[0],
  },
  {
    id: "b2",
    title: "The Art of Computer Programming, Vol 1",
    author: "Donald E. Knuth",
    isbn: "978-0201896831",
    description: "Fundamental Algorithms: information structures and mathematical runtime analysis.",
    ai_summary: "Foundational breakdown of data structures and asymptotic runtime analysis.",
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
    categories: FALLBACK_CATEGORIES[0],
  },
  {
    id: "b3",
    title: "Meditations: Audio Edition & Commentary",
    author: "Marcus Aurelius",
    isbn: "978-0140449334",
    description: "Private personal reflections and stoic philosophical journal of the Roman Emperor.",
    ai_summary: "Twelve books analyzing emotional equanimity and ethical leadership.",
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
    categories: FALLBACK_CATEGORIES[3],
  },
];

const FALLBACK_USERS: Profile[] = [
  { id: "u1", name: "System Administrator", full_name: "System Administrator", email: "admin@libris.ai", phone: null, bio: null, role: "admin", is_suspended: false, avatar_url: null, created_at: "", updated_at: "" },
  { id: "u2", name: "Alice Rahman", full_name: "Alice Rahman", email: "student@libris.ai", phone: null, bio: null, role: "user", is_suspended: false, avatar_url: null, created_at: "" , updated_at: "" },
  { id: "u3", name: "David Miller", full_name: "David Miller", email: "david.m@university.edu", phone: null, bio: null, role: "user", is_suspended: true, avatar_url: null, created_at: "", updated_at: "" },
];

export default function AdminDashboardPage() {
  const [books, setBooks] = useState<(Book & { categories?: Category | null })[]>(FALLBACK_BOOKS);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [users, setUsers] = useState<Profile[]>(FALLBACK_USERS);
  const [loading, setLoading] = useState(true);

  // Search & Filters for books tab
  const [bookSearch, setBookSearch] = useState("");
  const [bookCategoryFilter, setBookCategoryFilter] = useState("all");

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "book" | "category" } | null>(null);

  // Add Book Dialog State
  const [newBookOpen, setNewBookOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newFormat, setNewFormat] = useState<FileType>("PDF");
  const [newDescription, setNewDescription] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Add Category State
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");

  // Load live data from Supabase
  useEffect(() => {
    async function loadAdminData() {
      try {
        const [booksRes, catsRes, usersRes] = await Promise.all([
          supabase
            .from("books")
            .select("*, categories(*)")
            .order("created_at", { ascending: false }),
          supabase
            .from("categories")
            .select("*")
            .order("display_order", { ascending: true }),
          supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

        if (catsRes.data && catsRes.data.length > 0) {
          const loadedCats = catsRes.data as unknown as Category[];
          setCategories(loadedCats);
          if (!newCategoryId && loadedCats[0]) setNewCategoryId(loadedCats[0].id);
        } else if (FALLBACK_CATEGORIES[0]) {
          setNewCategoryId(FALLBACK_CATEGORIES[0].id);
        }

        if (booksRes.data && booksRes.data.length > 0) {
          const mapped = (booksRes.data as any[]).map((b: any) => ({
            ...b,
            file_type: (b.file_type?.toUpperCase() || "PDF") as FileType,
          }));
          setBooks(mapped);
        }

        if (usersRes.data && usersRes.data.length > 0) {
          setUsers(usersRes.data as unknown as Profile[]);
        }
      } catch (err) {
        console.warn("Could not query Supabase in Admin, using fallback data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "book") {
      setBooks((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      try {
        await supabase.from("books").delete().eq("id", deleteTarget.id);
        toast.success("Book removed from library catalog.");
      } catch {
        toast.info("Book record removed.");
      }
    } else if (deleteTarget.type === "category") {
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      try {
        await supabase.from("categories").delete().eq("id", deleteTarget.id);
        toast.success("Category deleted.");
      } catch {
        toast.info("Category removed.");
      }
    }

    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  // AI Description Generator
  const handleGenerateAiSummary = async () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a title first to generate AI summary.");
      return;
    }
    setAiGenerating(true);
    const catName = categories.find((c) => c.id === newCategoryId)?.name || "General";

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-summary",
          title: newTitle,
          author: newAuthor || "Unknown Author",
          category: catName,
        }),
      });
      const data = await res.json();
      if (data?.result?.description) {
        setNewDescription(data.result.description);
        toast.success("✨ Gemini formulated an academic summary!");
      }
    } catch {
      toast.error("Could not reach Gemini API. Please enter description manually.");
    } finally {
      setAiGenerating(false);
    }
  };

  // Save Book (with Supabase Storage upload)
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) {
      toast.error("Title and author are required.");
      return;
    }

    setUploadingFiles(true);
    let coverUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80";
    let fileUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

    try {
      // 1. Upload Cover Image if selected
      if (coverFile) {
        const fileExt = coverFile.name.split(".").pop();
        const coverPath = `${Date.now()}-cover.${fileExt}`;
        const { data: coverUpload, error: coverErr } = await supabase.storage
          .from("book-covers")
          .upload(coverPath, coverFile, { upsert: true });

        if (!coverErr && coverUpload) {
          const { data: pubData } = supabase.storage
            .from("book-covers")
            .getPublicUrl(coverPath);
          if (pubData?.publicUrl) coverUrl = pubData.publicUrl;
        }
      }

      // 2. Upload Document / Audio File if selected
      if (resourceFile) {
        const fileExt = resourceFile.name.split(".").pop();
        const filePath = `${Date.now()}-doc.${fileExt}`;
        const { data: fileUpload, error: fileErr } = await supabase.storage
          .from("library-files")
          .upload(filePath, resourceFile, { upsert: true });

        if (!fileErr && fileUpload) {
          const { data: pubData } = supabase.storage
            .from("library-files")
            .getPublicUrl(filePath);
          if (pubData?.publicUrl) fileUrl = pubData.publicUrl;
        }
      }

      // 3. Insert record into Supabase books table
      const categoryObj = categories.find((c) => c.id === newCategoryId) || categories[0];
      const newBookRecord = {
        title: newTitle.trim(),
        author: newAuthor.trim(),
        description: newDescription.trim() || `${newTitle} by ${newAuthor}.`,
        category_id: categoryObj ? categoryObj.id : null,
        file_type: newFormat.toLowerCase(),
        file_url: fileUrl,
        cover_url: coverUrl,
        download_count: 0,
        view_count: 0,
        published_year: new Date().getFullYear(),
      };

      const { data: inserted, error: insertErr } = await (supabase
        .from("books") as any)
        .insert(newBookRecord)
        .select("*, categories(*)")
        .single();

      if (!insertErr && inserted) {
        const formattedNew: Book & { categories?: Category | null } = {
          ...inserted,
          file_type: (inserted.file_type?.toUpperCase() || "PDF") as FileType,
        };
        setBooks((prev) => [formattedNew, ...prev]);
        toast.success(`"${newTitle}" successfully published to catalog!`);
      } else {
        // Fallback optimistic local addition
        const localBook: Book & { categories?: Category | null } = {
          id: `b${Date.now()}`,
          title: newTitle,
          author: newAuthor,
          isbn: null,
          description: newDescription,
          ai_summary: newDescription.slice(0, 160),
          category_id: categoryObj?.id || "c1",
          cover_url: coverUrl,
          file_url: fileUrl,
          file_type: newFormat,
          file_size_bytes: resourceFile ? resourceFile.size : 12000000,
          page_count: 240,
          duration_seconds: newFormat === "AUDIO" ? 3600 : null,
          language: "English",
          publisher: "LibrisAI Repository",
          published_year: new Date().getFullYear(),
          is_featured: false,
          is_archived: false,
          download_count: 0,
          view_count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          categories: categoryObj,
        };
        setBooks((prev) => [localBook, ...prev]);
        toast.success(`"${newTitle}" added to local inventory!`);
      }

      // Reset form
      setNewBookOpen(false);
      setNewTitle("");
      setNewAuthor("");
      setNewDescription("");
      setResourceFile(null);
      setCoverFile(null);
    } catch (err) {
      toast.error("Failed to publish book. Please check connection.");
    } finally {
      setUploadingFiles(false);
    }
  };

  // Add Category Handler
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newCat = {
      name: newCategoryName.trim(),
      slug,
      description: newCategoryDesc.trim() || null,
      icon: "BookOpen",
      display_order: categories.length + 1,
    };

    try {
      const { data, error } = await (supabase
        .from("categories") as any)
        .insert(newCat)
        .select()
        .single();

      if (!error && data) {
        setCategories((prev) => [...prev, data as unknown as Category]);
        toast.success(`Category "${newCategoryName}" created!`);
      } else {
        setCategories((prev) => [
          ...prev,
          { id: `c${Date.now()}`, ...newCat, created_at: new Date().toISOString() },
        ]);
        toast.success(`Category "${newCategoryName}" added!`);
      }

      setNewCategoryName("");
      setNewCategoryDesc("");
    } catch {
      toast.error("Could not create category.");
    }
  };

  // Toggle user suspension
  const toggleUserSuspension = async (userId: string, currentSuspended: boolean) => {
    const nextSuspended = !currentSuspended;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_suspended: nextSuspended } : u))
    );

    try {
      await (supabase
        .from("profiles") as any)
        .update({ is_suspended: nextSuspended })
        .eq("id", userId);
      toast.info(nextSuspended ? "User account suspended." : "User account reactivated.");
    } catch {
      toast.info(`User status updated to ${nextSuspended ? "suspended" : "active"}.`);
    }
  };

  // Filtered books for Books tab
  const filteredBooks = books.filter((b) => {
    const query = bookSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query);

    const matchesCategory =
      bookCategoryFilter === "all" ||
      b.category_id === bookCategoryFilter ||
      b.categories?.slug === bookCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const totalDownloads = books.reduce((acc, curr) => acc + (curr.download_count || 0), 0);

  return (
    <RoleLayout allow="admin">
      <div className="space-y-6">
        <PageHeader
          title="Admin Control Center"
          subtitle="Manage digital catalog assets, organize academic categories, and manage reader accounts."
          action={
            <Button
              size="sm"
              className="gap-2 bg-primary text-primary-foreground font-semibold shadow-xs"
              onClick={() => setNewBookOpen(true)}
            >
              <Plus className="h-4 w-4" /> Upload New Resource
            </Button>
          }
        />

        {/* Admin KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Books & Media</p>
                <h3 className="text-2xl font-extrabold text-foreground">{books.length}</h3>
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
                <h3 className="text-2xl font-extrabold text-foreground">
                  {totalDownloads.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Registered Readers</p>
                <h3 className="text-2xl font-extrabold text-foreground">{users.length}</h3>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <FolderTree className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Categories</p>
                <h3 className="text-2xl font-extrabold text-foreground">{categories.length}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Administration Tabs: Books, Categories, Users */}
        <Tabs defaultValue="books" className="space-y-4">
          <TabsList className="w-full sm:w-auto flex flex-wrap sm:flex-nowrap bg-muted/50 p-1 h-auto gap-1">
            <TabsTrigger value="books" className="text-xs gap-1.5 flex-1 sm:flex-initial">
              <BookOpen className="h-3.5 w-3.5" /> Manage Books ({books.length})
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs gap-1.5 flex-1 sm:flex-initial">
              <FolderTree className="h-3.5 w-3.5" /> Manage Categories ({categories.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs gap-1.5 flex-1 sm:flex-initial">
              <Users className="h-3.5 w-3.5" /> Manage Users ({users.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MANAGE BOOKS */}
          <TabsContent value="books" className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search books by title or author..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={bookCategoryFilter} onValueChange={setBookCategoryFilter}>
                  <SelectTrigger className="h-9 text-xs flex-1 sm:w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Disciplines</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  className="h-9 gap-1.5 text-xs bg-primary text-primary-foreground font-medium shrink-0"
                  onClick={() => setNewBookOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" /> + Upload Book
                </Button>
              </div>
            </div>

            {/* Books Data Table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
              <Table className="min-w-[580px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Cover</TableHead>
                    <TableHead>Title & Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div className="h-12 w-9 rounded-md overflow-hidden bg-muted border border-border/80">
                          <img
                            src={b.cover_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
                            alt={b.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/books/${b.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {b.title}
                        </Link>
                        <div className="text-xs text-muted-foreground">by {b.author}</div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {b.categories?.name || "General"}
                      </TableCell>
                      <TableCell>
                        <FileTypeBadge type={b.file_type} />
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {(b.download_count || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Link href={`/books/${b.id}`} title="View resource">
                              <BookOpen className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setDeleteTarget({ id: b.id, type: "book" });
                              setDeleteModalOpen(true);
                            }}
                            title="Delete book"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* TAB 2: MANAGE CATEGORIES */}
          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Category Creation Form */}
              <div className="md:col-span-5 rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
                <div>
                  <h3 className="font-bold text-foreground text-sm">Add New Category</h3>
                  <p className="text-xs text-muted-foreground">
                    Create academic departments and classifications.
                  </p>
                </div>

                <form onSubmit={handleAddCategory} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="catName" className="text-xs">Category Name</Label>
                    <Input
                      id="catName"
                      placeholder="e.g. Distributed Systems"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="catDesc" className="text-xs">Description (Optional)</Label>
                    <Input
                      id="catDesc"
                      placeholder="e.g. Protocols, consensus, and fault tolerance"
                      value={newCategoryDesc}
                      onChange={(e) => setNewCategoryDesc(e.target.value)}
                    />
                  </div>
                  <Button type="submit" size="sm" className="w-full bg-primary text-primary-foreground font-semibold">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Create Category
                  </Button>
                </form>
              </div>

              {/* Categories Table */}
              <div className="md:col-span-7 rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
                <Table className="min-w-[420px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Book Count</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((c) => {
                      const count = books.filter((b) => b.category_id === c.id).length;
                      return (
                        <TableRow key={c.id}>
                          <TableCell>
                            <div className="font-semibold text-foreground text-xs">{c.name}</div>
                            {c.description && (
                              <div className="text-[11px] text-muted-foreground line-clamp-1">{c.description}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {c.slug}
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            <Badge variant="secondary" className="text-[11px] font-mono">
                              {count} items
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setDeleteTarget({ id: c.id, type: "category" });
                                setDeleteModalOpen(true);
                              }}
                              title="Delete category"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: MANAGE USERS */}
          <TabsContent value="users">
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
              <Table className="min-w-[480px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            name={u.full_name || u.name}
                            path={u.avatar_url}
                            className="h-8 w-8"
                          />
                          <div>
                            <div className="font-semibold text-foreground text-xs">{u.full_name || u.name}</div>
                            <div className="text-[11px] text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={u.role || "user"} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={u.is_suspended ? "suspended" : "active"} />
                      </TableCell>
                      <TableCell className="text-right">
                        {u.role !== "admin" && (
                          <Button
                            size="sm"
                            variant={u.is_suspended ? "secondary" : "outline"}
                            className="text-xs h-7"
                            onClick={() => toggleUserSuspension(u.id, !!u.is_suspended)}
                          >
                            {u.is_suspended ? "Reactivate" : "Suspend"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title={deleteTarget?.type === "book" ? "Delete Library Book?" : "Delete Category?"}
          description="Are you sure you want to remove this item? This action will permanently affect catalog indexing."
          confirmLabel="Delete Resource"
          destructive
          onConfirm={handleConfirmDelete}
        />

        {/* Add New Resource Modal with AI Description Generator and Storage Upload */}
        <Dialog open={newBookOpen} onOpenChange={setNewBookOpen}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload New Digital Resource</DialogTitle>
              <DialogDescription>
                Publish a document, eBook, or audiobook to the LibrisAI digital repository.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveBook} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold">Book / Resource Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Distributed Systems: Principles and Paradigms"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="author" className="text-xs font-semibold">Author / Creator</Label>
                  <Input
                    id="author"
                    placeholder="e.g. Andrew S. Tanenbaum"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Format Type</Label>
                  <Select value={newFormat} onValueChange={(val) => setNewFormat(val as FileType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF Document</SelectItem>
                      <SelectItem value="EPUB">ePub eBook</SelectItem>
                      <SelectItem value="AUDIO">Audiobook</SelectItem>
                      <SelectItem value="DOC">Notes / Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Academic Category</Label>
                <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-dashed border-border bg-muted/30">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <UploadCloud className="h-3.5 w-3.5 text-primary" /> Resource File (.pdf, .epub, .mp3)
                  </Label>
                  <Input
                    type="file"
                    accept=".pdf,.epub,.mp3,.wav,.doc,.docx"
                    className="text-xs h-9 cursor-pointer"
                    onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5 text-primary" /> Cover Thumbnail (Optional)
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    className="text-xs h-9 cursor-pointer"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {/* Gemini Description Generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="desc" className="text-xs font-semibold">Catalog Description</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] gap-1 text-primary hover:bg-primary/10 font-medium"
                    onClick={handleGenerateAiSummary}
                    disabled={aiGenerating}
                  >
                    <Sparkles className="h-3 w-3" />
                    {aiGenerating ? "Synthesizing with Gemini..." : "✨ Auto-Generate with Gemini AI"}
                  </Button>
                </div>
                <Textarea
                  id="desc"
                  rows={3}
                  placeholder="Overview of this work, major takeaways, and conceptual chapters..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setNewBookOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploadingFiles}
                  className="bg-primary text-primary-foreground font-semibold gap-1.5"
                >
                  {uploadingFiles ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading to Supabase...
                    </>
                  ) : (
                    "Publish Resource"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RoleLayout>
  );
}
