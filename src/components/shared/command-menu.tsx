"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  LayoutDashboard,
  Bookmark,
  History,
  FolderTree,
  User,
  Shield,
  Bot,
  Plus,
  ArrowRight,
  FileText,
  Compass,
  X,
  Sparkles,
  Command,
  SunMoon,
  Network,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { Book, Category } from "@/integrations/supabase/types";

// Seed fallback catalog in case Supabase is offline or loading
const SAMPLE_MONOGRAPHS: {
  id: string;
  title: string;
  author: string;
  category: string;
  format: string;
}[] = [
  {
    id: "b-crypto",
    title: "Cryptographic Security: Foundations and Practice",
    author: "Dr. Eliza V. Adams",
    category: "Cryptography",
    format: "PDF",
  },
  {
    id: "b-generative",
    title: "Foundations of Deep Generative Networks",
    author: "Dr. Aris Thorne",
    category: "Machine Learning",
    format: "PDF",
  },
  {
    id: "b-llm-scholarly",
    title: "Large Language Models in Scholarly Retrieval",
    author: "Elena Rostova",
    category: "Machine Learning",
    format: "PDF",
  },
  {
    id: "b-neural-circuitry",
    title: "Advanced Neural Circuitry & Memory Models",
    author: "Prof. Marcus Sterling",
    category: "Neural Systems",
    format: "EPUB",
  },
  {
    id: "b-topology-quantum",
    title: "Topological Data Analysis in Quantum States",
    author: "Dr. Sarah Jenkins",
    category: "Quantum Computing",
    format: "PDF",
  },
  {
    id: "b-distributed-consensus",
    title: "Distributed Consensus in Decentralized Scholarly Archives",
    author: "Dr. Arthur Pendelton",
    category: "Cryptography",
    format: "PDF",
  },
];

