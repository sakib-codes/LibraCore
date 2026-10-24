-- ==============================================================================
-- LibrisAI - Digital Library Management System (DLMS) Collections Schema
-- Migration: 20261025000000_add_collections_and_profile_fields.sql
-- ==============================================================================

-- 1. COLLECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT 'indigo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS collections_user_id_idx ON public.collections (user_id);
CREATE INDEX IF NOT EXISTS collections_created_at_idx ON public.collections (created_at DESC);

-- Trigger for collections updated_at
CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. COLLECTION_BOOKS TABLE (Junction table linking collections to monographs)
CREATE TABLE IF NOT EXISTS public.collection_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  book_id text NOT NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_id, book_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.collection_books TO authenticated;
GRANT ALL ON public.collection_books TO service_role;
ALTER TABLE public.collection_books ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS collection_books_collection_id_idx ON public.collection_books (collection_id);
CREATE INDEX IF NOT EXISTS collection_books_book_id_idx ON public.collection_books (book_id);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES

-- Collections: Users can view, create, edit, and delete their own collections
CREATE POLICY "Users can view own collections"
  ON public.collections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections"
  ON public.collections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON public.collections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON public.collections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Collection Books: Users can manage books inside their collections
CREATE POLICY "Users can view own collection books"
  ON public.collection_books FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert into own collection books"
  ON public.collection_books FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete from own collection books"
  ON public.collection_books FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );
