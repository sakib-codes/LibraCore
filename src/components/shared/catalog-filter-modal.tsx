"use client";

import { useState } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  Calendar,
  Shield,
  FileText,
  Star,
  ArrowUpDown,
  Sparkles,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface FilterCriteria {
  minYear: number;
  maxYear: number;
  accessTier: "all" | "open-access" | "peer-reviewed";
  format: "ALL" | "PDF" | "EPUB" | "AUDIO";
  minRating: number;
  sortBy: "popular" | "recent" | "citations" | "year";
}

export const DEFAULT_FILTER_CRITERIA: FilterCriteria = {
  minYear: 2010,
  maxYear: 2026,
  accessTier: "all",
  format: "ALL",
  minRating: 0,
  sortBy: "popular",
};

interface CatalogFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  criteria: FilterCriteria;
  onApply: (criteria: FilterCriteria) => void;
  onReset: () => void;
  totalResultsCount?: number;
}

export function CatalogFilterModal({
  open,
  onOpenChange,
  criteria,
  onApply,
  onReset,
  totalResultsCount,
}: CatalogFilterModalProps) {
  const [localCriteria, setLocalCriteria] = useState<FilterCriteria>(criteria);

  // Synchronize when opening
  const handleOpen = (val: boolean) => {
    if (val) {
      setLocalCriteria(criteria);
    }
    onOpenChange(val);
  };

  const handleApply = () => {
    onApply(localCriteria);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalCriteria(DEFAULT_FILTER_CRITERIA);
    onReset();
    onOpenChange(false);
  };

  const activeFiltersCount = [
    localCriteria.minYear > 2010 || localCriteria.maxYear < 2026,
    localCriteria.accessTier !== "all",
    localCriteria.format !== "ALL",
    localCriteria.minRating > 0,
    localCriteria.sortBy !== "popular",
  ].filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-border bg-card">
        {/* Header */}
        <DialogHeader className="p-5 border-b border-border/80 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-foreground tracking-tight flex items-center gap-2">
                  <span>Filter & Refine Catalog</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] font-bold">
                      {activeFiltersCount} Active
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Multi-criteria research taxonomy & publication index filters
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Filter Body */}
        <div className="p-6 space-y-6 text-xs">
          {/* 1. Publication Year Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>Publication Year Range</span>
              </label>
              <span className="font-mono text-xs font-semibold text-primary">
                {localCriteria.minYear} – {localCriteria.maxYear}
              </span>
            </div>

            {/* Quick Year Presets */}
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={localCriteria.minYear === 2010 && localCriteria.maxYear === 2026 ? "default" : "outline"}
                className="h-7 text-[11px] font-medium"
                onClick={() => setLocalCriteria({ ...localCriteria, minYear: 2010, maxYear: 2026 })}
              >
                All Years
              </Button>
              <Button
                type="button"
                size="sm"
                variant={localCriteria.minYear === 2024 ? "default" : "outline"}
                className="h-7 text-[11px] font-medium"
                onClick={() => setLocalCriteria({ ...localCriteria, minYear: 2024, maxYear: 2026 })}
              >
                2024–2026 (Recent)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={localCriteria.minYear === 2020 && localCriteria.maxYear === 2023 ? "default" : "outline"}
                className="h-7 text-[11px] font-medium"
                onClick={() => setLocalCriteria({ ...localCriteria, minYear: 2020, maxYear: 2023 })}
              >
                2020–2023
              </Button>
              <Button
                type="button"
                size="sm"
                variant={localCriteria.maxYear === 2019 ? "default" : "outline"}
                className="h-7 text-[11px] font-medium"
                onClick={() => setLocalCriteria({ ...localCriteria, minYear: 1990, maxYear: 2019 })}
              >
                Pre-2020 (Historical)
              </Button>
            </div>

            {/* Sliders */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground w-8">From</span>
                <input
                  type="range"
                  min="1990"
                  max="2026"
                  value={localCriteria.minYear}
                  onChange={(e) =>
                    setLocalCriteria({
                      ...localCriteria,
                      minYear: Math.min(parseInt(e.target.value, 10), localCriteria.maxYear),
                    })
                  }
                  className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                />
                <span className="font-mono text-xs w-10 text-right font-medium">{localCriteria.minYear}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground w-8">To</span>
                <input
                  type="range"
                  min="1990"
                  max="2026"
                  value={localCriteria.maxYear}
                  onChange={(e) =>
                    setLocalCriteria({
                      ...localCriteria,
                      maxYear: Math.max(parseInt(e.target.value, 10), localCriteria.minYear),
                    })
                  }
                  className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                />
                <span className="font-mono text-xs w-10 text-right font-medium">{localCriteria.maxYear}</span>
              </div>
            </div>
          </div>

          {/* 2. Academic Access Tier */}
          <div className="space-y-2.5">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Academic Access Tier</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div
                onClick={() => setLocalCriteria({ ...localCriteria, accessTier: "all" })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  localCriteria.accessTier === "all"
                    ? "border-primary bg-primary/5 shadow-2xs font-bold"
                    : "border-border/80 hover:border-border bg-card"
                }`}
              >
                <div className="font-bold text-foreground">All Tiers</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Complete repository collection</div>
              </div>

              <div
                onClick={() => setLocalCriteria({ ...localCriteria, accessTier: "open-access" })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  localCriteria.accessTier === "open-access"
                    ? "border-emerald-500 bg-emerald-500/10 shadow-2xs font-bold"
                    : "border-border/80 hover:border-border bg-card"
                }`}
              >
                <div className="font-bold text-emerald-600 dark:text-emerald-400">Open Access</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Free public digital download</div>
              </div>

              <div
                onClick={() => setLocalCriteria({ ...localCriteria, accessTier: "peer-reviewed" })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  localCriteria.accessTier === "peer-reviewed"
                    ? "border-indigo-500 bg-indigo-500/10 shadow-2xs font-bold"
                    : "border-border/80 hover:border-border bg-card"
                }`}
              >
                <div className="font-bold text-indigo-600 dark:text-indigo-400">Peer Reviewed</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Institutional review verified</div>
              </div>
            </div>
          </div>

          {/* 3. File Format */}
          <div className="space-y-2.5">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>File Format</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["ALL", "PDF", "EPUB", "AUDIO"] as const).map((fmt) => (
                <Button
                  key={fmt}
                  type="button"
                  size="sm"
                  variant={localCriteria.format === fmt ? "default" : "outline"}
                  onClick={() => setLocalCriteria({ ...localCriteria, format: fmt })}
                  className="h-8 text-xs font-semibold justify-center"
                >
                  {fmt === "ALL" ? "All Formats" : fmt}
                </Button>
              ))}
            </div>
          </div>

          {/* 4. Minimum Academic Rating */}
          <div className="space-y-2.5">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span>Academic Rating & Citations</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Any Rating", val: 0 },
                { label: "★ 4.0+ Stars", val: 4.0 },
                { label: "★ 4.5+ Stars", val: 4.5 },
                { label: "★ 4.8+ Top Cited", val: 4.8 },
              ].map((item) => (
                <Button
                  key={item.val}
                  type="button"
                  size="sm"
                  variant={localCriteria.minRating === item.val ? "default" : "outline"}
                  onClick={() => setLocalCriteria({ ...localCriteria, minRating: item.val })}
                  className="h-8 text-xs font-semibold justify-center"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 5. Sort By */}
          <div className="space-y-2.5">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
              <span>Sort Index By</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Most Downloaded", val: "popular" as const },
                { label: "Recently Added", val: "recent" as const },
                { label: "Citations", val: "citations" as const },
                { label: "Publication Year", val: "year" as const },
              ].map((sort) => (
                <Button
                  key={sort.val}
                  type="button"
                  size="sm"
                  variant={localCriteria.sortBy === sort.val ? "default" : "outline"}
                  onClick={() => setLocalCriteria({ ...localCriteria, sortBy: sort.val })}
                  className="h-8 text-xs font-semibold justify-center"
                >
                  {sort.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/80 bg-muted/20 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="text-xs font-semibold bg-primary text-primary-foreground gap-1.5 shadow-xs"
            >
              <Check className="h-3.5 w-3.5" />
              Apply Filters
              {totalResultsCount !== undefined && ` (${totalResultsCount} Results)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
