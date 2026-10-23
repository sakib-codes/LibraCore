"use client";

import { useState, useRef } from "react";
import {
  FileText,
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Maximize2,
  Download,
  ZoomIn,
  ZoomOut,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileTypeBadge } from "@/components/shared/status-badge";
import { formatDuration } from "@/lib/utils";
import type { FileType } from "@/integrations/supabase/types";

interface BookPreviewReaderProps {
  title: string;
  author: string;
  fileUrl: string;
  fileType: FileType;
  durationSeconds?: number | null;
  onDownload?: () => void;
}

export function BookPreviewReader({
  title,
  author,
  fileUrl,
  fileType,
  durationSeconds,
  onDownload,
}: BookPreviewReaderProps) {
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Image Zoom State
  const [zoomLevel, setZoomLevel] = useState(1);

  // Text Reader Font Size
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const changePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  return (
    <div className="flex flex-col w-full rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Viewer Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/40 px-4 py-3 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <FileTypeBadge type={fileType} />
          <span className="text-xs text-muted-foreground truncate hidden sm:inline">
            In-Browser Previewer
          </span>
        </div>

        <div className="flex items-center gap-2">
          {fileType === "IMAGE" && (
            <div className="flex items-center gap-1 bg-background/80 rounded-lg p-0.5 border border-border">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                title="Zoom out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-[11px] px-1 font-mono">{Math.round(zoomLevel * 100)}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                title="Zoom in"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {(fileType === "DOC" || fileType === "EPUB") && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground mr-1">Text:</span>
              {(["sm", "base", "lg"] as const).map((size) => (
                <Button
                  key={size}
                  variant={fontSize === size ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setFontSize(size)}
                >
                  {size.toUpperCase()}
                </Button>
              ))}
            </div>
          )}

          {onDownload && (
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={onDownload}>
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
          )}

          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild title="Open original">
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Viewer Body By Type */}
      <div className="relative min-h-[360px] sm:min-h-[420px] max-h-[640px] flex items-center justify-center bg-muted/20 overflow-auto p-3 sm:p-4">
        {/* 1. AUDIO VIEWER */}
        {fileType === "AUDIO" && (
          <div className="flex flex-col items-center justify-center w-full max-w-md p-4 sm:p-6 bg-card rounded-2xl border border-border shadow-md space-y-4 sm:space-y-5 my-4 sm:my-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Headphones className="h-10 w-10 animate-pulse" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-lg font-bold text-foreground">{title}</h4>
              <p className="text-sm text-muted-foreground">Narrated edition by {author}</p>
            </div>

            <audio
              ref={audioRef}
              src={fileUrl}
              onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Scrubber */}
            <div className="w-full space-y-1.5">
              <input
                type="range"
                min={0}
                max={durationSeconds || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(durationSeconds || 0)}</span>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={() => {
                  if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 15);
                }}
                title="Rewind 15s"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                className="rounded-full h-14 w-14 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={toggleAudio}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-10 px-3 text-xs font-mono"
                onClick={changePlaybackRate}
                title="Playback speed"
              >
                {playbackRate}x
              </Button>
            </div>
          </div>
        )}

        {/* 2. PDF VIEWER */}
        {fileType === "PDF" && (
          <div className="w-full h-[420px] sm:h-[580px] rounded-xl overflow-hidden border border-border bg-background shadow-inner flex flex-col">
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              title={title}
              className="w-full h-full border-none"
            />
          </div>
        )}

        {/* 3. IMAGE / MANUSCRIPT VIEWER */}
        {fileType === "IMAGE" && (
          <div className="flex items-center justify-center overflow-auto max-w-full">
            <img
              src={fileUrl}
              alt={title}
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
              className="transition-transform duration-200 rounded-lg shadow-md max-h-[520px] object-contain"
            />
          </div>
        )}

        {/* 4. DOC / EPUB / TEXT VIEWER */}
        {(fileType === "DOC" || fileType === "EPUB") && (
          <div
            className={`w-full max-w-3xl rounded-xl border border-border bg-background p-4 sm:p-8 shadow-sm leading-relaxed ${
              fontSize === "sm" ? "text-sm" : fontSize === "lg" ? "text-lg leading-loose" : "text-base"
            }`}
          >
            <div className="border-b border-border pb-4 mb-4">
              <h2 className="text-xl font-bold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">{author}</p>
            </div>
            <div className="space-y-4 text-foreground/90 font-serif">
              <p>
                Welcome to the digital reader view for <em>{title}</em>. This document has been
                indexed into the LibrisAI system. Use the controls above to adjust typography sizing,
                open the full manuscript in a dedicated tab, or ask contextual questions via the AI
                Research Drawer.
              </p>
              <div className="p-4 rounded-lg bg-muted/40 border border-border/60 text-sm font-sans not-italic">
                <p className="font-semibold text-foreground">File Source:</p>
                <p className="text-xs text-muted-foreground font-mono break-all mt-1">{fileUrl}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
