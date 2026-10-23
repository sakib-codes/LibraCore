import { cn } from "@/lib/utils";
import { FILE_TYPES, type SupportedFileType } from "@/lib/constants";
import { FileText, BookOpen, Headphones, FileCode, Image as ImageIcon } from "lucide-react";

const ICON_MAP = {
  FileText,
  BookOpen,
  Headphones,
  FileCode,
  Image: ImageIcon,
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  archived: "bg-muted text-muted-foreground border-border",
  admin: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  user: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  featured: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        STATUS_STYLES[status.toLowerCase()] ?? "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      {status}
    </span>
  );
}

export function FileTypeBadge({
  type,
  className,
  showIcon = true,
}: {
  type: string;
  className?: string;
  showIcon?: boolean;
}) {
  const upper = (type || "PDF").toUpperCase() as SupportedFileType;
  const meta = FILE_TYPES[upper] || FILE_TYPES.PDF;
  const IconComponent = ICON_MAP[meta.iconName as keyof typeof ICON_MAP] || FileText;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        meta.badgeClass,
        className
      )}
    >
      {showIcon && <IconComponent className="h-3 w-3" />}
      {meta.type}
    </span>
  );
}
