"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Parses inline markdown:
 * - **bold text** -> <strong>
 * - `code text` -> <code>
 * - [Link Text](url) -> Next.js <Link> or <a>
 * - Incomplete bold while typing (**text) -> clean <strong> without asterisks
 */
export function parseInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match full links, bold text, code, or trailing incomplete bold tokens
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*\*[^*]+$)/g;
  const parts = text.split(tokenRegex);

  return parts.filter(Boolean).map((part, i) => {
    // 1. Link: [text](href)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const linkHref = linkMatch[2];
      const isInternal = linkHref.startsWith("/");
      if (isInternal) {
        return (
          <Link
            key={i}
            href={linkHref}
            className="text-primary font-semibold underline decoration-primary/40 underline-offset-2 hover:decoration-primary transition-colors inline-flex items-center gap-0.5"
          >
            {linkText}
            <ArrowUpRight className="h-3 w-3 inline shrink-0" />
          </Link>
        );
      }
      return (
        <a
          key={i}
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-semibold underline decoration-primary/40 underline-offset-2 hover:decoration-primary transition-colors inline-flex items-center gap-0.5"
        >
          {linkText}
          <ArrowUpRight className="h-3 w-3 inline shrink-0" />
        </a>
      );
    }

    // 2. Complete Bold: **bold**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // 3. Incomplete Bold at end while typing: **something
    if (part.startsWith("**") && !part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-foreground">
          {part.slice(2)}
        </strong>
      );
    }

    // 4. Code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={i}
          className="rounded bg-muted/80 px-1 py-0.5 font-mono text-[11px] text-primary border border-border/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Standard plain text
    return <span key={i}>{part}</span>;
  });
}

interface ChatFormattedMessageProps {
  content: string;
  isTyping?: boolean;
  className?: string;
}

export function ChatFormattedMessage({
  content,
  isTyping = false,
  className,
}: ChatFormattedMessageProps) {
  if (!content && isTyping) {
    return (
      <span className="inline-block h-3.5 w-1.5 bg-primary animate-pulse align-middle rounded-full" />
    );
  }

  const lines = content.split("\n");

  // Group items into blocks (paragraphs vs lists)
  const blocks: Array<
    | { type: "p"; text: string }
    | { type: "list"; items: string[] }
    | { type: "space" }
  > = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      blocks.push({ type: "space" });
      continue;
    }

    const isBullet = /^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed);
    if (isBullet) {
      const cleanItem = trimmed.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "");
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock && lastBlock.type === "list") {
        lastBlock.items.push(cleanItem);
      } else {
        blocks.push({ type: "list", items: [cleanItem] });
      }
    } else {
      blocks.push({ type: "p", text: rawLine });
    }
  }

  return (
    <div className={cn("space-y-2 text-xs leading-relaxed", className)}>
      {blocks.map((block, idx) => {
        if (block.type === "space") {
          return <div key={idx} className="h-1" />;
        }

        if (block.type === "list") {
          return (
            <ul key={idx} className="space-y-1.5 my-1.5 pl-0.5">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/80 mt-1.5 shrink-0" />
                  <span className="flex-1">{parseInlineMarkdown(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {parseInlineMarkdown(block.text)}
          </p>
        );
      })}

      {isTyping && (
        <span className="inline-block h-3.5 w-1.5 bg-primary animate-pulse ml-0.5 align-middle rounded-full" />
      )}
    </div>
  );
}
