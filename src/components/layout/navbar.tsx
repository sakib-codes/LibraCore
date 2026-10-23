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
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const navLinks = isAdmin
    ? ADMIN_NAV_LINKS
    : user
    ? USER_NAV_LINKS
    : PUBLIC_NAV_LINKS;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-500/25">
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
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Icons & Auth Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-full p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <UserAvatar
                    name={profile?.full_name || user.email || "Reader"}
                    path={profile?.avatar_url}
                    className="h-8 w-8"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-lg">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-bold leading-none text-foreground">
                      {profile?.full_name || "Reader Account"}
                    </p>
                    <p className="text-[11px] leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-semibold text-primary">
                      {role} role
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer gap-2 text-xs">
                    <LayoutDashboard className="h-4 w-4" /> My Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard?tab=saved" className="cursor-pointer gap-2 text-xs">
                    <Bookmark className="h-4 w-4" /> Saved Books
                  </Link>
                </DropdownMenuItem>
                {isAdmin ? (
                  <DropdownMenuItem
                    onClick={async () => {
                      await loginDemo("user");
                      router.push("/dashboard");
                    }}
                    className="cursor-pointer gap-2 text-xs text-muted-foreground"
                  >
                    <UserIcon className="h-4 w-4" /> Switch to Reader View
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={async () => {
                      await loginDemo("admin");
                      router.push("/admin");
                    }}
                    className="cursor-pointer gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold"
                  >
                    <Shield className="h-4 w-4" /> Switch to Admin View
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 text-xs text-destructive">
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button asChild variant="ghost" size="sm" className="text-xs px-2 sm:px-3">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="text-xs px-2.5 sm:px-3 shadow-sm bg-primary text-primary-foreground">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-6">
                <SheetTitle className="flex items-center gap-2 text-left mb-6">
                  <BookOpen className="h-5 w-5 text-primary" /> LibrisAI
                </SheetTitle>
                <div className="flex flex-col gap-2">
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
                          name={profile?.full_name || user.email || "Reader"}
                          path={profile?.avatar_url}
                          className="h-9 w-9"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold truncate text-foreground">
                            {profile?.full_name || "Reader Account"}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {user.email}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-primary mt-0.5">
                            {role} role
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