const POPULAR_DISCIPLINES = [
  { name: "Post-Quantum Cryptography", query: "cryptography", color: "bg-indigo-500" },
  { name: "Neural & Cognitive Systems", query: "neural", color: "bg-emerald-500" },
  { name: "Quantum Topological Computing", query: "quantum", color: "bg-amber-500" },
  { name: "Deep Generative Networks", query: "generative", color: "bg-rose-500" },
  { name: "Distributed Ledger Archives", query: "consensus", color: "bg-sky-500" },
];

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon: React.ElementType;
  section: "Navigation" | "Monographs" | "Disciplines" | "Tools";
  onSelect: () => void;
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [books, setBooks] = useState(SAMPLE_MONOGRAPHS);
  const router = useRouter();
  const { user, profile } = useAuth();
  const listRef = useRef<HTMLDivElement | null>(null);

  // Global keydown listener for ⌘K / ⌘L / ⌘G / ⌘D
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Don't trigger non-spotlight shortcuts if user is actively typing in an input or textarea
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // ⌘K / Ctrl+K toggles the Command Palette from anywhere
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      if (isInput) return;

      // ⌘L / Ctrl+L toggles the Libris AI Librarian drawer
      if ((e.key === "l" || e.key === "L") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("toggle-libris-ai-librarian"));
        return;
      }

      // ⌘G / Ctrl+G navigates to the Citation Graph
      if ((e.key === "g" || e.key === "G") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(false);
        router.push("/catalog/graph");
        return;
      }

      // ⌘D / Ctrl+D toggles theme
      if ((e.key === "d" || e.key === "D") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("toggle-libris-theme"));
        return;
      }
    };

    const handleCustomTrigger = () => {
      setOpen(true);
    };

    window.addEventListener("keydown", down);
    window.addEventListener("open-libris-command-palette", handleCustomTrigger);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("open-libris-command-palette", handleCustomTrigger);
    };
  }, [router]);

  // Fetch live books from Supabase if available
  useEffect(() => {
    if (!open) return;
    async function fetchCatalog() {
      try {
        const { data, error } = await supabase
          .from("books")
          .select("id, title, author, file_type, categories(name)")
          .limit(20);

        if (!error && data && data.length > 0) {
          const mapped = data.map((b: any) => ({
            id: b.id,
            title: b.title,
            author: b.author,
            category: b.categories?.name || "Scholarly Monograph",
            format: (b.file_type || "PDF").toUpperCase(),
          }));
          setBooks(mapped);
        }
      } catch (err) {
        console.warn("Command menu using fallback catalog:", err);
      }
    }
    fetchCatalog();
  }, [open]);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    setQuery("");
    command();
  }, []);

  // Build items based on query
  const rawItems: CommandItem[] = [];

  // 1. Navigation items
  const navs: CommandItem[] = [
    {
      id: "nav-landing",
      title: "LibrisAI Platform Overview & Features",
      subtitle: "Discover the neural knowledge synthesis engine & institutional architecture",
      icon: Sparkles,
      section: "Navigation",
      onSelect: () => runCommand(() => router.push("/landing")),
    },
    {
      id: "nav-catalog",
      title: "Browse Complete Catalog",
      subtitle: "Explore indexed research papers, monographs & audio lectures",
      icon: Compass,
      section: "Navigation",
      onSelect: () => runCommand(() => router.push("/")),
    },
    {
      id: "nav-citation-graph",
      title: "Interactive Citation Graph & Academic Network",
      subtitle: "Visualize cross-monograph citations, precedents & discipline topology",
      badge: "⌘G",
      icon: Network,
      section: "Navigation",
      onSelect: () => runCommand(() => router.push("/catalog/graph")),
    },
    {
      id: "nav-dashboard",
      title: "Research Workspace & Dashboard",
      subtitle: "Active workspace, reading metrics & institutional tier",
      icon: LayoutDashboard,
      section: "Navigation",
      onSelect: () => runCommand(() => router.push("/dashboard")),
    },
    {
      id: "nav-saved",
      title: "Saved Resources & Bookmarks",
      subtitle: "Pinned monographs ready for immediate offline reference",
      icon: Bookmark,
      section: "Navigation",
      onSelect: () => runCommand(() => router.push("/dashboard?tab=saved")),
    },
    {
      id: "nav-history",
      title: "Download Audit Trail",
      subtitle: "Recent download history & CSV export logs",
      icon: History,
      section: "Navigation",
      onSelect: () => runCommand(() => router.push("/dashboard?tab=history")),
    },
    {
      id: "nav-categories",
      title: "Knowledge Taxonomies",
      subtitle: "Browse repository by academic domains and disciplines",
      icon: FolderTree,
      section: "Navigation",
      onSelect: () => runCommand(() => router.push("/categories")),
    },
    {
      id: "nav-profile",
      title: "Scholar Credentials & Profile",
      subtitle: "Manage academic title, affiliation & research bio",
      icon: User,
      section: "Navigation",
      onSelect: () => runCommand(() => router.push("/dashboard?tab=profile")),
    },
  ];

  if (profile?.role === "admin") {
    navs.push({
      id: "nav-admin",
      title: "Library Administration Hub",
      subtitle: "Manage monographs, user roles, taxonomies & AI reports",
      icon: Shield,
      section: "Navigation",
      onSelect: () => runCommand(() => router.push("/admin")),
    });
  }

  // 2. Monograph items
  const monographItems: CommandItem[] = books.map((b) => ({
    id: `book-${b.id}`,
    title: b.title,
    subtitle: `${b.author} • ${b.category}`,
    badge: b.format,
    icon: FileText,
    section: "Monographs",
    onSelect: () => runCommand(() => router.push(`/books/${b.id}`)),
  }));

  // 3. Disciplines
  const disciplineItems: CommandItem[] = POPULAR_DISCIPLINES.map((d, i) => ({
    id: `disc-${i}`,
    title: d.name,
    subtitle: "Filter research repository by this topic",
    badge: "Discipline",
    icon: BookOpen,
    section: "Disciplines",
    onSelect: () => runCommand(() => router.push(`/?q=${encodeURIComponent(d.query)}`)),
  }));

  // 4. Action tools
  const toolItems: CommandItem[] = [
    {
      id: "tool-ai",
      title: "Consult Libris AI Librarian",
      subtitle: "Open grounded literature synthesis & question answering assistant",
      badge: "⌘L",
      icon: Sparkles,
      section: "Tools",
      onSelect: () => {
        runCommand(() => {
          window.dispatchEvent(new CustomEvent("open-libris-ai-librarian"));
          const chatBtn = (document.querySelector('button[aria-label="Open LibrisAI Librarian"]') ||
            document.querySelector('button[aria-label="Open AI Librarian"]') ||
            document.querySelector('button[data-testid="ai-librarian-trigger"]')) as HTMLButtonElement | null;
          if (chatBtn) chatBtn.click();
        });
      },
    },
    {
      id: "tool-new-collection",
      title: "Create Thematic Collection",
      subtitle: "Group monographs into an academic research dossier",
      icon: Plus,
      section: "Tools",
      onSelect: () => runCommand(() => router.push("/dashboard")),
    },
    {
      id: "tool-theme",
      title: "Toggle Theme (Light / Dark Mode)",
      subtitle: "Smoothly switch between light and dark repository appearance",
      badge: "⌘D",
      icon: SunMoon,
      section: "Tools",
      onSelect: () => {
        runCommand(() => {
          window.dispatchEvent(new CustomEvent("toggle-libris-theme"));
        });
      },
    },
  ];

  // Filter items by search query
  const q = query.trim().toLowerCase();
  const allItems = [...navs, ...monographItems, ...disciplineItems, ...toolItems];
  const filteredItems = q
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q))
      )
    : allItems;

  // Keyboard navigation within list
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      filteredItems[selectedIndex].onSelect();
    }
  };

  // Group filtered items by section for rendering
  const sections = Array.from(new Set(filteredItems.map((i) => i.section)));

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all animate-in fade-in-0 duration-200" />
        <DialogPrimitive.Content
          onKeyDown={handleKeyDown}
          className="fixed left-[50%] top-[20%] z-50 w-full max-w-2xl translate-x-[-50%] rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden text-foreground outline-none animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <DialogPrimitive.Title className="sr-only">Command Palette</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search monographs, jump to research views, and run library actions.
          </DialogPrimitive.Description>

          {/* Search Header */}
          <div className="relative flex items-center border-b border-border/70 px-4 py-3">
            <Search className="h-4 w-4 text-primary shrink-0 mr-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search monographs, authors, disciplines, or jump to workspace..."
              className="w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground text-xs p-1 rounded-md"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-1 rounded border border-border/80 bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>
            )}
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="max-h-[380px] overflow-y-auto p-2 space-y-4 scrollbar-thin scrollbar-thumb-border"
          >
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <p className="font-semibold text-foreground text-sm">No scholarly records found</p>
                <p className="mt-1">Try querying an author name, ISBN, or academic keyword like &quot;Lattice&quot; or &quot;Neural&quot;.</p>
              </div>
            ) : (
              sections.map((section) => {
                const sectionItems = filteredItems.filter((i) => i.section === section);
                return (
                  <div key={section} className="space-y-1">
                    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {section}
                    </p>
                    <div className="space-y-0.5">
                      {sectionItems.map((item) => {
                        const globalIndex = filteredItems.indexOf(item);
                        const isSelected = selectedIndex === globalIndex;
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.id}
                            onClick={item.onSelect}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              "group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs cursor-pointer transition-all",
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                : "text-foreground hover:bg-muted/60"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={cn(
                                  "flex h-7 w-7 items-center justify-center rounded-lg shrink-0 transition-colors",
                                  isSelected
                                    ? "bg-primary-foreground/20 text-primary-foreground"
                                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                                )}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold tracking-tight">
                                  {item.title}
                                </p>
                                {item.subtitle && (
                                  <p
                                    className={cn(
                                      "truncate text-[11px] font-normal",
                                      isSelected
                                        ? "text-primary-foreground/80"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    {item.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {item.badge && (
                                <span
                                  className={cn(
                                    "rounded-md px-1.5 py-0.5 text-[9px] font-bold font-mono tracking-wider",
                                    isSelected
                                      ? "bg-primary-foreground/20 text-primary-foreground"
                                      : "bg-muted text-muted-foreground border border-border/70"
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                              <ArrowRight
                                className={cn(
                                  "h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all",
                                  isSelected && "opacity-100 translate-x-0"
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Controls matching academic UI */}
          <div className="flex flex-wrap items-center justify-between border-t border-border/70 bg-muted/40 px-4 py-2.5 text-[11px] text-muted-foreground font-mono gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px]">↑</kbd>
                <kbd className="rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px]">↓</kbd>
                <span className="text-[10px] ml-1">Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px]">↵</kbd>
                <span className="text-[10px] ml-1">Select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px]">ESC</kbd>
                <span className="text-[10px] ml-1">Close</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1">
                <kbd className="rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px]">⌘L</kbd>
                <span className="text-[10px] ml-1">Librarian</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1">
                <kbd className="rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px]">⌘G</kbd>
                <span className="text-[10px] ml-1">Citation Graph</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-primary font-sans font-semibold">
              <Sparkles className="h-3 w-3" /> LibrisAI Spotlight
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
