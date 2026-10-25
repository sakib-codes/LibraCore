"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Bookmark, Download, Clock, Sparkles, FolderPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileTypeBadge } from "@/components/shared/status-badge";
import { formatDuration, getCoverUrl } from "@/lib/utils";
import type { Book, Category } from "@/integrations/supabase/types";

export interface BookCardProps {
  book: Book & { categories?: Category | null };
  isSaved?: boolean;
  onToggleSave?: (bookId: string) => void;
  onAddToCollection?: (book: { id: string; title: string }) => void;
  variant?: "grid" | "list";
}

export function BookCard({
  book,
  isSaved = false,
  onToggleSave,
  onAddToCollection,
  variant = "grid",
}: BookCardProps) {
  const categoryName = book.categories?.name || "General";
  const displayCover = getCoverUrl(book.cover_url);

  // Dense Scholarly List / Row View (Zero-Scroll Compact Layout)
  if (variant === "list") {
    return (
      <article className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-xl border border-border/70 bg-card p-3 card-hover-effect shadow-2xs">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Compact Cover Thumbnail */}
          <div className="relative h-20 w-16 sm:h-22 sm:w-18 shrink-0 overflow-hidden rounded-lg bg-muted border border-border/60">
            {displayCover ? (
              <Image
                src={displayCover}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="80px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Metadata & Summary */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.2 text-[10px] font-medium text-muted-foreground border border-border/60">
                {categoryName}
              </span>
              <FileTypeBadge type={book.file_type} className="text-[10px] py-0 px-2" />
              {book.published_year && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {book.published_year} Edition
                </span>
              )}
              {book.is_featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.2 text-[10px] font-medium text-amber-400 border border-border/60">
                  <Sparkles className="h-2.5 w-2.5" /> Featured
                </span>
              )}
            </div>

            <h3 className="text-xs sm:text-sm font-semibold text-foreground/95 tracking-tight truncate group-hover:text-primary transition-colors">
              <Link href={`/books/${book.id}`}>{book.title}</Link>
            </h3>

            <p className="text-xs text-muted-foreground truncate font-medium">
              {book.author} • {book.publisher || "Academic Press"}
            </p>

            {book.ai_summary && (
              <p className="text-[11px] text-muted-foreground/80 line-clamp-1 hidden md:block">
                <span className="font-semibold text-primary/90">AI Insight:</span> {book.ai_summary}
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions & Stats */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 border-border/50 pt-2 sm:pt-0">
          <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] text-muted-foreground mr-1">
            {book.page_count ? (
              <span>{book.page_count}p</span>
            ) : book.duration_seconds ? (
              <span>{formatDuration(book.duration_seconds)}</span>
            ) : null}
            <span>•</span>
            <span>{book.download_count} dl</span>
          </div>

          {onToggleSave && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary transition-colors"
              onClick={() => onToggleSave(book.id)}
              aria-label={isSaved ? "Remove bookmark" : "Bookmark this monograph"}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-primary text-primary" : ""}`} />
            </Button>
          )}

          {onAddToCollection && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary transition-colors"
              onClick={() => onAddToCollection({ id: book.id, title: book.title })}
              title="Add to Research Collection"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button asChild size="sm" className="h-8 px-3 text-xs font-medium rounded-full bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90">
            <Link href={`/books/${book.id}`}>Read</Link>
          </Button>
        </div>
      </article>
    );
  }

  // Compact Grid View (Capped Cover Height to eliminate giant scrolling)
  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-3.5 card-hover-effect shadow-2xs">
      <div>
        {/* Compact Cover Image (Capped Height: 176px max, never stretching to 500px+) */}
        <div className="relative h-40 sm:h-44 w-full overflow-hidden rounded-xl bg-muted/60 border border-border/60">
          {displayCover ? (
            <Image
              src={displayCover}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-indigo-500/10 via-background to-secondary">
              <BookOpen className="h-8 w-8 text-primary/60 mb-1.5" />
              <p className="text-xs font-semibold text-foreground/90 line-clamp-1">{book.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{book.author}</p>
            </div>
          )}

          {/* Top badges overlay */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <FileTypeBadge type={book.file_type} className="shadow-xs backdrop-blur-md bg-background/90 text-[10px] py-0 px-2" />
            {book.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/90 backdrop-blur-md border border-border/80 px-2 py-0.5 text-[10px] font-medium text-amber-400 shadow-xs">
                <Sparkles className="h-2.5 w-2.5" /> Featured
              </span>
            )}
          </div>
        </div>

        {/* Content details */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.2 text-[10px] font-medium text-muted-foreground border border-border/60">
              {categoryName}
            </span>
            {book.published_year && (
              <span className="text-[10px] text-muted-foreground font-mono">
                • {book.published_year}
              </span>
            )}
          </div>

          <h3 className="text-xs sm:text-sm font-semibold text-foreground/95 tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
            <Link href={`/books/${book.id}`}>{book.title}</Link>
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-1 font-medium">{book.author}</p>

          {book.ai_summary && (
            <p className="text-[11px] text-muted-foreground/80 line-clamp-1 pt-0.5">
              <span className="font-semibold text-primary/90">AI:</span> {book.ai_summary}
            </p>
          )}
        </div>
      </div>

      {/* Footer Stats & Actions */}
      <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-mono text-[10px]">
          {book.page_count ? (
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-muted-foreground" />
              {book.page_count}p
            </span>
          ) : book.duration_seconds ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {formatDuration(book.duration_seconds)}
            </span>
          ) : null}

          <span className="flex items-center gap-1">
            <Download className="h-3 w-3 text-muted-foreground" />
            {book.download_count}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onToggleSave && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary transition-colors"
              onClick={() => onToggleSave(book.id)}
              aria-label={isSaved ? "Remove bookmark" : "Bookmark this book"}
            >
              <Bookmark className={`h-3 w-3 ${isSaved ? "fill-primary text-primary" : ""}`} />
            </Button>
          )}

          {onAddToCollection && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary transition-colors"
              onClick={() => onAddToCollection({ id: book.id, title: book.title })}
              aria-label="Add to Research Collection"
              title="Add to Collection"
            >
              <FolderPlus className="h-3 w-3" />
            </Button>
          )}

          <Button asChild size="sm" className="h-7 px-2.5 text-xs font-medium rounded-full bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90">
            <Link href={`/books/${book.id}`}>Read</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
