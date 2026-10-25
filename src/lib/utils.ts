import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard Shadcn UI utility function combining clsx with tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format bytes into human-readable file size (KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format seconds into mm:ss or hh:mm:ss for audio playback
 */
export function formatDuration(seconds?: number | null): string {
  if (!seconds) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Extract initials from a user's name
 */
export function initials(name?: string | null): string {
  if (!name) return "LA";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const DEFAULT_BOOK_COVER =
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80";

/**
 * Safely extract primary book cover URL, whether stored as single URL or JSON array of images
 */
export function getCoverUrl(
  coverUrl?: string | null,
  fallback: string = DEFAULT_BOOK_COVER
): string {
  if (!coverUrl || !coverUrl.trim()) return fallback;
  const trimmed = coverUrl.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
        return parsed[0] || fallback;
      }
    } catch {
      // not JSON array, return string
    }
  }
  return trimmed || fallback;
}

/**
 * Safely return all images (primary cover + all preview pages) from cover_url field
 */
export function getAllCoverImages(
  coverUrl?: string | null,
  fallback: string = DEFAULT_BOOK_COVER
): string[] {
  if (!coverUrl || !coverUrl.trim()) return [fallback];
  const trimmed = coverUrl.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.filter(
          (item): item is string => typeof item === "string" && item.trim().length > 0
        );
        if (valid.length > 0) return valid;
      }
    } catch {
      // not JSON array
    }
  }
  return [trimmed || fallback];
}

