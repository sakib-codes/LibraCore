"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Columns,
  Scroll,
  AlertCircle,
  BookOpen,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Configure PDF.js worker
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PdfCanvasViewerProps {
  fileUrl: string;
  currentPage: number;
  zoomLevel: number;
  paperTheme?: "paper" | "parchment" | "midnight";
  onPageChange?: (page: number) => void;
  onTotalPagesLoaded?: (totalPages: number) => void;
  onSwitchToManuscript?: () => void;
}

export function PdfCanvasViewer({
  fileUrl,
  currentPage,
  zoomLevel,
  paperTheme = "paper",
  onPageChange,
  onTotalPagesLoaded,
  onSwitchToManuscript,
}: PdfCanvasViewerProps) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [rendering, setRendering] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"single" | "continuous">("single");
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeRenderTaskRef = useRef<RenderTask | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Derive usable URL (proxy remote URLs to bypass CORS)
  const resolvedPdfUrl = useCallback(() => {
    if (!fileUrl) return "/sample-monograph.pdf";
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return `/api/pdf/proxy?url=${encodeURIComponent(fileUrl)}`;
    }
    return fileUrl;
  }, [fileUrl]);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setLoadError(null);

    const targetUrl = resolvedPdfUrl();

    const loadingTask = pdfjsLib.getDocument({
      url: targetUrl,
      withCredentials: false,
    });

    loadingTask.promise
      .then((loadedDoc) => {
        if (isCancelled) return;
        setDoc(loadedDoc);
        setNumPages(loadedDoc.numPages);
        if (onTotalPagesLoaded) {
          onTotalPagesLoaded(loadedDoc.numPages);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.warn("[PDF.js Primary Load Warning]:", err);
        // Secondary fallback to local sample monograph
        const fallbackTask = pdfjsLib.getDocument("/sample-monograph.pdf");
        fallbackTask.promise
          .then((sampleDoc) => {
            if (isCancelled) return;
            setDoc(sampleDoc);
            setNumPages(sampleDoc.numPages);
            if (onTotalPagesLoaded) {
              onTotalPagesLoaded(sampleDoc.numPages);
            }
            setLoading(false);
          })
          .catch((sampleErr) => {
            if (isCancelled) return;
            console.error("[PDF.js Sample Fallback Failed]:", sampleErr);
            setLoadError(
              "Unable to stream binary PDF file. The digital manuscript preview remains fully available."
            );
            setLoading(false);
          });
      });

    return () => {
      isCancelled = true;
      loadingTask.destroy();
    };
  }, [resolvedPdfUrl, onTotalPagesLoaded]);

  // Render Active Single Page onto Canvas
  const renderSinglePage = useCallback(
    async (pageNumber: number) => {
      if (!doc || !canvasRef.current || viewMode !== "single") return;

      try {
        setRendering(true);

        // Cancel running render task to prevent concurrency conflict
        if (activeRenderTaskRef.current) {
          try {
            activeRenderTaskRef.current.cancel();
          } catch {
            // ignore cancel exception
          }
          activeRenderTaskRef.current = null;
        }

        const page: PDFPageProxy = await doc.getPage(pageNumber);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return;

        // Base scale derived from zoomLevel (100 = 1.0)
        const baseScale = (zoomLevel / 100) * 1.35;
        const viewport = page.getViewport({ scale: baseScale, rotation });

        // High-DPI Retina Screen Support
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        context.save();
        context.scale(pixelRatio, pixelRatio);

        // Clear canvas
        context.fillStyle = paperTheme === "midnight" ? "#090D16" : "#ffffff";
        context.fillRect(0, 0, viewport.width, viewport.height);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        activeRenderTaskRef.current = renderTask;

        await renderTask.promise;
        context.restore();
        setRendering(false);
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("[PDF Render Page Error]:", err);
        }
        setRendering(false);
      }
    },
    [doc, zoomLevel, rotation, paperTheme, viewMode]
  );

  // Trigger render when dependencies update
  useEffect(() => {
    if (viewMode === "single" && doc && currentPage >= 1 && currentPage <= numPages) {
      renderSinglePage(currentPage);
    }
  }, [doc, currentPage, numPages, zoomLevel, rotation, paperTheme, viewMode, renderSinglePage]);

  // Continuous View Page Renderer Subcomponent
  const ContinuousPageItem = ({
    pageIndex,
    docProxy,
  }: {
    pageIndex: number;
    docProxy: PDFDocumentProxy;
  }) => {
    const itemCanvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
      let isSubCancelled = false;
      let subRenderTask: RenderTask | null = null;

      docProxy.getPage(pageIndex).then((p) => {
        if (isSubCancelled || !itemCanvasRef.current) return;
        const canvas = itemCanvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        const baseScale = (zoomLevel / 100) * 1.35;
        const vp = p.getViewport({ scale: baseScale, rotation });
        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = Math.floor(vp.width * pixelRatio);
        canvas.height = Math.floor(vp.height * pixelRatio);
        canvas.style.width = `${Math.floor(vp.width)}px`;
        canvas.style.height = `${Math.floor(vp.height)}px`;

        ctx.save();
        ctx.scale(pixelRatio, pixelRatio);
        ctx.fillStyle = paperTheme === "midnight" ? "#121620" : "#ffffff";
        ctx.fillRect(0, 0, vp.width, vp.height);

        subRenderTask = p.render({ canvasContext: ctx, viewport: vp });
        subRenderTask.promise
          .then(() => ctx.restore())
          .catch((e) => {
            if (e?.name !== "RenderingCancelledException") {
              console.warn("Sub page render warning:", e);
            }
          });
      });

      return () => {
        isSubCancelled = true;
        if (subRenderTask) {
          try {
            subRenderTask.cancel();
          } catch {
            // ignore
          }
        }
      };
    }, [pageIndex, docProxy]);

    return (
      <div className="flex flex-col items-center my-4 relative group">
        <div className="mb-2 text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
          Page {pageIndex} of {numPages}
        </div>
        <div
          className={`rounded-xl overflow-hidden shadow-md border transition-all ${
            paperTheme === "parchment"
              ? "border-amber-200/50 shadow-amber-900/5"
              : paperTheme === "midnight"
              ? "border-[#222A3A] shadow-2xl"
              : "border-border/80 shadow-black/5"
          }`}
          style={
            paperTheme === "midnight"
              ? { filter: "invert(0.9) hue-rotate(180deg) brightness(0.95)" }
              : undefined
          }
        >
          <canvas ref={itemCanvasRef} className="block max-w-full" />
        </div>
      </div>
    );
  };

  // Thumbnail Navigation Generator
  const thumbnails = Array.from({ length: numPages || 0 }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 min-h-[460px] text-muted-foreground w-full">
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <Sparkles className="h-4 w-4 text-emerald-500 absolute -top-1 -right-1" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-foreground">Streaming Binary PDF Data...</p>
          <p className="text-xs text-muted-foreground">
            Initializing high-DPI HTML5 canvas renderer via pdfjs-dist
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[440px] text-center max-w-md mx-auto">
        <div className="p-3 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-foreground text-base">Binary PDF Unavailable</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{loadError}</p>
        </div>
        {onSwitchToManuscript && (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onSwitchToManuscript}
            className="gap-2 text-xs font-semibold"
          >
            <BookOpen className="h-4 w-4" />
            Switch to Typeset Manuscript
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col w-full h-full">
      {/* Canvas Streamer Sub-Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border/70 bg-card/70 px-3 sm:px-4 py-2 gap-2 text-xs">
        {/* Left: View Mode Toggle & Thumbnail Sidebar Toggle */}
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant={showThumbnails ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowThumbnails(!showThumbnails)}
            className="h-7 px-2.5 text-xs gap-1.5 font-medium"
            title="Toggle Page Navigation Drawer"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Thumbnails</span>
            <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 font-mono">
              {numPages}
            </Badge>
          </Button>

          <div className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode("single")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
                viewMode === "single"
                  ? "bg-card text-foreground font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Single Page Mode"
            >
              <Columns className="h-3 w-3" />
              <span>Single</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("continuous")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
                viewMode === "continuous"
                  ? "bg-card text-foreground font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Continuous Scroll Stream"
            >
              <Scroll className="h-3 w-3" />
              <span>Scroll</span>
            </button>
          </div>
        </div>

        {/* Right: Rotation & Rendering Status */}
        <div className="flex items-center gap-1.5">
          {rendering && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground mr-1">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="hidden sm:inline">Rendering canvas...</span>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-md"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            title="Rotate 90 degrees clockwise"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>

          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono py-0.5 px-2">
            Canvas Streamer Active
          </Badge>
        </div>
      </div>

      {/* Main Content Area: Left Thumbnail Drawer + Canvas Center */}
      <div className="flex flex-1 w-full overflow-hidden relative min-h-[500px]">
        {/* Collapsible Left Thumbnail Jump Drawer */}
        {showThumbnails && (
          <aside className="w-36 sm:w-44 border-r border-border/70 bg-card/50 overflow-y-auto p-2 space-y-2 shrink-0 animate-in slide-in-from-left-2 duration-200 max-h-[700px]">
            <div className="text-[10px] font-mono font-bold uppercase text-muted-foreground px-1 pb-1 border-b border-border/50">
              Pages ({numPages})
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {thumbnails.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    if (onPageChange) onPageChange(p);
                    if (viewMode === "single") renderSinglePage(p);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all text-left ${
                    currentPage === p
                      ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                      : "hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-border/40"
                  }`}
                >
                  <span>Page {p}</span>
                  {currentPage === p && <span className="text-[10px]">●</span>}
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Canvas Display Viewport */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-muted/20"
        >
          {viewMode === "single" ? (
            /* Single Page View */
            <div className="flex flex-col items-center justify-center transition-all">
              <div
                className={`rounded-2xl overflow-hidden shadow-xl border transition-all ${
                  paperTheme === "parchment"
                    ? "border-amber-200/50 shadow-amber-900/10"
                    : paperTheme === "midnight"
                    ? "border-[#222A3A] shadow-2xl"
                    : "border-border/80 shadow-black/10"
                }`}
                style={
                  paperTheme === "midnight"
                    ? { filter: "invert(0.9) hue-rotate(180deg) brightness(0.95)" }
                    : undefined
                }
              >
                <canvas ref={canvasRef} className="block max-w-full" />
              </div>
            </div>
          ) : (
            /* Continuous Vertical Stream */
            <div className="flex flex-col items-center w-full py-4 space-y-6">
              {doc &&
                thumbnails.map((p) => (
                  <ContinuousPageItem key={p} pageIndex={p} docProxy={doc} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
