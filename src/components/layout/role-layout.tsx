"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { AppRole } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

interface RoleLayoutProps {
  allow: AppRole;
  children: ReactNode;
}

export function RoleLayout({ allow, children }: RoleLayoutProps) {
  const { user, profile, role, loading, isSuspended } = useAuth();
  const router = useRouter();

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
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col md:flex-row gap-6 py-4">
      {/* Role Sidebar */}
      <aside className="w-full md:w-64 shrink-0 rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs h-fit space-y-3 sm:space-y-4">
        <div className="flex md:flex-col justify-between items-center md:items-start border-b border-border pb-2.5 md:pb-3">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isUserDashboard ? "Reader Space" : "Administration Console"}
            </p>
            <h2 className="text-sm sm:text-base font-extrabold text-foreground mt-0.5">
              {isUserDashboard ? "My Library" : "LibrisAI Admin"}
            </h2>
          </div>
          <span className="md:hidden text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {role || "user"}
          </span>
        </div>

        <nav className="flex flex-row md:flex-col gap-1.5 text-xs sm:text-sm overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {isUserDashboard ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-foreground hover:bg-accent transition-colors shrink-0 whitespace-nowrap"
              >
                <LayoutDashboard className="h-4 w-4 text-primary shrink-0" />
                <span>Overview</span>
              </Link>
              <Link
                href="/dashboard?tab=saved"
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0 whitespace-nowrap"
              >
                <Bookmark className="h-4 w-4 shrink-0" />
                <span>Saved Bookmarks</span>
              </Link>
              <Link
                href="/dashboard?tab=history"
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0 whitespace-nowrap"
              >
                <History className="h-4 w-4 shrink-0" />
                <span>Reading History</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-foreground hover:bg-accent transition-colors shrink-0 whitespace-nowrap"
              >
                <LayoutDashboard className="h-4 w-4 text-primary shrink-0" />
                <span>KPI Metrics</span>
              </Link>
              <Link
                href="/admin?tab=books"
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0 whitespace-nowrap"
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <span>Catalog Inventory</span>
              </Link>
              <Link
                href="/admin?tab=categories"
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0 whitespace-nowrap"
              >
                <FolderTree className="h-4 w-4 shrink-0" />
                <span>Categories</span>
              </Link>
              <Link
                href="/admin?tab=users"
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0 whitespace-nowrap"
              >
                <Users className="h-4 w-4 shrink-0" />
                <span>Users & Roles</span>
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Main Role Content View */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
