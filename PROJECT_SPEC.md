# PROJECT_SPEC.md — LibraCore Functional & Backend Specification

## 1. Executive Summary & Objectives
LibraCore is a production Digital Library Management System (DLMS) providing 24/7 online access to books, research papers, academic materials, audio, and media files.
- **Core Goals:**
  1. Provide a fast, user-friendly platform for accessing digital books and documents.
  2. Allow students and researchers to register, log in, search, preview in-browser, bookmark, and download resources easily.
  3. Provide administrators with a complete dashboard to upload, edit, categorize, and delete resources, manage users, and track downloads.
  4. Integrate Google Gemini AI for catalog discovery, book-specific Q&A, and automated book description generation.

---

## 2. Database Schema & Supabase Scope (`public` schema)
Defined in `supabase/migrations/20261024000000_init_digital_library_schema.sql` and typed in `src/integrations/supabase/types.ts`:

1. **`profiles` (Users Table)**
   - `id`: `uuid` (PK, references `auth.users(id)` on delete cascade)
   - `name`: `text`
   - `email`: `text` (Unique)
   - `role`: `text` (`'user'` | `'admin'`, default `'user'`)
   - `is_suspended`: `boolean` (default `false`)
   - `created_at`: `timestamptz`

2. **`categories`**
   - `id`: `uuid` (PK, default `gen_random_uuid()`)
   - `name`: `text` (Unique, Not Null)
   - `created_at`: `timestamptz`

3. **`books`**
   - `id`: `uuid` (PK, default `gen_random_uuid()`)
   - `title`: `text` (Not Null)
   - `author`: `text` (Not Null)
   - `description`: `text`
   - `file_url`: `text` (Not Null — Supabase Storage URL)
   - `cover_url`: `text` (Supabase Storage URL)
   - `file_type`: `text` (`'pdf'` | `'epub'` | `'audio'` | `'image'` | `'doc'`, default `'pdf'`)
   - `category_id`: `uuid` (FK -> `categories(id)` on delete set null)
   - `created_at`: `timestamptz`

4. **`downloads`**
   - `id`: `uuid` (PK, default `gen_random_uuid()`)
   - `user_id`: `uuid` (FK -> `profiles(id)` on delete cascade)
   - `book_id`: `uuid` (FK -> `books(id)` on delete cascade)
   - `time`: `timestamptz` (default `now()`)

5. **`saved_books` (User Bookmarks)**
   - `id`: `uuid` (PK, default `gen_random_uuid()`)
   - `user_id`: `uuid` (FK -> `profiles(id)` on delete cascade)
   - `book_id`: `uuid` (FK -> `books(id)` on delete cascade)
   - `created_at`: `timestamptz` (default `now()`)
   - Constraint: `UNIQUE(user_id, book_id)`

### Supabase Storage Buckets
- **`library-files`:** Stores uploaded PDFs, eBooks, audio files, images, and text documents.
- **`book-covers`:** Stores uploaded cover image thumbnails.

---

## 3. Feature Requirements by Route

### A. Authentication (`/login`, `/register`, `/reset-password`)
- **Login (`/login`):** Email + Password login via `supabase.auth.signInWithPassword` and Google OAuth (`signInWithOAuth`). Redirects suspended users (`is_suspended === true`) with an error toast.
- **Register (`/register`):** Full Name, Email, Password registration via `supabase.auth.signUp` passing `{ data: { name } }` so the DB trigger populates `profiles`.
- **Reset Password (`/reset-password`):** Sends password reset link via `supabase.auth.resetPasswordForEmail` and handles password update when returning with a recovery session.

### B. Public Catalog & Discovery (`/`, `/catalog`, `/categories`)
- Fetch books joined with categories: `supabase.from('books').select('*, categories(id, name)')`.
- **Instant Search:** Filter books in real-time by `title` or `author` (case-insensitive).
- **Category Filter Pills:** Filter the book grid by `category_id` or `file_type`.
- **Book Card (`src/components/shared/book-card.tsx`):** Shows cover thumbnail, `file_type` badge, category badge, title, author, short description, bookmark toggle button, "Preview" link (`/books/[id]`), and direct "Download" button.

### C. Book Detail, Reader & Contextual AI (`/books/[id]`)
- Displays full book metadata and description so students can read the description before downloading.
- **In-Browser Previewer (`src/components/shared/book-preview-reader.tsx`):**
  - Renders `<iframe>` or `<embed>` for `'pdf'`, `<audio controls>` for `'audio'`, `<img>` for `'image'`, and a clean document viewer/download fallback for `'epub'` and `'doc'`.
- **Download Tracking:** Clicking "Download" records an entry in `public.downloads` (`user_id`, `book_id`) if authenticated, and triggers the browser download of `file_url`.
- **Bookmark Toggle:** Inserts or deletes from `public.saved_books` and updates UI state immediately with a `sonner` toast.
- **Ask AI About This Book (`src/components/shared/book-ai-panel.tsx`):** Side panel chat that sends `{ action: 'book_qa', bookTitle, bookAuthor, bookDescription, message, history }` to `/api/ai`.

### D. Student Dashboard (`/dashboard`)
- Protected route (requires logged-in user).
- **KPI Cards:** Total Saved Books count, Total Downloads count, Categories Explored count.
- **Saved Resources Grid:** Lists all books from `saved_books` joined with `books(*, categories(*))`, allowing one-click read/download or bookmark removal.
- **Recent Downloads Table:** Lists the user's download history from `downloads` joined with `books(title, author, file_type, file_url, categories(name))` ordered by `time DESC`.

### E. Admin Dashboard (`/admin`)
- Protected route (requires `profile.role === 'admin'`).
- **Top KPI Row:** Total Registered Users (`profiles` count), Total Books (`books` count), Total Categories (`categories` count), Total Downloads (`downloads` count).
- **Tab 1 — Manage Books (CRUD):**
  - Searchable table of all books with Edit and Delete actions (`confirm-modal.tsx`).
  - "Upload / Edit Book" Dialog Modal: Uploads file to `library-files` bucket and cover to `book-covers` bucket, then inserts/updates `public.books`.
  - Includes **"✨ Auto-Generate Description with AI"** button that calls `/api/ai` with `{ action: 'generate_description', title, author, category }` and populates the description textarea.
- **Tab 2 — Manage Categories (CRUD):**
  - Add new category, edit category name, delete category.
- **Tab 3 — Manage Users:**
  - Table of all `profiles` showing Name, Email, Role (`user`/`admin`), Status (`Active`/`Suspended`), and actions to toggle role or suspend/unsuspend accounts.

### F. Gemini AI Endpoints (`/api/ai` & `/api/chatbot`)
- Environment Variable: `GEMINI_API_KEY` (using model `gemini-2.5-flash`).
- **`/api/chatbot/route.ts`:** Global AI Librarian widget (`src/components/layout/chat-widget.tsx`). Fetches current catalog titles/authors/IDs from Supabase and injects them into the system prompt so Gemini recommends real library books with clickable links (`/books/[id]`).
- **`/api/ai/route.ts`:** Handles `book_qa` (answering questions about a specific book) and `generate_description` (generating a 3-sentence academic summary for admins).