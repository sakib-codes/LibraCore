"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Sparkles,
  MessageSquare,
  Network,
  HardDrive,
  BookOpen,
  CheckCheck,
  Trash2,
  ExternalLink,
  X,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "academic" | "system" | "ai";
  href: string;
  read: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Collaborative Marginalia Reply",
    description: "Prof. Marcus Sterling replied to your critique on Shor's Algorithm.",
    timestamp: "12m ago",
    type: "academic",
    href: "/books/b-crypto",
    read: false,
  },
  {
    id: "notif-2",
    title: "Libris AI Indexing Complete",
    description: "Full-text token reduction reached 94.2% on Designing Data-Intensive Applications.",
    timestamp: "45m ago",
    type: "ai",
    href: "/books/b1",
    read: false,
  },
  {
    id: "notif-3",
    title: "Citation Graph Expansion",
    description: "3 new cross-citations linked in Topological Quantum Networks.",
    timestamp: "2h ago",
    type: "academic",
    href: "/catalog/graph",
    read: false,
  },
  {
    id: "notif-4",
    title: "Storage Quota Telemetry",
    description: "Institutional repository storage allocation reached 78% (7.8 GB / 10 GB).",
    timestamp: "1d ago",
    type: "system",
    href: "/admin?tab=settings",
    read: true,
  },
  {
    id: "notif-5",
    title: "Monograph Asset Synchronized",
    description: "Meditations: Audio Edition & Commentary is now cached in high-fidelity audio stream.",
    timestamp: "2d ago",
    type: "system",
    href: "/books/b3",
    read: true,
  },
];

const STORAGE_KEY = "librisai_notifications_state";

export function NotificationsPopover() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "academic" | "system" | "ai">("all");
  const [open, setOpen] = useState(false);

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications(parsed);
        }
      }
    } catch {
      // Ignore parsing errors
    }
  }, []);

  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    return n.type === filter;
  });

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  };

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    setOpen(false);
    router.push(item.href);
  };

  const getTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "ai":
        return <Sparkles className="h-3.5 w-3.5 text-primary" />;
      case "academic":
        return <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />;
      case "system":
        return <HardDrive className="h-3.5 w-3.5 text-amber-400" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer active:scale-95"
          title="Institutional Notifications & Dispatches"
          aria-label="Institutional Notifications"
        >
          <div className="relative flex items-center justify-center">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[8.5px] font-bold text-primary-foreground ring-2 ring-background pointer-events-none select-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden text-popover-foreground z-50"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/70 p-3.5 bg-secondary/40">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-foreground tracking-tight">
              Institutional Dispatches
            </h3>
            {unreadCount > 0 ? (
              <Badge variant="secondary" className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/20 px-1.5 py-0 h-4">
                {unreadCount} new
              </Badge>
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono">
                All caught up
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-muted"
                title="Mark all as read"
              >
                <CheckCheck className="h-3 w-3" />
                <span>Mark read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[10px] text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10"
                title="Clear all dispatches"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border/50 bg-card/40">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors",
              filter === "all"
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("academic")}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors",
              filter === "academic"
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            Academic
          </button>
          <button
            type="button"
            onClick={() => setFilter("ai")}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors",
              filter === "ai"
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            AI Engine
          </button>
          <button
            type="button"
            onClick={() => setFilter("system")}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors",
              filter === "system"
                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            System
          </button>
        </div>

        {/* Scrollable Notification Items List */}
        <div className="max-h-[340px] overflow-y-auto divide-y divide-border/40 scrollbar-thin">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
                <Check className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-xs font-medium text-foreground">
                No notifications to display
              </p>
              <p className="text-[11px] text-muted-foreground max-w-[200px]">
                You have reviewed all active academic dispatches and system telemetry logs.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={cn(
                  "group relative flex items-start gap-3 p-3 transition-colors cursor-pointer select-none",
                  item.read
                    ? "hover:bg-muted/40"
                    : "bg-primary/[0.04] hover:bg-primary/[0.08]"
                )}
              >
                {/* Type Icon Badge */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors mt-0.5",
                    item.read
                      ? "bg-secondary text-muted-foreground border-border/70"
                      : "bg-primary/10 text-primary border-primary/25 shadow-2xs"
                  )}
                >
                  {getTypeIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5">
                    <h4
                      className={cn(
                        "text-xs font-semibold truncate tracking-tight",
                        item.read ? "text-foreground/90 font-medium" : "text-foreground font-semibold"
                      )}
                    >
                      {item.title}
                    </h4>
                    {!item.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                    {item.description}
                  </p>
                  <span className="inline-block text-[10px] text-muted-foreground/80 mt-1 font-mono">
                    {item.timestamp}
                  </span>
                </div>

                {/* Dismiss Button on Hover */}
                <button
                  type="button"
                  onClick={(e) => dismissNotification(item.id, e)}
                  className="absolute right-2.5 top-3 p-1 rounded-md text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted transition-all"
                  title="Dismiss notification"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Quick Links */}
        <div className="p-2.5 border-t border-border/70 bg-secondary/30 flex items-center justify-between text-[11px]">
          <Link
            href="/dashboard?tab=overview"
            onClick={() => setOpen(false)}
            className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
          >
            <span>Research Workspace</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
          <span className="text-[10px] text-muted-foreground font-mono">
            MIT / LibrisAI Network
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
