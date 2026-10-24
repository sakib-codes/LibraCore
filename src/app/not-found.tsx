import Link from "next/link";
import { BookOpen, Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
        <BookOpen className="h-10 w-10" />
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground mb-4">
        <span>Error 404</span>
        <span>•</span>
        <span>Catalog Item Not Located</span>
      </div>

      <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground max-w-lg mb-4">
        Page or Manuscript Not Found
      </h1>

      <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
        The digital resource, shelf section, or page you requested could not be located in the LibrisAI library archives. It may have been archived or re-indexed.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="default" className="gap-2 bg-primary text-primary-foreground shadow-sm">
          <Link href="/">
            <Home className="h-4 w-4" /> Return to Catalog
          </Link>
        </Button>
        <Button asChild variant="outline" size="default" className="gap-2">
          <Link href="/categories">
            <Compass className="h-4 w-4" /> Browse Categories
          </Link>
        </Button>
      </div>

      <div className="mt-12 pt-8 border-t border-border/60 max-w-sm w-full text-xs text-muted-foreground">
        Need assistance? Use the <span className="font-semibold text-foreground">Ask AI Librarian</span> widget in the bottom right corner for immediate catalog search and guidance.
      </div>
    </div>
  );
}
