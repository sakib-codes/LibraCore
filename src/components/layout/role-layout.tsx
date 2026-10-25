"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ShieldAlert,
  LayoutDashboard,
  Bookmark,
  History,
  BookOpen,
  FolderTree,
  Users,
  Settings,
  Compass,
  Download,
  User,
  Sparkles,
  Shield,
  Layers,
  Network,
  ArrowUpRight,
  FolderKanban,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { AppRole, CollectionColor } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CatalogIntelligenceModal } from "@/components/admin/catalog-intelligence-modal";
import { COLLECTION_COLORS, SEED_COLLECTIONS, type CollectionWithCount } from "@/lib/collections";

interface RoleLayoutProps {
  allow: AppRole;
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  collections?: CollectionWithCount[];
  selectedCollectionId?: string;
  onSelectCollection?: (colId: string) => void;
}

export function RoleLayout({
  allow,
  children,
  activeTab: controlledActiveTab,
  onTabChange,
  collections: controlledCollections,
  selectedCollectionId,
  onSelectCollection,
}: RoleLayoutProps) {
  const { user, profile, role, loading, isSuspended } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = controlledActiveTab || searchParams.get("tab") || "overview";

  // Allow preview inspection mode with ?preview=true query parameter
  const isPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "true";

  useEffect(() => {
    if (loading || isPreview) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (allow === "admin" && role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, role, loading, allow, router, isPreview]);

  if (!isPreview && (loading || !user || (allow === "admin" && role !== "admin"))) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  // Suspended Account Screen
  if (isSuspended && role !== "admin") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Reader Account Suspended
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Your LibrisAI reader access has been suspended by an administrator. Please reach out to library administration to review your status.
        </p>
      </div>
    );
  }

  const isUserDashboard = allow === "user";

  const userWorkspaceTabs = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "saved", label: "Saved Resources", icon: Bookmark },
    { id: "history", label: "My Downloads", icon: Download },
    { id: "collections", label: "Collections", icon: FolderKanban },
    { id: "profile", label: "Scholar Profile", icon: User },
  ];

  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full flex-col lg:flex-row items-start gap-6 xl:gap-8 pt-0 pb-8">
      {/* Role Sidebar matching Google AI Studio */}
      <aside className="w-full lg:w-64 xl:w-72 shrink-0 flex flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-2xs h-fit lg:sticky lg:top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none">
        <div className="space-y-4">
          {/* Header Title */}
          <div className="border-b border-border/60 pb-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {isUserDashboard ? "Navigation" : "Library Hub"}
            </p>
            <h2 className="text-sm font-semibold text-foreground/95 mt-0.5 tracking-tight">
              {isUserDashboard ? "Research Workspace" : "Admin Control Panel"}
            </h2>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-row lg:flex-col gap-1 text-xs sm:text-sm overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {isUserDashboard ? (
              userWorkspaceTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;

                if (onTabChange) {
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => onTabChange(tab.id)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3.5 h-10 font-medium transition-colors duration-150 shrink-0 whitespace-nowrap text-xs text-left cursor-pointer w-full border",
                        isActive
                          ? "bg-secondary text-foreground border-border/80 shadow-2xs"
                          : "text-muted-foreground border-transparent hover:bg-secondary/60 hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
                      <span>{tab.label}</span>
                    </button>
                  );
                }

                return (
                  <Link
                    key={tab.id}
                    href={tab.id === "overview" ? "/dashboard" : `/dashboard?tab=${tab.id}`}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3.5 h-10 font-medium transition-colors duration-150 shrink-0 whitespace-nowrap text-xs border",
                      isActive
                        ? "bg-secondary text-foreground border-border/80 shadow-2xs"
                        : "text-muted-foreground border-transparent hover:bg-secondary/60 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span>{tab.label}</span>
                  </Link>
                );
              })
            ) : (
              <>
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3.5 h-10 font-medium transition-colors duration-150 shrink-0 whitespace-nowrap text-xs border",
                    pathname === "/admin" && (!searchParams.get("tab") || currentTab === "overview")
                      ? "bg-secondary text-foreground border-border/70 shadow-2xs"
                      : "text-muted-foreground border-transparent hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/admin?tab=books"
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3.5 h-10 font-medium transition-colors duration-150 shrink-0 whitespace-nowrap text-xs border",
                    currentTab === "books"
                      ? "bg-secondary text-foreground border-border/70 shadow-2xs"
                      : "text-muted-foreground border-transparent hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span>Books</span>
                </Link>

                <Link
                  href="/admin?tab=categories"
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3.5 h-10 font-medium transition-colors duration-150 shrink-0 whitespace-nowrap text-xs border",
                    currentTab === "categories"
                      ? "bg-secondary text-foreground border-border/70 shadow-2xs"
                      : "text-muted-foreground border-transparent hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <FolderTree className="h-4 w-4 shrink-0" />
                  <span>Categories</span>
                </Link>

                <Link
                  href="/admin?tab=users"
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3.5 h-10 font-medium transition-colors duration-150 shrink-0 whitespace-nowrap text-xs border",
                    currentTab === "users"
                      ? "bg-secondary text-foreground border-border/70 shadow-2xs"
                      : "text-muted-foreground border-transparent hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span>Users</span>
                </Link>

                <Link
                  href="/admin?tab=settings"
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3.5 h-10 font-medium transition-colors duration-150 shrink-0 whitespace-nowrap text-xs border",
                    currentTab === "settings"
                      ? "bg-secondary text-foreground border-border/70 shadow-2xs"
                      : "text-muted-foreground border-transparent hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>Settings</span>
                </Link>
              </>
            )}
          </nav>

          {/* User Dashboard Collections Rail */}
          {isUserDashboard && (
            <div className="hidden lg:block space-y-2.5 pt-3 border-t border-border/70">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Collections
                </p>
                {onTabChange ? (
                  <button
                    type="button"
                    onClick={() => onTabChange("collections")}
                    className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                ) : (
                  <Link
                    href="/dashboard?tab=collections"
                    className="text-[10px] font-semibold text-primary hover:underline"
                  >
                    View All
                  </Link>
                )}
              </div>
              <div className="space-y-1 text-xs">
                {(controlledCollections && controlledCollections.length > 0
                  ? controlledCollections
                  : SEED_COLLECTIONS
                ).slice(0, 5).map((col) => {
                  const isColActive = currentTab === "saved" && selectedCollectionId === col.id;
                  const colorMeta = COLLECTION_COLORS[col.color as CollectionColor] || COLLECTION_COLORS.indigo;

                  if (onSelectCollection && onTabChange) {
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          onTabChange("saved");
                          onSelectCollection(col.id);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 h-8.5 rounded-lg transition-colors duration-150 text-left cursor-pointer border",
                          isColActive
                            ? "bg-secondary text-foreground font-medium border-border/70 shadow-2xs"
                            : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/60"
                        )}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span className={cn("h-2 w-2 rounded-full shrink-0", colorMeta.dotClass)} />
                          <span className="truncate">{col.name}</span>
                        </span>
                        {col.book_count !== undefined && col.book_count > 0 && (
                          <span className="text-[10px] font-mono text-muted-foreground/80 px-1.5 py-0.2 rounded-full bg-muted/60">
                            {col.book_count}
                          </span>
                        )}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={col.id}
                      href={`/dashboard?tab=saved&collection=${col.id}`}
                      className={cn(
                        "flex items-center justify-between px-2.5 h-8.5 rounded-lg transition-colors duration-150 border",
                        isColActive
                          ? "bg-secondary text-foreground font-medium border-border/70 shadow-2xs"
                          : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/60"
                      )}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className={cn("h-2 w-2 rounded-full shrink-0", colorMeta.dotClass)} />
                        <span className="truncate">{col.name}</span>
                      </span>
                      {col.book_count !== undefined && col.book_count > 0 && (
                        <span className="text-[10px] font-mono text-muted-foreground/80 px-1.5 py-0.2 rounded-full bg-muted/60">
                          {col.book_count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* External Repository Discovery */}
          {isUserDashboard && (
            <div className="hidden lg:block space-y-2 pt-3 border-t border-border/70">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                Repository Discovery
              </p>
              <div className="space-y-1 text-xs">
                <Link
                  href="/"
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>Browse Catalog</span>
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  href="/catalog/graph"
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-indigo-400 group-hover:text-indigo-500 transition-colors" />
                    <span>Citation Graph</span>
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Feature Widget (Mockup Image 3 & Image 4) */}
        <div className="hidden lg:block pt-3 border-t border-border/70">
          {isUserDashboard ? (
            <div className="rounded-xl border border-border/70 bg-secondary/40 p-3 space-y-2">
              <div className="flex items-center gap-2 text-primary font-medium text-xs">
                <Shield className="h-4 w-4" /> Institutional Tier
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Unlimited full-text index access via MIT Scholarly Network.
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>Storage quota</span>
                  <span className="font-medium text-foreground/90">7.8 GB / 10 GB</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary/70 rounded-full" style={{ width: "78%" }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary p-3 space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <Sparkles className="h-4 w-4" /> Libris AI Engine
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Automate metadata indexing and generate scholarly reports instantly.
              </p>
              <Button
                size="sm"
                className="w-full text-xs font-semibold bg-primary text-primary-foreground gap-1.5 shadow-xs"
                onClick={() => window.dispatchEvent(new CustomEvent("open-libris-ai-report"))}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate AI Report
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace Area (Expands fluidly across desktop) */}
      <section className="flex-1 min-w-0">
        {children}
      </section>

      {/* Admin Gemini AI Catalog Intelligence Modal */}
      {!isUserDashboard && <CatalogIntelligenceModal />}
    </div>
  );
}
