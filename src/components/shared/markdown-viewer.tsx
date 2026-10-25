"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MarkdownViewerProps {
  content: string;
  theme?: "paper" | "parchment" | "midnight";
  fontFamily?: "serif" | "sans" | "mono";
  lineSpacing?: "normal" | "compact" | "relaxed" | "loose";
  searchQuery?: string;
  className?: string;
}

export function MarkdownViewer({
  content,
  theme = "paper",
  fontFamily = "serif",
  lineSpacing = "relaxed",
  searchQuery = "",
  className,
}: MarkdownViewerProps) {
  // Parse markdown lines into structured elements
  const blocks = useMemo(() => {
    if (!content) return [];
    const lines = content.split("\n");
    const result: Array<{
      type: "h1" | "h2" | "h3" | "h4" | "p" | "code" | "quote" | "list" | "table" | "hr";
      content: string;
      id?: string;
      items?: string[];
      tableRows?: string[][];
    }> = [];

    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let inTable = false;
    let tableBuffer: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle Code Blocks (```)
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          result.push({
            type: "code",
            content: codeBuffer.join("\n"),
          });
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Handle Tables (| ... |)
      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        inTable = true;
        const cells = line
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());
        // Skip separator row (e.g., | --- | --- |)
        if (!cells.every((c) => /^:?-+:?$/.test(c))) {
          tableBuffer.push(cells);
        }
        continue;
      } else if (inTable) {
        if (tableBuffer.length > 0) {
          result.push({
            type: "table",
            content: "",
            tableRows: [...tableBuffer],
          });
          tableBuffer = [];
        }
        inTable = false;
      }

      // Empty Line
      if (!line.trim()) continue;

      // Headers
      if (line.startsWith("# ")) {
        const text = line.slice(2).trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        result.push({ type: "h1", content: text, id });
      } else if (line.startsWith("## ")) {
        const text = line.slice(3).trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        result.push({ type: "h2", content: text, id });
      } else if (line.startsWith("### ")) {
        const text = line.slice(4).trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        result.push({ type: "h3", content: text, id });
      } else if (line.startsWith("#### ")) {
        const text = line.slice(5).trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        result.push({ type: "h4", content: text, id });
      }
      // Horizontal Rule
      else if (/^(\*\*\*|---|___)$/.test(line.trim())) {
        result.push({ type: "hr", content: "" });
      }
      // Blockquotes
      else if (line.startsWith("> ")) {
        result.push({ type: "quote", content: line.slice(2).trim() });
      }
      // Lists
      else if (/^[-*+]\s+/.test(line.trim()) || /^\d+\.\s+/.test(line.trim())) {
        const cleanItem = line.trim().replace(/^[-*+]\s+/, "").replace(/^\d+\.\s+/, "");
        const prev = result[result.length - 1];
        if (prev && prev.type === "list" && prev.items) {
          prev.items.push(cleanItem);
        } else {
          result.push({ type: "list", content: "", items: [cleanItem] });
        }
      }
      // Standard Paragraph
      else {
        result.push({ type: "p", content: line.trim() });
      }
    }

    if (inTable && tableBuffer.length > 0) {
      result.push({ type: "table", content: "", tableRows: tableBuffer });
    }

    return result;
  }, [content]);

  // Highlight matches if search query provided
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    // Bold replacement
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-bold text-foreground">{highlightSearch(part.slice(2, -2))}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={index} className="rounded bg-muted/80 px-1 py-0.5 font-mono text-[0.85em] text-primary border border-border/50">
            {highlightSearch(part.slice(1, -1))}
          </code>
        );
      }
      return <span key={index}>{highlightSearch(part)}</span>;
    });
  };

  const highlightSearch = (rawText: string) => {
    if (!searchQuery.trim()) return rawText;
    const regex = new RegExp(`(${searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
    const segments = rawText.split(regex);
    return segments.map((seg, i) =>
      regex.test(seg) ? (
        <mark key={i} className="bg-amber-300 dark:bg-amber-600/60 text-foreground px-0.5 rounded">
          {seg}
        </mark>
      ) : (
        seg
      )
    );
  };

  const fontClass =
    fontFamily === "serif"
      ? "font-serif"
      : fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  const spacingClass =
    lineSpacing === "compact" || lineSpacing === "normal"
      ? "leading-normal space-y-3"
      : lineSpacing === "loose"
      ? "leading-loose space-y-5"
      : "leading-relaxed space-y-4";

  const themeClass =
    theme === "parchment"
      ? "bg-[#FAF7F2] text-[#27272A] border-amber-200"
      : theme === "midnight"
      ? "bg-[#121620] text-[#DCE2EB] border-[#222A3A]"
      : "bg-card text-card-foreground border-border/70";

  return (
    <div className={cn("p-6 sm:p-8 rounded-2xl border transition-colors shadow-2xs", themeClass, fontClass, spacingClass, className)}>
      {blocks.map((block, idx) => {
        if (block.type === "h1") {
          return (
            <h1
              key={idx}
              id={block.id}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight pt-4 pb-2 border-b border-border/60 text-foreground scroll-mt-20"
            >
              {renderFormattedText(block.content)}
            </h1>
          );
        }
        if (block.type === "h2") {
          return (
            <h2
              key={idx}
              id={block.id}
              className="text-xl sm:text-2xl font-bold tracking-tight pt-4 pb-1 text-foreground scroll-mt-20"
            >
              {renderFormattedText(block.content)}
            </h2>
          );
        }
        if (block.type === "h3") {
          return (
            <h3
              key={idx}
              id={block.id}
              className="text-lg font-bold text-foreground pt-2 scroll-mt-20"
            >
              {renderFormattedText(block.content)}
            </h3>
          );
        }
        if (block.type === "h4") {
          return (
            <h4 key={idx} id={block.id} className="text-base font-semibold text-foreground pt-1 scroll-mt-20">
              {renderFormattedText(block.content)}
            </h4>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-primary/60 pl-4 py-1 italic text-muted-foreground bg-muted/20 rounded-r-lg"
            >
              {renderFormattedText(block.content)}
            </blockquote>
          );
        }
        if (block.type === "code") {
          return (
            <div key={idx} className="rounded-xl bg-muted/60 border border-border/60 p-4 font-mono text-xs overflow-x-auto leading-relaxed">
              <pre>{block.content}</pre>
            </div>
          );
        }
        if (block.type === "list" && block.items) {
          return (
            <ul key={idx} className="list-disc list-inside space-y-1.5 pl-2 text-sm">
              {block.items.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {renderFormattedText(item)}
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "table" && block.tableRows) {
          const [header, ...rows] = block.tableRows;
          return (
            <div key={idx} className="overflow-x-auto rounded-xl border border-border/70 my-3">
              <table className="w-full text-xs text-left">
                {header && (
                  <thead className="bg-muted/50 border-b border-border/70 font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      {header.map((col, cIdx) => (
                        <th key={cIdx} className="px-3 py-2">
                          {renderFormattedText(col)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-border/60">
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-muted/20 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-foreground">
                          {renderFormattedText(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === "hr") {
          return <hr key={idx} className="border-border/60 my-4" />;
        }
        return (
          <p key={idx} className="text-sm leading-relaxed text-foreground/90">
            {renderFormattedText(block.content)}
          </p>
        );
      })}
    </div>
  );
}
