# PROJECT_SPEC.md — LibraCore Core & Roadmap Specification

## 1. Core Architecture (100% Operational — Do Not Break)
- **Framework:** Next.js 15 (App Router, TypeScript) deployed via `@opennextjs/cloudflare`[cite: 7].
- **Database & Storage:** Supabase PostgreSQL (`profiles`, `categories`, `books`, `downloads`, `saved_books`) + Storage Buckets (`library-files`, `book-covers`)[cite: 3, 7].
- **AI Engine:** Google AI Studio REST API (`gemini-3.5-flash`) powering `/api/ai` (`book-qa`, `generate_description`) and `/api/chatbot`[cite: 7].

---

## 2. Specifications for Next Roadmap Modules (From `MEMORY.md`)

### Module 1: Global Command Palette (`⌘K` / `Ctrl+K` Dialog)
- **Component:** `src/components/layout/command-palette.tsx` + `src/components/ui/command.tsx`.
- **Triggers:**
  1. Pressing `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux) anywhere in the app.
  2. Clicking the search bar / `⌘K` pill in `src/components/layout/navbar.tsx`[cite: 7].
- **Capabilities:**
  - **Live Book Search:** Instant search across `books` (title, author, format badge) -> clicking navigates to `/books/[id]`[cite: 2, 7].
  - **Category Jump:** Quick filter jump to `/catalog?category=[id]`[cite: 2, 7].
  - **Quick Navigation:** Jump to `/dashboard`, `/catalog`, `/categories`, `/admin` (if admin), or trigger "Ask AI Librarian" drawer (`chat-widget.tsx`)[cite: 7].

### Module 2: Persistent User Collections & Reading Lists
- **Database Migration (`supabase/migrations/20261025000000_add_collections_and_profile_fields.sql`):**
  1. **`collections` Table:**
     - `id`: `uuid` (PK, default `gen_random_uuid()`)
     - `user_id`: `uuid` (FK -> `profiles(id)` on delete cascade, not null)
     - `name`: `text` (Not Null)
     - `description`: `text`
     - `color`: `text` (default `'indigo'`)
     - `created_at`: `timestamptz` (default `now()`)
  2. **`collection_books` Join Table:**
     - `id`: `uuid` (PK, default `gen_random_uuid()`)
     - `collection_id`: `uuid` (FK -> `collections(id)` on delete cascade)
     - `book_id`: `uuid` (FK -> `books(id)` on delete cascade)
     - `added_at`: `timestamptz` (default `now()`)
     - Constraint: `UNIQUE(collection_id, book_id)`
  3. **RLS Policies:** Authenticated users can `SELECT`, `INSERT`, `UPDATE`, and `DELETE` their own `collections` and `collection_books`.
- **Frontend Wiring (`/dashboard` & `/books/[id]`):**
  - Replace local-state collections in `src/app/dashboard/page.tsx` with real Supabase queries to `collections` and `collection_books`[cite: 7].
  - Allow users to create/delete custom collections (e.g., "Thesis Research", "Lattice Cryptography"), assign saved books to collections, and filter their workspace by collection tag.

### Module 3: Enhanced PDF Manuscript Streamer & Page Annotations (`book-preview-reader.tsx`)
- **Features in `src/components/shared/book-preview-reader.tsx`[cite: 7]:**
  - Add a collapsible **Page Thumbnail / Outline & Bookmarks Sidebar** next to the document reader.
  - Allow users to bookmark specific page numbers with a short research note (persisted in `localStorage` or a `book_annotations` table synced to `user_id` + `book_id` + `page_number`).
  - Smooth zoom controls (`50%` to `200%`), page jump input, fullscreen reader mode, and one-click BibTeX / APA citation copy.

### Module 4: User Profile & Institutional Verification Settings (`/dashboard?tab=profile`)
- **Database Columns (Add to `profiles` table via migration):**
  - `avatar_url` (`text`), `bio` (`text`), `institution` (`text`), `department` (`text`).
- **Frontend Wiring (`src/app/dashboard/page.tsx` or `src/components/shared/profile-settings.tsx`):**
  - Complete the `/dashboard?tab=profile` subview allowing scholars to update their Name, Avatar URL, Bio, Affiliated University/Department, and update their password via `supabase.auth.updateUser({ password })`.