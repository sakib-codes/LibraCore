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
    router.push("/login");
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

  const displayName = profile?.full_name || profile?.name || (user?.email ? user.email.split("@")[0] : "Academic Scholar");
  const departmentTag = isAdmin ? "Chief Archivist" : "Quantum Dept.";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-[1720px] 2xl:max-w-[1840px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-6 xl:gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-foreground group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-500/25 transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight leading-tight flex items-center gap-1">
                Libris<span className="text-primary font-black">AI</span>
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
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "bg-accent text-accent-foreground font-bold shadow-2xs"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Global Academic Search Bar (Mockup Image 2, 3, 4) - Triggers ⌘K Spotlight */}
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("open-libris-command-palette"));
          }}
          className="hidden md:flex items-center relative flex-1 max-w-md xl:max-w-lg mx-2 text-left cursor-pointer group"
          title="Open Spotlight Search (⌘K / Ctrl+K)"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          <div className="h-9 w-full rounded-xl bg-muted/50 border border-border/70 pl-9 pr-14 text-xs text-muted-foreground flex items-center shadow-2xs group-hover:bg-background group-hover:border-primary/50 group-hover:shadow-xs transition-all select-none">
            <span>Search academic catalog, ISBN, DOI, or author...</span>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-border/80 bg-background/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground group-hover:border-primary/40 group-hover:text-primary transition-colors">
            <span>⌘K</span>
          </div>
        </button>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Bell */}
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Institutional Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
          </button>

          {/* Help Resource */}
          <button
            type="button"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Academic Repository Help & Protocol"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-full p-1 pl-1.5 sm:pr-2.5 border border-border/70 bg-card hover:bg-accent/40 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <UserAvatar
                    name={displayName}
                    path={profile?.avatar_url}
                    className="h-7 w-7"
                  />
                  <div className="hidden sm:flex flex-col text-left leading-none">
                    <span className="text-xs font-bold text-foreground truncate max-w-[110px]">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[110px]">
                      {departmentTag}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 shadow-lg p-1.5">
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-bold leading-none text-foreground">
                      {displayName}
                    </p>
                    <p className="text-[11px] leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        {role} tier
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {departmentTag}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer gap-2 text-xs py-2">
                    <LayoutDashboard className="h-4 w-4 text-primary" /> Research Workspace
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard?tab=saved" className="cursor-pointer gap-2 text-xs py-2">
                    <Bookmark className="h-4 w-4" /> Saved Monographs
                  </Link>
                </DropdownMenuItem>
                {isAdmin ? (
                  <DropdownMenuItem
                    onClick={async () => {
                      await loginDemo("user");
                      router.push("/dashboard");
                    }}
                    className="cursor-pointer gap-2 text-xs text-muted-foreground py-2"
                  >
                    <UserIcon className="h-4 w-4" /> Switch to Reader View
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={async () => {
                      await loginDemo("admin");
                      router.push("/admin");
                    }}
                    className="cursor-pointer gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold py-2"
                  >
                    <Shield className="h-4 w-4" /> Switch to Admin View
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 text-xs text-destructive py-2">
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="text-xs px-3 font-semibold">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="text-xs px-3.5 shadow-sm bg-primary text-primary-foreground font-semibold">
                <Link href="/dashboard">Dashboard</Link>
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
                          <span className="text-xs font-bold truncate text-foreground">
                            {displayName}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 pt-2">
                        {isAdmin ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs gap-2 text-muted-foreground"
                            onClick={async () => {
                              await loginDemo("user");
                              setMobileOpen(false);
                              router.push("/dashboard");
                            }}
                          >
                            <UserIcon className="h-3.5 w-3.5" /> Switch to Reader View
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs gap-2 text-indigo-600 dark:text-indigo-400 font-semibold"
                            onClick={async () => {
                              await loginDemo("admin");
                              setMobileOpen(false);
                              router.push("/admin");
                            }}
                          >
                            <Shield className="h-3.5 w-3.5" /> Switch to Admin View
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
