"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  Reply,
  CornerDownRight,
  Send,
  Loader2,
  Quote,
  MapPin,
  Filter,
  Check,
  ChevronDown,
  UserCheck,
  PlusCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchMonographComments,
  createMonographComment,
  createCommentReply,
  toggleCommentResolved,
  likeComment,
} from "@/lib/comments";
import type { MonographComment, CommentReply, ReviewTag } from "@/integrations/supabase/types";

interface MonographPeerReviewProps {
  bookId: string;
  bookTitle: string;
  currentPage?: number;
  onJumpToPage?: (page: number) => void;
}

const REVIEW_TAG_CONFIG: Record<ReviewTag, { label: string; badgeClass: string; icon: string }> = {
  "Proof Critique": {
    label: "Proof Critique",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: "⚖️",
  },
  Methodology: {
    label: "Methodology",
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    icon: "🔬",
  },
  Hypothesis: {
    label: "Hypothesis",
    badgeClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    icon: "💡",
  },
  "Citation Request": {
    label: "Citation Request",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    icon: "📜",
  },
  "General Review": {
    label: "General Review",
    badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
    icon: "📝",
  },
};

export function MonographPeerReview({
  bookId,
  bookTitle,
  currentPage = 1,
  onJumpToPage,
}: MonographPeerReviewProps) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<MonographComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTag, setFilterTag] = useState<string>("all");
  const [showResolvedOnly, setShowResolvedOnly] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // New comment form state
  const [newCommentText, setNewCommentText] = useState("");
  const [newSelectedPassage, setNewSelectedPassage] = useState("");
  const [newPageNumber, setNewPageNumber] = useState<number>(currentPage);
  const [newReviewTag, setNewReviewTag] = useState<ReviewTag>("Methodology");
  const [submitting, setSubmitting] = useState(false);

  // Active reply box state (commentId -> boolean)
  const [replyOpenMap, setReplyOpenMap] = useState<Record<string, boolean>>({});
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [replySubmittingMap, setReplySubmittingMap] = useState<Record<string, boolean>>({});

  // Sync current reader page when changed
  useEffect(() => {
    if (currentPage > 0) {
      setNewPageNumber(currentPage);
    }
  }, [currentPage]);

  // Load comments
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMonographComments(bookId);
      setComments(data);
    } catch (err) {
      console.warn("Error loading comments:", err);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Realtime Supabase Subscription for multi-scholar peer reviews
  useEffect(() => {
    const channel = supabase
      .channel(`monograph_comments_${bookId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "monograph_comments",
          filter: `book_id=eq.${bookId}`,
        },
        () => {
          loadComments();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comment_replies",
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookId, loadComments]);

  // Handle submit comment
  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      toast.error("Please enter a research critique or commentary.");
      return;
    }

    try {
      setSubmitting(true);
      const authorName = profile?.full_name || profile?.name || user?.email?.split("@")[0] || "Dr. Scholar";
      const authorTitle = profile?.academic_title || (profile?.institution ? `${profile.institution} Fellow` : "Archival Scholar");
      const authorAvatar = profile?.avatar_url || null;

      const created = await createMonographComment({
        bookId,
        userId: user?.id || null,
        userName: authorName,
        userAvatar: authorAvatar,
        userTitle: authorTitle,
        pageNumber: newPageNumber > 0 ? newPageNumber : null,
        selectedPassage: newSelectedPassage.trim() || null,
        reviewTag: newReviewTag,
        commentText: newCommentText.trim(),
      });

      setComments((prev) => [created, ...prev]);
      setNewCommentText("");
      setNewSelectedPassage("");
      setIsFormOpen(false);
      toast.success("Peer-review annotation published to collaborative thread.");
    } catch {
      toast.error("Could not post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle reply submit
  const handleCreateReply = async (commentId: string) => {
    const text = replyTextMap[commentId]?.trim();
    if (!text) {
      toast.error("Please enter your reply text.");
      return;
    }

    try {
      setReplySubmittingMap((prev) => ({ ...prev, [commentId]: true }));
      const authorName = profile?.full_name || profile?.name || user?.email?.split("@")[0] || "Dr. Scholar";
      const authorTitle = profile?.academic_title || (profile?.institution ? `${profile.institution} Fellow` : "Research Fellow");
      const authorAvatar = profile?.avatar_url || null;

      const reply = await createCommentReply({
        commentId,
        bookId,
        userId: user?.id || null,
        userName: authorName,
        userAvatar: authorAvatar,
        userTitle: authorTitle,
        replyText: text,
      });

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [...(c.replies || []), reply],
            };
          }
          return c;
        })
      );

      setReplyTextMap((prev) => ({ ...prev, [commentId]: "" }));
      setReplyOpenMap((prev) => ({ ...prev, [commentId]: false }));
      toast.success("Scholarly reply published.");
    } catch {
      toast.error("Failed to post reply.");
    } finally {
      setReplySubmittingMap((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // Toggle resolved status
  const handleToggleResolved = async (commentId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    try {
      await toggleCommentResolved(commentId, bookId, nextStatus);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, is_resolved: nextStatus } : c))
      );
      toast.success(nextStatus ? "Critique marked as resolved." : "Discussion reopened.");
    } catch {
      toast.error("Could not update debate status.");
    }
  };

  // Handle like / agree
  const handleLike = async (commentId: string, currentLikes: number) => {
    try {
      const updated = await likeComment(commentId, bookId, currentLikes);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, likes_count: updated } : c))
      );
    } catch {
      // ignore
    }
  };

  // Filtered comments
  const filteredComments = comments.filter((c) => {
    if (filterTag !== "all" && c.review_tag !== filterTag) return false;
    if (showResolvedOnly && !c.is_resolved) return false;
    return true;
  });

  const totalCritiques = comments.length;
  const resolvedCount = comments.filter((c) => c.is_resolved).length;
  const openCount = totalCritiques - resolvedCount;

  return (
    <div className="w-full space-y-6">
      {/* Top Banner / Metrics & Action Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-4 w-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Peer Review & Academic Marginalia
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Participate in collaborative methodological reviews, proof critiques, and passage annotations.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => setIsFormOpen((prev) => !prev)}
              size="sm"
              className="gap-1.5 text-xs font-semibold shadow-xs bg-primary text-primary-foreground dark:bg-primary/20 dark:text-primary dark:border dark:border-primary/30"
            >
              {isFormOpen ? (
                <>
                  <X className="h-3.5 w-3.5" /> Close Form
                </>
              ) : (
                <>
                  <PlusCircle className="h-3.5 w-3.5" /> New Annotation / Critique
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground">{totalCritiques}</span>
            <span>Total Discussions</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold text-foreground">{openCount}</span>
            <span>Open Debates</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-foreground">{resolvedCount}</span>
            <span>Resolved</span>
          </div>
        </div>
      </div>

      {/* New Annotation Form Drawer */}
      {isFormOpen && (
        <form
          onSubmit={handleCreateComment}
          className="rounded-2xl border border-primary/30 bg-card p-5 sm:p-6 shadow-md space-y-4 animate-in fade-in-50 duration-200"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-bold text-foreground">
                Author Scholarly Annotation for &quot;{bookTitle}&quot;
              </h4>
            </div>
            <Badge variant="outline" className="text-[11px] font-mono">
              Anchor: Page {newPageNumber}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Review Tag Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Critique Category / Tag
              </label>
              <select
                value={newReviewTag}
                onChange={(e) => setNewReviewTag(e.target.value as ReviewTag)}
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="Methodology">🔬 Methodology Review</option>
                <option value="Proof Critique">⚖️ Proof & Mathematical Critique</option>
                <option value="Hypothesis">💡 Theoretical Hypothesis</option>
                <option value="Citation Request">📜 Citation / Primary Source Request</option>
                <option value="General Review">📝 General Scholarly Commentary</option>
              </select>
            </div>

            {/* Page Anchor Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Manuscript Page Reference
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={9999}
                  value={newPageNumber}
                  onChange={(e) => setNewPageNumber(parseInt(e.target.value, 10) || 1)}
                  className="h-9 text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewPageNumber(currentPage)}
                  className="h-9 text-[11px] shrink-0"
                >
                  Use Current Reader Page ({currentPage})
                </Button>
              </div>
            </div>
          </div>

          {/* Selected Passage (Quotation) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Quote className="h-3 w-3 text-muted-foreground" />
              Cited Passage / Text Excerpt (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. 'The reduction from Module-LWE to the Shortest Vector Problem...'"
              value={newSelectedPassage}
              onChange={(e) => setNewSelectedPassage(e.target.value)}
              className="h-9 text-xs font-serif"
            />
          </div>

          {/* Comment Body */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Scholarly Argument, Critique, or Question
            </label>
            <Textarea
              rows={4}
              placeholder="Articulate your rigorous analysis, question theoretical assumptions, or note empirical variance..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="text-xs leading-relaxed"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFormOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="gap-1.5 text-xs font-semibold bg-primary text-primary-foreground shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Publish to Peer Thread
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Filter Chips Rail */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <Button
            variant={filterTag === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTag("all")}
            className="h-7 px-2.5 text-[11px] rounded-lg"
          >
            All Discussions ({comments.length})
          </Button>

          {(Object.keys(REVIEW_TAG_CONFIG) as ReviewTag[]).map((tag) => {
            const count = comments.filter((c) => c.review_tag === tag).length;
            if (count === 0) return null;
            return (
              <Button
                key={tag}
                variant={filterTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterTag(tag)}
                className="h-7 px-2.5 text-[11px] rounded-lg gap-1"
              >
                <span>{REVIEW_TAG_CONFIG[tag].icon}</span>
                <span>{REVIEW_TAG_CONFIG[tag].label}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </Button>
            );
          })}
        </div>

        <Button
          variant={showResolvedOnly ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setShowResolvedOnly((p) => !p)}
          className="h-7 px-2.5 text-[11px] rounded-lg gap-1 text-muted-foreground hover:text-foreground"
        >
          <CheckCircle2 className={`h-3.5 w-3.5 ${showResolvedOnly ? "text-emerald-500" : ""}`} />
          <span>Resolved Only</span>
        </Button>
      </div>

      {/* Discussions Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs">Loading collaborative peer reviews and marginalia...</p>
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-10 text-center space-y-3 bg-card/40">
          <MessageSquare className="h-8 w-8 text-muted-foreground/60 mx-auto" />
          <h4 className="text-sm font-bold text-foreground">No Peer Reviews Found</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {filterTag !== "all" || showResolvedOnly
              ? "No discussions match the active filter criteria. Try clearing filters."
              : "Be the first scholar to annotate a passage or start a methodological critique for this monograph."}
          </p>
          <Button
            onClick={() => setIsFormOpen(true)}
            size="sm"
            className="text-xs gap-1.5 mt-2"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Start Discussion
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => {
            const tagCfg = REVIEW_TAG_CONFIG[comment.review_tag] || REVIEW_TAG_CONFIG["General Review"];
            const isReplyOpen = !!replyOpenMap[comment.id];
            const replyText = replyTextMap[comment.id] || "";
            const isReplySubmitting = !!replySubmittingMap[comment.id];

            return (
              <div
                key={comment.id}
                className={`rounded-2xl border transition-all p-5 sm:p-6 space-y-4 bg-card ${
                  comment.is_resolved
                    ? "border-emerald-500/25 bg-emerald-500/[0.02]"
                    : "border-border/80 shadow-2xs hover:border-primary/40"
                }`}
              >
                {/* Header: Scholar Profile + Page Reference + Tag */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={comment.user_name}
                      path={comment.user_avatar}
                      className="h-9 w-9 shrink-0"
                    />

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-foreground">
                          {comment.user_name}
                        </span>
                        {comment.is_resolved && (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9px] font-bold px-1.5 py-0 gap-1">
                            <Check className="h-2.5 w-2.5" /> Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {comment.user_title || "Research Fellow"} •{" "}
                        {new Date(comment.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Chips: Category Tag & Page Anchor */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`text-[10px] font-semibold gap-1 ${tagCfg.badgeClass}`}>
                      <span>{tagCfg.icon}</span>
                      <span>{tagCfg.label}</span>
                    </Badge>

                    {comment.page_number && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => onJumpToPage && onJumpToPage(comment.page_number!)}
                        className="h-6 px-2 text-[10px] font-mono gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="Jump to this page in the reader"
                      >
                        <MapPin className="h-2.5 w-2.5 text-primary" />
                        <span>Page {comment.page_number}</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quoted Text Excerpt (if provided) */}
                {comment.selected_passage && (
                  <div className="border-l-2 border-primary/50 bg-muted/40 rounded-r-xl p-3 text-xs font-serif text-muted-foreground leading-relaxed italic">
                    &quot;{comment.selected_passage}&quot;
                  </div>
                )}

                {/* Main Comment Text */}
                <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {comment.comment_text}
                </p>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(comment.id, comment.likes_count)}
                      className="h-7 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>Agree ({comment.likes_count})</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setReplyOpenMap((prev) => ({
                          ...prev,
                          [comment.id]: !prev[comment.id],
                        }))
                      }
                      className="h-7 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      <span>Reply ({comment.replies?.length || 0})</span>
                    </Button>
                  </div>

                  {/* Toggle Resolved Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleResolved(comment.id, comment.is_resolved)}
                    className={`h-7 px-2 text-xs gap-1 transition-colors ${
                      comment.is_resolved
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{comment.is_resolved ? "Resolved" : "Mark Resolved"}</span>
                  </Button>
                </div>

                {/* Nested Replies Thread */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="space-y-3 pl-4 sm:pl-6 border-l-2 border-border/60 mt-2">
                    {comment.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <UserAvatar
                              name={reply.user_name}
                              path={reply.user_avatar}
                              className="h-6 w-6 shrink-0"
                            />
                            <span className="font-bold text-foreground text-xs">{reply.user_name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {reply.user_title || "Fellow"}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(reply.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-foreground leading-relaxed pl-8 whitespace-pre-wrap">
                          {reply.reply_text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input Form */}
                {isReplyOpen && (
                  <div className="pt-2 pl-4 sm:pl-6 border-l-2 border-primary/40 space-y-2 animate-in fade-in-50 duration-150">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                      <CornerDownRight className="h-3 w-3" />
                      <span>Replying as {profile?.full_name || profile?.name || "Dr. Scholar"}</span>
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="Write your counter-argument, supporting evidence, or theoretical response..."
                      value={replyText}
                      onChange={(e) =>
                        setReplyTextMap((prev) => ({
                          ...prev,
                          [comment.id]: e.target.value,
                        }))
                      }
                      className="text-xs"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setReplyOpenMap((prev) => ({
                            ...prev,
                            [comment.id]: false,
                          }))
                        }
                        className="h-7 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isReplySubmitting}
                        onClick={() => handleCreateReply(comment.id)}
                        className="h-7 gap-1 text-xs bg-primary text-primary-foreground font-semibold"
                      >
                        {isReplySubmitting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                        <span>Post Reply</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
