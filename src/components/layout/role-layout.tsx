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
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { AppRole } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CatalogIntelligenceModal } from "@/components/admin/catalog-intelligence-modal";

interface RoleLayoutProps {
  allow: AppRole;
  children: ReactNode;
}

export function RoleLayout({ allow, children }: RoleLayoutProps) {
  const { user, profile, role, loading, isSuspended } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

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

  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full flex-col lg:flex-row gap-6 xl:gap-8 py-2">
      {/* Role Sidebar matching Image 3 & Image 4 */}
      <aside className="w-full lg:w-64 xl:w-72 shrink-0 flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs h-fit lg:min-h-[720px] space-y-6">
        <div className="space-y-6">
          {/* Header Title */}
          <div className="border-b border-border/70 pb-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {isUserDashboard ? "Navigation" : "Library Hub"}
            </p>
            <h2 className="text-base font-extrabold text-foreground mt-0.5 tracking-tight">
              {isUserDashboard ? "Research Workspace" : "Admin Control Panel"}
            </h2>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-row lg:flex-col gap-1 text-xs sm:text-sm overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {isUserDashboard ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium transition-all shrink-0 whitespace-nowrap",
                    pathname === "/dashboard" && (!searchParams.get("tab") || currentTab === "overview")
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all shrink-0 whitespace-nowrap"
                >
                  <Compass className="h-4 w-4 shrink-0" />
                  <span>Browse Catalog</span>
                </Link>

                <Link
                  href="/dashboard?tab=saved"
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium transition-all shrink-0 whitespace-nowrap",
                    currentTab === "saved"
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <Bookmark className="h-4 w-4 shrink-0" />
                  <span>Saved Resources</span>
                </Link>

                <Link
                  href="/dashboard?tab=history"
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium transition-all shrink-0 whitespace-nowrap",
                    currentTab === "history"
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <Download className="h-4 w-4 shrink-0" />
                  <span>My Downloads</span>
                </Link>

                <Link
                  href="/dashboard?tab=profile"
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium transition-all shrink-0 whitespace-nowrap",
                    currentTab === "profile"
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <User className="h-4 w-4 shrink-0" />
                  <span>Profile</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium transition-all shrink-0 whitespace-nowrap",
                    pathname === "/admin" && (!searchParams.get("tab") || currentTab === "overview")
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/admin?tab=books"
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium transition-all shrink-0 whitespace-nowrap",
                    currentTab === "books"
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span>Books</span>
                </Link>

                <Link
                  href="/admin?tab=categories"
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium transition-all shrink-0 whitespace-nowrap",
                    currentTab === "categories"
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <FolderTree className="h-4 w-4 shrink-0" />
                  <span>Categories</span>
                </Link>

                <Link
                  href="/admin?tab=users"
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium transition-all shrink-0 whitespace-nowrap",
                    currentTab === "users"
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span>Users</span>
                </Link>

                <Link
                  href="/admin?tab=settings"
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium transition-all shrink-0 whitespace-nowrap",
                    currentTab === "settings"
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>Settings</span>
                </Link>
              </>
            )}
          </nav>

          {/* User Dashboard Collections Rail (Mockup Image 3) */}
          {isUserDashboard && (
            <div className="hidden lg:block space-y-2.5 pt-2 border-t border-border/70">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Collections
              </p>
              <div className="space-y-1.5 text-xs">
                <Link
                  href="/?q=cryptography"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="truncate">Advanced Cryptography</span>
                </Link>
                <Link
                  href="/?q=neural"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="truncate">Neural Architectures</span>
                </Link>
                <Link
                  href="/?q=topology"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="truncate">Topological Systems</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Feature Widget (Mockup Image 3 & Image 4) */}
        <div className="hidden lg:block pt-4 border-t border-border/70">
          {isUserDashboard ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <Shield className="h-4 w-4" /> Institutional Tier
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Unlimited full-text index access via MIT Scholarly Network.
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>Storage quota</span>
                  <span className="font-semibold text-foreground">7.8 GB / 10 GB</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "78%" }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-background to-secondary p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <Sparkles className="h-4 w-4" /> Gemini AI Engine
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
