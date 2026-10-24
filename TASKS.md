# TASKS.md — Autonomous LibraCore Engineering Checklist

> **Instruction for Agent:** Update this file by marking `[ ]` as `[x]` as you complete and verify each milestone. Do not stop until every single item below is `[x]`.

---

## 🏛️ Phase 1: Core Architecture & Full-Stack Infrastructure (Completed)

### Milestone 1: Environment, Types & Supabase Clients
- [x] Verify `src/integrations/supabase/types.ts` matches all 5 tables (`profiles`, `categories`, `books`, `downloads`, `saved_books`) and helper types.
- [x] Verify `src/integrations/supabase/client.ts`, `server.ts`, and `middleware.ts` handle cookie sessions and edge runtime cleanly.
- [x] Verify `src/hooks/use-auth.tsx` fetches the current user session + `profiles` row (`role`, `is_suspended`) and updates reactively on login/logout.

### Milestone 2: Authentication Screens & Route Guards
- [x] Wire `src/app/(auth)/login/page.tsx` with email/password login, Google OAuth, suspended-user check, and `sonner` toast feedback.
- [x] Wire `src/app/(auth)/register/page.tsx` with account creation, metadata passing (`name`), and redirect to `/dashboard`.
- [x] Wire `src/app/(auth)/reset-password/page.tsx` with password reset email trigger and password update form.
- [x] Verify `src/middleware.ts` protects `/dashboard` (authenticated) and `/admin` (`role === 'admin'`).

### Milestone 3: Public Catalog, Categories & Instant Search
- [x] Wire `src/app/page.tsx` and `src/app/catalog/page.tsx` to fetch live books & categories from Supabase.
- [x] Implement debounced search by title/author and category/file-type pill filtering.
- [x] Wire `src/app/categories/page.tsx` to display all categories with book counts and click-to-filter navigation.
- [x] Wire `src/components/shared/book-card.tsx` bookmark toggle (`saved_books`) and direct download counter (`downloads`).

### Milestone 4: Book Detail, In-Browser Reader & Book AI Panel
- [x] Wire `src/app/books/[id]/page.tsx` to fetch book metadata, category name, download count, and user bookmark state.
- [x] Verify `src/components/shared/book-preview-reader.tsx` renders PDFs (`iframe`), Audio (`audio`), Images (`img`), and document fallbacks cleanly.
- [x] Wire `src/components/shared/book-ai-panel.tsx` to `/api/ai` for contextual book Q&A with quick prompt chips.

### Milestone 5: Student Dashboard (`/dashboard`)
- [x] Wire KPI cards (Saved Books count, Total Downloads count, Categories Explored count).
- [x] Render the user's Saved Books grid with remove-bookmark and read/download actions.
- [x] Render the user's Recent Downloads table with timestamps and re-download links.

### Milestone 6: Admin Dashboard, Storage Upload & AI Description (`/admin`)
- [x] Wire Admin KPI stat cards (Total Users, Total Books, Total Downloads, Total Categories).
- [x] Implement Book Upload & Edit modal with Supabase Storage upload (`library-files` and `book-covers` buckets).
- [x] Wire the "✨ Auto-Generate Description with Gemini AI" button in the Book Modal to `/api/ai`.
- [x] Wire Book Delete confirmation (`confirm-modal.tsx`) to remove the database row and storage files.
- [x] Implement Category CRUD (Create, Edit, Delete categories) in the Categories tab.
- [x] Implement User Management table (Toggle `admin`/`user` role and `Active`/`Suspended` status) in the Users tab.

### Milestone 7: Gemini AI Backend Routes & Global Chat Widget
- [x] Verify `src/lib/gemini.server.ts` and `src/lib/chatbot.server.ts` use `GEMINI_API_KEY` with low-latency `gemini-3.5-flash` model.
- [x] Wire `src/app/api/ai/route.ts` and `src/app/api/chatbot/route.ts`.
- [x] Wire `src/components/layout/chat-widget.tsx` floating drawer with message history, markdown formatting, and clickable book recommendation links.

### Milestone 8: Desktop Wide-Screen Utilization & Visual Design Match
- [x] Expand layout container in `app-shell.tsx` & `navbar.tsx` from `max-w-7xl` to `max-w-[1720px] 2xl:max-w-[1840px]` to eliminate desktop side margins.
- [x] Implement split-screen authentication screen with dark academic hero panel (`1.2M+ Active Downloads / Mo`, `99.9% Index Uptime`).
- [x] Implement 2-column desktop monograph reader (`/books/[id]`) with in-canvas white-paper reader and docked `Ask Gemini AI` side panel.
- [x] Implement Research Workspace (`/dashboard`) with navigation breadcrumbs, 3 KPI cards, sidebar collections rail, and recent downloads table with CSV export.
- [x] Implement Library Administration & Inventory (`/admin`) with 4 KPI summary cards, tabs, and inventory management table.
- [x] Implement 2-column discovery catalog (`/`) with repository search rail, active collections, featured monographs, and indigo AI Librarian banner.

---

## 🚀 Phase 2: Next UI Features & Deep Interactions (Active Backlog)

### Milestone 9: Interactive Global Command Palette (`⌘K` Modal Dialog) — [✅ 100% Complete & Verified]
- [x] Build `src/components/shared/command-menu.tsx` using Radix Dialog / `cmdk` primitive with global `Cmd+K` and `Ctrl+K` keyboard shortcut listener.
- [x] Connect the search bar in `navbar.tsx` to trigger this modal on click or keystroke.
- [x] Add searchable navigation groups:
  - **Quick Navigation:** Jump directly to `/dashboard`, `/catalog`, `/categories`, `/admin`, or `/dashboard?tab=saved`.
  - **Monograph Search:** Live search across all books in catalog with instant jump to `/books/[id]`.
  - **Academic Disciplines:** Instant jump to discipline filters (e.g. Cryptography, Neural Systems, Quantum Computing).
  - **Quick Actions:** "Toggle Dark/Light Mode", "Ask AI Librarian", "Export Downloads CSV", "Sign Out".

### Milestone 10: In-Reader Annotation & Research Notes Engine (`/books/[id]`) — [✅ 100% Complete & Verified]
- [x] Add a collapsible **Research Notes & Page Bookmarks** drawer to `src/components/shared/book-preview-reader.tsx`.
- [x] Allow scholars to bookmark specific page numbers (e.g., "Page 14: Lattice-Based Hardness Proof") and save timestamped research notes.
- [x] Provide a "Jump to Page" click action on any note to immediately navigate the reader to that exact manuscript section.
- [x] Persist notes in `localStorage` per monograph ID with one-click "Export Notes to Markdown/BibTeX".

### Milestone 11: Custom Research Collections Engine (`/dashboard` & `/books/[id]`) — [✅ 100% Complete & Verified]
- [x] Create Supabase migration `20261025000000_add_collections_and_profile_fields.sql` and TypeScript database types for `collections` and `collection_books`.
- [x] Implement the interactive "+ New Collection" modal with title, description, and custom color badge selection (Indigo, Emerald, Amber, Rose, Cyan, Purple, Blue).
- [x] Build a "Manage Collections" view inside `/dashboard` allowing scholars to view collection folders, delete them, and see book counts with `ManageCollectionsDialog`.
- [x] Add an "Add to Collection" dialog action on each book card across `/dashboard` and in the action bar of `/books/[id]`.
- [x] Allow clicking any collection pill in the Thematic Collections rail to filter the saved resources grid dynamically by that specific collection.

### Milestone 12: Advanced Catalog Multi-Filter Popover & Year Slider — [✅ 100% Complete & Verified]
- [x] Upgrade the "Filter Catalog" button on `/dashboard` and `/?filter=open` to open an advanced filter popover/modal (`CatalogFilterModal`).
- [x] Support multi-criteria filtering:
  - Publication Year Range (e.g., 2020 – 2026) with dual sliders and presets.
  - Academic Access Tier (Open Access, Peer-Reviewed, Institutional Repository).
  - File Formats (PDF, EPUB, Audio Lecture, Dataset).
  - Minimum Academic Rating (4.0+, 4.5+, 4.8+).
  - Sort Index Order (Most Downloaded, Recently Added, Citations, Year).
- [x] Add active filter chip tags with one-click "Clear All Filters" reset.

### Milestone 13: Admin Gemini AI Catalog Intelligence & Health Report Modal — [✅ 100% Complete & Verified]
- [x] Add `generate-catalog-report` action to `src/app/api/ai/route.ts` using `gemini-3.5-flash` to audit catalog density, metadata health, and research expansion topics.
- [x] Build `src/components/admin/catalog-intelligence-modal.tsx` with high-density charts, domain breakdown, DOI/ISBN completeness meters, and actionable recommendations.
- [x] Connect the "Generate AI Report" button in `role-layout.tsx` and `src/app/admin/page.tsx` to trigger this modal.
- [x] Provide one-click "Export Health Audit as Markdown/JSON" and "Apply Recommended Category Tags".

### Milestone 14: Quality Assurance, Verification & Documentation
- [x] Verify `npx tsc --noEmit` returns 0 errors.
- [x] Verify `npm run lint` returns 0 warnings.
- [x] Verify `npm run build` succeeds cleanly.
- [x] Update `MEMORY.md` to reflect Phase 2 progress.