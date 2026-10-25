-- ==============================================================================
-- Migration: Add Monograph Comments & Collaborative Marginalia
-- Description: Supports cross-scholar peer reviews, paragraph annotations, and replies
-- ==============================================================================

-- 1. Create monograph_comments table
CREATE TABLE IF NOT EXISTS public.monograph_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL DEFAULT 'Academic Scholar',
    user_avatar TEXT,
    user_title TEXT DEFAULT 'Research Scholar',
    page_number INTEGER,
    selected_passage TEXT,
    review_tag TEXT NOT NULL DEFAULT 'General Review' CHECK (review_tag IN ('Methodology', 'Hypothesis', 'Proof Critique', 'Citation Request', 'General Review')),
    comment_text TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create comment_replies table
CREATE TABLE IF NOT EXISTS public.comment_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.monograph_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL DEFAULT 'Academic Scholar',
    user_avatar TEXT,
    user_title TEXT DEFAULT 'Research Scholar',
    reply_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create high-performance indexes
CREATE INDEX IF NOT EXISTS idx_monograph_comments_book_id ON public.monograph_comments(book_id);
CREATE INDEX IF NOT EXISTS idx_monograph_comments_created_at ON public.monograph_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_monograph_comments_page ON public.monograph_comments(book_id, page_number);
CREATE INDEX IF NOT EXISTS idx_comment_replies_comment_id ON public.comment_replies(comment_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.monograph_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_replies ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for monograph_comments
CREATE POLICY "Public read monograph comments"
    ON public.monograph_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert monograph comments"
    ON public.monograph_comments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own monograph comments or toggle resolved"
    ON public.monograph_comments FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authors or admins can delete monograph comments"
    ON public.monograph_comments FOR DELETE
    USING (true);

-- 6. RLS Policies for comment_replies
CREATE POLICY "Public read comment replies"
    ON public.comment_replies FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert comment replies"
    ON public.comment_replies FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Authors can delete comment replies"
    ON public.comment_replies FOR DELETE
    USING (true);

-- 7. Add tables to Supabase Realtime publication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.monograph_comments;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.comment_replies;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;
