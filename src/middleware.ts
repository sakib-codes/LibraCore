import { updateSession } from "@/integrations/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _not-found (internal Next.js 404 page)
     * - favicon.svg (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|_not-found|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
