-- ==============================================================================
-- LibrisAI - Digital Library Management System (DLMS) Schema
-- Migration: 20261024000000_init_digital_library_schema.sql
-- ==============================================================================

-- 1. EXTENSIONS & TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- 2. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. USER PROFILES TABLE
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  full_name text NOT NULL DEFAULT '',
  email text,
  avatar_url text,
  phone text,
  bio text,
  role public.app_role NOT NULL DEFAULT 'user',
  is_suspended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. USER ROLES TABLE
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = _role
  );
$$;

-- RLS for profiles
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- RLS for user_roles
CREATE POLICY "user_roles_select_own_or_admin"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_insert_admin"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_role_val public.app_role;
  display_name text;
BEGIN
  display_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  user_role_val := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'user'::public.app_role);

  -- Insert profile
  INSERT INTO public.profiles (id, name, full_name, email, avatar_url, role)
  VALUES (
    NEW.id,
    display_name,
    display_name,
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    user_role_val
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = COALESCE(NULLIF(EXCLUDED.name, ''), profiles.name),
      full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name);

  -- Default role assignment
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role_val)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. CATEGORIES TABLE
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text DEFAULT 'BookOpen',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_read_public"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "categories_admin_all"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. BOOKS TABLE
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  isbn text,
  description text,
  ai_summary text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  cover_url text,
  file_url text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('pdf', 'epub', 'audio', 'image', 'doc', 'PDF', 'EPUB', 'AUDIO', 'DOC', 'IMAGE')),
  file_size_bytes bigint NOT NULL DEFAULT 0,
  page_count integer,
  duration_seconds integer,
  language text NOT NULL DEFAULT 'English',
  publisher text,
  published_year integer,
  is_featured boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  download_count integer NOT NULL DEFAULT 0,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.books TO anon, authenticated;
GRANT ALL ON public.books TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.books TO authenticated;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "books_select_active"
  ON public.books FOR SELECT
  USING (is_archived = false OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "books_admin_all"
  ON public.books FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. SAVED BOOKS (BOOKMARKS / READING LIST)
CREATE TABLE public.saved_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);

GRANT SELECT, INSERT, DELETE ON public.saved_books TO authenticated;
GRANT ALL ON public.saved_books TO service_role;
ALTER TABLE public.saved_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_books_select_own"
  ON public.saved_books FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "saved_books_insert_own"
  ON public.saved_books FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_books_delete_own"
  ON public.saved_books FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 9. DOWNLOADS (READING & DOWNLOAD HISTORY)
CREATE TABLE public.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  ip_address text,
  time timestamptz NOT NULL DEFAULT now(),
  downloaded_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.downloads TO authenticated;
GRANT ALL ON public.downloads TO service_role;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "downloads_select_own_or_admin"
  ON public.downloads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "downloads_insert_own"
  ON public.downloads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Trigger to increment download_count on books
CREATE OR REPLACE FUNCTION public.handle_book_download()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.books
  SET download_count = download_count + 1
  WHERE id = NEW.book_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_book_downloaded
  AFTER INSERT ON public.downloads
  FOR EACH ROW EXECUTE FUNCTION public.handle_book_download();

-- 10. STORAGE BUCKETS SETUP
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('library-files', 'library-files', false),
  ('book-covers', 'book-covers', true),
  ('library-covers', 'library-covers', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public book-covers access"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('book-covers', 'library-covers'));

CREATE POLICY "Public avatar access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated avatar upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admin files access"
  ON storage.objects FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated library file read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'library-files');

-- 11. INITIAL SEED DATA
INSERT INTO public.categories (name, slug, description, icon, display_order)
VALUES
  ('Computer Science', 'computer-science', 'Algorithms, Systems, Machine Learning & Architecture', 'Cpu', 1),
  ('Network Security', 'network-security', 'Cryptography, Network Architecture, and Defensive Systems', 'Shield', 2),
  ('Research Papers', 'research-papers', 'Peer-reviewed scholarly monographs and pre-prints', 'FileText', 3),
  ('Audio Books', 'audio-books', 'High-fidelity audio editions and spoken lectures', 'Headphones', 4),
  ('eBooks & Literature', 'ebooks-literature', 'Classical prose, philosophy, and modern texts', 'BookOpen', 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.books (
  title, author, isbn, description, ai_summary, category_id,
  cover_url, file_url, file_type, file_size_bytes, page_count,
  duration_seconds, language, publisher, published_year, is_featured
)
SELECT
  'Designing Data-Intensive Applications',
  'Martin Kleppmann',
  '978-1449373320',
  'The definitive guide to principles of reliable, scalable, and maintainable systems.',
  'An in-depth architectural breakdown covering data models, replication, partitioning, transactions, consensus, and batch/stream processing.',
  c.id,
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  'sample-data/ddia.pdf',
  'pdf',
  14500000,
  616,
  NULL,
  'English',
  'O''Reilly Media',
  2017,
  true
FROM public.categories c WHERE c.slug = 'computer-science'
LIMIT 1;

INSERT INTO public.books (
  title, author, isbn, description, ai_summary, category_id,
  cover_url, file_url, file_type, file_size_bytes, page_count,
  duration_seconds, language, publisher, published_year, is_featured
)
SELECT
  'The Art of Computer Programming, Vol 1',
  'Donald E. Knuth',
  '978-0201896831',
  'Fundamental Algorithms: the seminal work in modern computer science.',
  'Foundational exposition of information structures, linear lists, trees, multilinked structures, dynamic storage allocation, and mathematical analysis of algorithms.',
  c.id,
  'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&auto=format&fit=crop&q=80',
  'sample-data/taocp-v1.epub',
  'epub',
  8200000,
  672,
  NULL,
  'English',
  'Addison-Wesley',
  1997,
  true
FROM public.categories c WHERE c.slug = 'computer-science'
LIMIT 1;

INSERT INTO public.books (
  title, author, isbn, description, ai_summary, category_id,
  cover_url, file_url, file_type, file_size_bytes, page_count,
  duration_seconds, language, publisher, published_year, is_featured
)
SELECT
  'Meditations: Audio Edition & Commentary',
  'Marcus Aurelius',
  '978-0140449334',
  'Private personal reflections and stoic philosophical journal of the Roman Emperor.',
  'Twelve books exploring resilience, inner virtue, mindfulness of mortality, duty, and emotional equanimity in leadership and adversity.',
  c.id,
  'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80',
  'sample-data/meditations.mp3',
  'audio',
  48500000,
  NULL,
  18450,
  'English',
  'LibrisAI Classical Editions',
  2024,
  true
FROM public.categories c WHERE c.slug = 'audio-books'
LIMIT 1;
