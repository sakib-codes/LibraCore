"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Menu,
  LogOut,
  User as UserIcon,
  Shield,
  LayoutDashboard,
  Bookmark,
  Sparkles,
  Search,
  Bell,
  HelpCircle,
  Command,
  ChevronRight,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { HelpDialog } from "@/components/layout/help-dialog";
import { useAuth } from "@/hooks/use-auth";
import { PUBLIC_NAV_LINKS, USER_NAV_LINKS, ADMIN_NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, profile, role, isAdmin, signOut, loginDemo } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      router.push(`/?q=${encodeURIComponent(navSearch.trim())}`);
    }
  };

  const navLinks = isAdmin
    ? ADMIN_NAV_LINKS
    : user
    ? USER_NAV_LINKS
    : PUBLIC_NAV_LINKS;

  const rawDisplayName = profile?.full_name || profile?.name || (user?.email ? user.email.split("@")[0] : "Academic Scholar");
  const displayName = rawDisplayName.replace(/\s*\((?:Admin|Reader)\)/gi, "").trim();
  const departmentTag = isAdmin ? "Chief Archivist" : "Quantum Dept.";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-[1720px] 2xl:max-w-[1840px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-6 xl:gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-500/25 transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight leading-tight flex items-center gap-1">
                Libris<span className="text-primary font-bold">AI</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Digital Library
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-secondary text-foreground font-medium shadow-2xs border border-border/60"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Global Academic Search Bar matching Google AI Studio pill */}
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("open-libris-command-palette"));
          }}
          className="hidden md:flex items-center relative flex-1 max-w-md xl:max-w-lg mx-2 text-left cursor-pointer group"
          title="Open Spotlight Search (⌘K / Ctrl+K)"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <div className="h-9 w-full rounded-full bg-secondary/60 border border-border/70 pl-9 pr-14 text-xs text-muted-foreground flex items-center shadow-2xs group-hover:bg-secondary group-hover:border-border transition-all select-none">
            <span>Search academic catalog, ISBN, DOI, or author...</span>
          </div>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded-full border border-border/80 bg-background/80 px-2 py-0.5 text-[10px] font-mono text-muted-foreground group-hover:border-primary/40 group-hover:text-primary transition-colors">
            <span>⌘K</span>
          </div>
        </button>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Theme Toggle (Light / Dark) */}
          <ThemeToggle />

          {/* Institutional Notifications Center */}
          <NotificationsPopover />

          {/* Academic Repository Help & Protocol */}
          <HelpDialog />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group relative flex items-center justify-center rounded-full h-9 w-9 p-0.5 border border-border/80 bg-secondary/40 hover:bg-secondary/80 hover:border-primary/50 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary select-none cursor-pointer"
                  title={displayName}
                  aria-label="User Account Menu"
                >
                  <UserAvatar
                    name={displayName}
                    path={profile?.avatar_url}
                    className="h-full w-full rounded-full ring-1 ring-border/80 group-hover:ring-primary/40 transition-all"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background shadow-xs" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-80 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-xl shadow-black/10 dark:shadow-black/50 p-2 space-y-1.5 text-popover-foreground"
              >
                {/* Scholar Identity Header Card */}
                <div className="stagger-option rounded-xl p-3 bg-gradient-to-br from-primary/10 via-secondary/50 to-secondary/25 border border-border/70">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <UserAvatar
                        name={displayName}
                        path={profile?.avatar_url}
                        className="h-10 w-10 ring-2 ring-primary/25 shadow-xs"
                      />
                      {/* Active Status Indicator (Green Dot) */}
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-background shadow-xs" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Name with Green Verified Shield */}
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-semibold text-foreground truncate tracking-tight">
                          {displayName}
                        </h4>
                        <span title="Verified Scholar">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        </span>
                      </div>

                      {/* User Tag and Email Placed Under the Name */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 capitalize">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {role}
                        </span>
                        <span className="text-[10px] text-muted-foreground/80 font-mono truncate">
                          {user.email}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground font-medium">
                        <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{profile?.institution || (isAdmin ? "Central Archives" : "LibrisAI Faculty")}</span>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="text-muted-foreground/80 truncate">{departmentTag}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Workspace Section */}
                <div className="space-y-0.5 px-0.5">
                  <p className="px-2 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Academic Workspace
                  </p>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer hover:bg-secondary/70 focus:bg-secondary/70 transition-all outline-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-muted-foreground border border-border/70 group-hover:bg-primary/15 group-hover:text-primary group-hover:border-primary/25 transition-all">
                          <LayoutDashboard className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                          <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                            Research Workspace
                          </span>
                          <span className="text-[10px] text-muted-foreground">Active projects & metrics</span>
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard?tab=saved"
                      className="group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer hover:bg-secondary/70 focus:bg-secondary/70 transition-all outline-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-muted-foreground border border-border/70 group-hover:bg-primary/15 group-hover:text-primary group-hover:border-primary/25 transition-all">
                          <Bookmark className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                          <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                            Saved Monographs
                          </span>
                          <span className="text-[10px] text-muted-foreground">Reading queue & bookmarks</span>
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard?tab=profile"
                      className="group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer hover:bg-secondary/70 focus:bg-secondary/70 transition-all outline-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-muted-foreground border border-border/70 group-hover:bg-primary/15 group-hover:text-primary group-hover:border-primary/25 transition-all">
                          <UserIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                          <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                            Scholar Profile & Settings
                          </span>
                          <span className="text-[10px] text-muted-foreground">Bio, credentials & security</span>
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </DropdownMenuItem>
                </div>

                {/* System & Tools Section (Only for Admin Console, View Switchers Removed) */}
                {isAdmin && (
                  <div className="pt-1.5 border-t border-border/60 space-y-0.5 px-0.5">
                    <p className="px-2 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      System & Tools
                    </p>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin"
                        className="group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer hover:bg-secondary/70 focus:bg-secondary/70 transition-all outline-none"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                              Admin Console
                            </span>
                            <span className="text-[10px] text-muted-foreground">Catalog audit, users & uploads</span>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </DropdownMenuItem>
                  </div>
                )}

                {/* Sign Out Footer */}
                <div className="pt-1.5 border-t border-border/60 px-0.5">
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-all outline-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20 group-hover:bg-destructive group-hover:text-destructive-foreground transition-all">
                        <LogOut className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-destructive">
                        Sign Out
                      </span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-destructive/40 group-hover:text-destructive group-hover:translate-x-0.5 transition-transform" />
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="text-xs px-3 font-semibold text-muted-foreground hover:text-foreground">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="text-xs px-3.5 shadow-2xs bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}

          {/* Mobile Spotlight Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
            title="Open Search Palette (⌘K)"
            onClick={() => window.dispatchEvent(new CustomEvent("open-libris-command-palette"))}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Mobile Hamburger Menu */}
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-6">
                <SheetTitle className="flex items-center gap-2 text-left mb-6">
                  <BookOpen className="h-5 w-5 text-primary" /> LibrisAI
                </SheetTitle>
                <div className="flex flex-col gap-2">
                  {/* Mobile Search */}
                  <form onSubmit={(e) => { setMobileOpen(false); handleSearchSubmit(e); }} className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search repository..."
                      value={navSearch}
                      onChange={(e) => setNavSearch(e.target.value)}
                      className="h-9 pl-9 text-xs"
                    />
                  </form>

                  {navLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {user ? (
                    <div className="mt-6 flex flex-col gap-2.5 pt-4 border-t border-border">
                      <div className="flex items-center gap-2.5 px-1 py-1">
                        <UserAvatar
                          name={displayName}
                          path={profile?.avatar_url}
                          className="h-9 w-9"
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold truncate text-foreground">
                              {displayName}
                            </span>
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 capitalize">
                              {role}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate font-mono">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 pt-2">
                        {isAdmin && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs gap-2"
                            onClick={() => setMobileOpen(false)}
                          >
                            <Link href="/admin">
                              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Admin Console
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs gap-2 text-destructive hover:bg-destructive/10"
                          onClick={async () => {
                            setMobileOpen(false);
                            await handleSignOut();
                          }}
                        >
                          <LogOut className="h-3.5 w-3.5" /> Sign Out
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-border">
                      <Button asChild variant="outline" className="w-full justify-center">
                        <Link href="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
                      </Button>
                      <Button asChild className="w-full justify-center">
                        <Link href="/register" onClick={() => setMobileOpen(false)}>Register</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
