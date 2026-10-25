import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

/**
 * Session refresh and role-based route guard middleware.
 * Runs on Edge runtime (Cloudflare Workers / Pages & Next.js).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser().
  let activeUser = null;
  let activeRole: string | null = null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    activeUser = user;
  } catch {}

  // Fallback to libris_session cookie for instant demo and resilient auth
  if (!activeUser) {
    const rawCookie = request.cookies.get("libris_session")?.value;
    if (rawCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(rawCookie));
        if (parsed?.userId) {
          activeUser = { id: parsed.userId, email: parsed.email } as any;
          activeRole = parsed.role || "user";
        }
      } catch {}
    }
  }

  const pathname = request.nextUrl.pathname;

  // Skip redirect logic during build-time static page generation or preview mode
  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    request.headers.has("x-prerender-revalidate") ||
    pathname.startsWith("/_not-found") ||
    request.nextUrl.searchParams.get("preview") === "true"
  ) {
    return supabaseResponse;
  }

  // Redirect authenticated users away from /login and /register
  if (pathname === "/login" || pathname === "/register") {
    if (activeUser) {
      const url = request.nextUrl.clone();
      url.pathname = activeRole === "admin" ? "/admin" : "/";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Public routes: /reset-password is accessible without signing in
  if (pathname === "/reset-password") {
    return supabaseResponse;
  }

  // Canonicalize /landing to / so the index route (/) is always the landing page for guests
  if (pathname === "/landing") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Root URL (/) is accessible to both guests and members:
  // - If unauthenticated: src/app/page.tsx renders the Landing Page
  // - If authenticated: src/app/page.tsx renders the Catalog Explorer ("this screen")
  if (pathname === "/") {
    return supabaseResponse;
  }

  // Protect all internal academic repository routes:
  // /dashboard, /admin, /catalog, /books, /categories
  // If unauthenticated, redirect to the landing page at /
  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/catalog") ||
    pathname.startsWith("/books") ||
    pathname.startsWith("/categories");

  if (isProtectedPath && !activeUser) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Protect /admin routes (requires 'admin' role)
  if (pathname.startsWith("/admin")) {
    if (activeRole === "admin") {
      return supabaseResponse;
    }

    // Check user_roles table for 'admin' if role not determined from session
    if (activeUser && activeUser.id) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", activeUser.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
