export type SupportedFileType = "PDF" | "EPUB" | "AUDIO" | "DOC" | "IMAGE";

export interface FileTypeMeta {
  type: SupportedFileType;
  label: string;
  badgeClass: string;
  iconName: string;
  extensions: string[];
  mimeTypes: string[];
}

export const FILE_TYPES: Record<SupportedFileType, FileTypeMeta> = {
  PDF: {
    type: "PDF",
    label: "PDF Document",
    badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    iconName: "FileText",
    extensions: [".pdf"],
    mimeTypes: ["application/pdf"],
  },
  EPUB: {
    type: "EPUB",
    label: "ePub eBook",
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    iconName: "BookOpen",
    extensions: [".epub"],
    mimeTypes: ["application/epub+zip"],
  },
  AUDIO: {
    type: "AUDIO",
    label: "Audiobook",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    iconName: "Headphones",
    extensions: [".mp3", ".m4a", ".wav", ".aac"],
    mimeTypes: ["audio/mpeg", "audio/mp4", "audio/wav"],
  },
  DOC: {
    type: "DOC",
    label: "Document / Notes",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    iconName: "FileCode",
    extensions: [".doc", ".docx", ".txt", ".md"],
    mimeTypes: ["application/msword", "text/plain", "text/markdown"],
  },
  IMAGE: {
    type: "IMAGE",
    label: "Manuscript / Image",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    iconName: "Image",
    extensions: [".jpg", ".jpeg", ".png", ".webp"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
};

export interface NavLinkItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
}

export const PUBLIC_NAV_LINKS: NavLinkItem[] = [
  { label: "Overview", href: "/landing" },
  { label: "Catalog", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "Citation Graph", href: "/catalog/graph" },
];

export const USER_NAV_LINKS: NavLinkItem[] = [
  { label: "Library Catalog", href: "/" },
  { label: "Citation Graph", href: "/catalog/graph" },
  { label: "Research Workspace", href: "/dashboard" },
];

export const ADMIN_NAV_LINKS: NavLinkItem[] = [
  { label: "Library Catalog", href: "/" },
  { label: "Citation Graph", href: "/catalog/graph" },
  { label: "Research Workspace", href: "/dashboard" },
  { label: "Admin Console", href: "/admin" },
];

export const APP_CONFIG = {
  name: "LibrisAI",
  fullName: "LibrisAI Digital Library",
  tagline: "Intelligent Digital Knowledge Repository & AI Librarian",
  description: "Browse, preview, and query books, journals, audiobooks, and documents with Libris AI.",
  storageBuckets: {
    covers: "library-covers",
    files: "library-files",
    avatars: "avatars",
  },
  defaultPageSize: 12,
};
