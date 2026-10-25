import { supabase } from "@/integrations/supabase/client";
import type { MonographComment, CommentReply, ReviewTag } from "@/integrations/supabase/types";

// Seed sample peer-review threads to provide immediate academic depth
const SEED_COMMENTS: Record<string, MonographComment[]> = {
  "b-crypto": [
    {
      id: "comment-crypto-1",
      book_id: "b-crypto",
      user_id: "demo-scholar-1",
      user_name: "Prof. Kenneth Sterling",
      user_avatar: null,
      user_title: "Chair of Applied Cryptography, Cambridge",
      page_number: 14,
      selected_passage: "The reduction from Module-LWE to the Shortest Vector Problem (SVP) guarantees polynomial quantum hardness under standard asymptotic assumptions.",
      review_tag: "Proof Critique",
      comment_text: "Does Theorem 3.2 account for sub-exponential quantum sieve speedups when the module rank k = 2? Recent 2025 breakthroughs suggest the dual attack complexity is lowered by ~8 bits of security in hardware implementations.",
      is_resolved: false,
      likes_count: 5,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      replies: [
        {
          id: "reply-crypto-1",
          comment_id: "comment-crypto-1",
          user_id: "demo-scholar-2",
          user_name: "Dr. Eliza V. Adams (Author)",
          user_avatar: null,
          user_title: "Principal Cryptographer & Monograph Author",
          reply_text: "Excellent observation, Kenneth. We address this in Section 4.5 by fixing a conservative error distribution σ ≥ 3.2, which prevents the dual lattice reduction from exploiting the low-rank structure.",
          created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
      ],
    },
    {
      id: "comment-crypto-2",
      book_id: "b-crypto",
      user_id: "demo-scholar-3",
      user_name: "Dr. Marcus Wei",
      user_avatar: null,
      user_title: "Hardware Security Fellow, ETH Zürich",
      page_number: 28,
      selected_passage: "Constant-time polynomial multiplication via Number Theoretic Transform (NTT) eliminates microarchitectural timing leakage.",
      review_tag: "Methodology",
      comment_text: "Confirmed on ARM Cortex-M4 testbed: side-channel power traces exhibit negligible variance across 100,000 sampled signature generations. Verification tests are published in our lab archive.",
      is_resolved: true,
      likes_count: 8,
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      replies: [],
    },
  ],
  "b-deep-gen": [
    {
      id: "comment-gen-1",
      book_id: "b-deep-gen",
      user_id: "demo-scholar-4",
      user_name: "Elena Rostova",
      user_avatar: null,
      user_title: "AI Research Scientist, Stanford",
      page_number: 3,
      selected_passage: "Score-based diffusion models converge to the true data distribution as the noise schedule step size approaches zero.",
      review_tag: "Hypothesis",
      comment_text: "Has this Lipschitz continuity bound been empirically verified on non-compact manifolds such as hyperbolic embedding spaces?",
      is_resolved: false,
      likes_count: 3,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      replies: [],
    },
  ],
};

const STORAGE_PREFIX = "libris_comments_";

/**
 * Fetch monograph peer-review comments and nested replies
 */
export async function fetchMonographComments(bookId: string): Promise<MonographComment[]> {
  try {
    const { data: comments, error } = await (supabase
      .from("monograph_comments") as any)
      .select("*, replies:comment_replies(*)")
      .eq("book_id", bookId)
      .order("created_at", { ascending: false });

    if (!error && comments && comments.length > 0) {
      return comments.map((c: any) => ({
        ...c,
        replies: (c.replies || []).sort(
          (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      }));
    }
  } catch (err) {
    console.warn("Could not query monograph comments from Supabase, checking local cache:", err);
  }

  // Fallback to localStorage or seed data
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(`${STORAGE_PREFIX}${bookId}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
  }

  // Return seed comments for this book, or empty array
  const seeds = SEED_COMMENTS[bookId] || [];
  if (typeof window !== "undefined" && seeds.length > 0) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${bookId}`, JSON.stringify(seeds));
    } catch {
      // ignore
    }
  }
  return seeds;
}

/**
 * Submit a new monograph comment or annotation
 */
export async function createMonographComment(input: {
  bookId: string;
  userId?: string | null;
  userName: string;
  userAvatar?: string | null;
  userTitle?: string | null;
  pageNumber?: number | null;
  selectedPassage?: string | null;
  reviewTag: ReviewTag;
  commentText: string;
}): Promise<MonographComment> {
  const newComment: MonographComment = {
    id: `comment-${Date.now()}`,
    book_id: input.bookId,
    user_id: input.userId || null,
    user_name: input.userName,
    user_avatar: input.userAvatar || null,
    user_title: input.userTitle || "Research Scholar",
    page_number: input.pageNumber || null,
    selected_passage: input.selectedPassage || null,
    review_tag: input.reviewTag,
    comment_text: input.commentText,
    is_resolved: false,
    likes_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    replies: [],
  };

  try {
    const { data, error } = await (supabase
      .from("monograph_comments") as any)
      .insert({
        book_id: input.bookId,
        user_id: input.userId || null,
        user_name: input.userName,
        user_avatar: input.userAvatar || null,
        user_title: input.userTitle || "Research Scholar",
        page_number: input.pageNumber || null,
        selected_passage: input.selectedPassage || null,
        review_tag: input.reviewTag,
        comment_text: input.commentText,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      newComment.id = data.id;
    }
  } catch (err) {
    console.warn("Could not insert comment to Supabase, persisting locally:", err);
  }

  // Sync to local storage
  if (typeof window !== "undefined") {
    try {
      const existing = await fetchMonographComments(input.bookId);
      const updated = [newComment, ...existing];
      localStorage.setItem(`${STORAGE_PREFIX}${input.bookId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return newComment;
}

/**
 * Submit a reply to a monograph comment
 */
export async function createCommentReply(input: {
  commentId: string;
  bookId: string;
  userId?: string | null;
  userName: string;
  userAvatar?: string | null;
  userTitle?: string | null;
  replyText: string;
}): Promise<CommentReply> {
  const newReply: CommentReply = {
    id: `reply-${Date.now()}`,
    comment_id: input.commentId,
    user_id: input.userId || null,
    user_name: input.userName,
    user_avatar: input.userAvatar || null,
    user_title: input.userTitle || "Research Scholar",
    reply_text: input.replyText,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await (supabase
      .from("comment_replies") as any)
      .insert({
        comment_id: input.commentId,
        user_id: input.userId || null,
        user_name: input.userName,
        user_avatar: input.userAvatar || null,
        user_title: input.userTitle || "Research Scholar",
        reply_text: input.replyText,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      newReply.id = data.id;
    }
  } catch (err) {
    console.warn("Could not insert comment reply to Supabase, persisting locally:", err);
  }

  // Sync to local storage
  if (typeof window !== "undefined") {
    try {
      const existing = await fetchMonographComments(input.bookId);
      const updated = existing.map((c) => {
        if (c.id === input.commentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply],
          };
        }
        return c;
      });
      localStorage.setItem(`${STORAGE_PREFIX}${input.bookId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return newReply;
}

/**
 * Toggle resolved status on a methodological critique
 */
export async function toggleCommentResolved(
  commentId: string,
  bookId: string,
  isResolved: boolean
): Promise<boolean> {
  try {
    await (supabase
      .from("monograph_comments") as any)
      .update({ is_resolved: isResolved })
      .eq("id", commentId);
  } catch (err) {
    console.warn("Could not update comment resolved status in Supabase:", err);
  }

  // Update local storage
  if (typeof window !== "undefined") {
    try {
      const existing = await fetchMonographComments(bookId);
      const updated = existing.map((c) => (c.id === commentId ? { ...c, is_resolved: isResolved } : c));
      localStorage.setItem(`${STORAGE_PREFIX}${bookId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return isResolved;
}

/**
 * Increment like count on an insightful comment
 */
export async function likeComment(
  commentId: string,
  bookId: string,
  currentCount: number
): Promise<number> {
  const newCount = currentCount + 1;
  try {
    await (supabase
      .from("monograph_comments") as any)
      .update({ likes_count: newCount })
      .eq("id", commentId);
  } catch (err) {
    console.warn("Could not like comment in Supabase:", err);
  }

  // Update local storage
  if (typeof window !== "undefined") {
    try {
      const existing = await fetchMonographComments(bookId);
      const updated = existing.map((c) => (c.id === commentId ? { ...c, likes_count: newCount } : c));
      localStorage.setItem(`${STORAGE_PREFIX}${bookId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return newCount;
}
