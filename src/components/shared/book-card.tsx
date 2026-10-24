"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Bookmark, Download, Clock, Sparkles, FolderPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileTypeBadge } from "@/components/shared/status-badge";
import { formatDuration } from "@/lib/utils";
import type { Book, Category } from "@/integrations/supabase/types";

export interface BookCardProps {
  book: Book & { categories?: Category | null };
  isSaved?: boolean;
  onToggleSave?: (bookId: string) => void;
  onAddToCollection?: (book: { id: string; title: string }) => void;
}

export function BookCard({ book, isSaved = false, onToggleSave, onAddToCollection }: BookCardProps) {
  const categoryName = book.categories?.name || "General";

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      <div>
        {/* Cover Image or Fallback */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-indigo-500/10 via-background to-secondary">
              <BookOpen className="h-10 w-10 text-primary/60 mb-2" />
              <p className="text-xs font-semibold text-foreground line-clamp-2">{book.title}</p>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{book.author}</p>
            </div>
          )}

          {/* Top badges overlay */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <FileTypeBadge type={book.file_type} className="shadow-sm backdrop-blur-md bg-background/90" />
            {book.is_featured && (
              <Badge variant="secondary" className="shadow-sm backdrop-blur-md bg-amber-500/90 text-white font-medium text-[10px] gap-1 px-1.5 py-0.5">
                <Sparkles className="h-3 w-3" /> Featured
              </Badge>
            )}
          </div>
        </div>

        {/* Content details */}
        <div className="mt-3.5 space-y-1.5">
          <Badge variant="outline" className="text-[11px] py-0 px-2 text-muted-foreground font-normal">
            {categoryName}
          </Badge>

          <h3 className="text-base font-semibold text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
            <Link href={`/books/${book.id}`}>{book.title}</Link>
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-1">by {book.author}</p>

          {book.ai_summary && (
            <p className="text-xs text-muted-foreground/90 line-clamp-2 pt-1 leading-relaxed bg-muted/40 p-2 rounded-md border border-border/50">
              <span className="font-semibold text-primary">AI Insight:</span> {book.ai_summary}
            </p>
          )}
        </div>
      </div>

      {/* Footer Stats & Actions */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {book.page_count ? (
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {book.page_count}p
            </span>
          ) : book.duration_seconds ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(book.duration_seconds)}
            </span>
          ) : null}

          <span className="flex items-center gap-1">
            <Download className="h-3.5 w-3.5" />
            {book.download_count}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onToggleSave && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => onToggleSave(book.id)}
              aria-label={isSaved ? "Remove bookmark" : "Bookmark this book"}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
            </Button>
          )}

          {onAddToCollection && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => onAddToCollection({ id: book.id, title: book.title })}
              aria-label="Add to Research Collection"
              title="Add to Collection"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          )}

          <Button asChild size="sm" variant="outline" className="h-8 text-xs font-medium">
            <Link href={`/books/${book.id}`}>Read</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
