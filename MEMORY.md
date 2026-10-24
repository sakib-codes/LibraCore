# 🧠 LibraCore (LibrisAI) — Architectural Memory & System State

> **CRITICAL INSTRUCTION FOR ALL AGENTS & DEVELOPERS:**  
> Before modifying any code, creating new features, or changing existing files in this repository, you **MUST** read this `MEMORY.md` document in its entirety. Respect existing design tokens (Tailwind CSS, Shadcn UI), Edge Runtime compatibility constraints (Cloudflare Workers/Pages), and backend schemas (Supabase + Google Gemini AI).

---

## 🏛️ System Overview & Architecture

- **Project Name:** LibraCore / LibrisAI (Intelligent Digital Library Management System)
- **Framework:** Next.js 15 (App Router)
- **Deployment Target:** Cloudflare Workers / Cloudflare Pages via `@opennextjs/cloudflare` and Edge Runtime.
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Storage Buckets: `library-files`, `book-covers`).
- **AI Intelligence:** Google AI Studio (Gemini API via Edge-native REST API with `@google/genai` fallback).
  - Primary Model: `gemini-3.5-flash` (Fast, ~3.5s response, active free-tier quota).
  - Fallback Models: `gemini-flash-latest`, `gemini-3.5-flash-lite`.
- **UI & Styling:** Tailwind CSS + Shadcn UI primitives + Lucide React + Glassmorphism aesthetic.
- **Notification System:** Sonner (`<Toaster position="bottom-left" richColors closeButton />`).

---

## 📊 Feature Status Matrix

| Feature / Module | Status | Backend Wired? | Edge / CF Ready? | Description & Notes |
|---|---|---|---|---|
| **Supabase Authentication** | ✅ 100% Working | Yes | Yes | Email/password login, register, reset-password, demo admin & reader one-click login. |
| **Session & Role Management** | ✅ 100% Working | Yes | Yes | `use-auth.tsx` syncs session cookies, handles `user` vs `admin` roles, supports live auth updates. |
| **Route Protection & Guards** | ✅ 100% Working | Yes | Yes | Edge `middleware.ts` protects `/dashboard` (authenticated) and `/admin` (`role === 'admin'`). |
| **Global Navigation Bar** | ✅ 100% Working | Yes | Yes | Search bar with `⌘K` shortcut trigger, mobile drawer, user profile dropdown, notification bell. |
| **Catalog & Live Search** | ✅ 100% Working | Yes | Yes | Real DB queries against `books` table, format filters (PDF, EPUB, Audio), category filters. |
| **In-Browser Document Reader** | ✅ 100% Working | Yes | Yes | Multi-tab reader (Document, Audio Lecture, BibTeX Citation copy, page navigation & zoom controls). |
| **Book Detail Page (`/books/[id]`)** | ✅ 100% Working | Yes | Yes | Metadata card, live download metric counter, bookmark toggle, embedded Gemini AI research panel. |
| **Contextual Book AI Q&A** | ✅ 100% Working | Yes | Yes | `/api/ai?action=book-qa` provides answers grounded in book title, author, and description. |
| **Global AI Librarian Chat** | ✅ 100% Working | Yes | Yes | `/api/chatbot` provides library recommendations with real Markdown links (`/books/[id]`). |
| **Admin AI Description Generator** | ✅ 100% Working | Yes | Yes | `✨ Auto-Generate with Gemini AI` in Upload Modal formulates a 3-sentence scholarly summary. |
| **Admin Book Upload & Storage** | ✅ 100% Working | Yes | Yes | Uploads media to `library-files`, cover to `book-covers`, creates record in `books` table. |
| **Admin Edit Monograph Metadata**| ✅ 100% Working | Yes | Yes | Modal dialog updates title, author, category, and description directly in Supabase. |
| **Admin Delete Monograph** | ✅ 100% Working | Yes | Yes | Deletes record from `books` table and removes corresponding files from Supabase Storage. |
| **Admin Category & Taxonomy CRUD**| ✅ 100% Working | Yes | Yes | Real DB sync with `categories` table. |
| **Admin Readers & Accounts Table** | ✅ 100% Working | Yes | Yes | Real DB sync with `profiles` table, displays status and roles. |
| **Research Workspace / Dashboard** | ✅ 100% Working | Yes | Yes | Saved bookmarks, download history table, CSV export, quick collection filter tags. |
| **Custom Research Collections** | 🟡 UI Functional | Local state | Yes | Modal creates collections; needs a dedicated `collections` table for cross-device persistence. |
| **Global Command Palette (⌘K)** | 🟡 UI Pill Ready | Not modal yet | Yes | Displays `⌘K` badge in nav; needs a global modal command dialog. |

---

## 🐛 Resolved Bugs & Regressions Log

1. **Gemini Model Timeout & 404 Bug (Fixed)**:
   - *Problem:* `gemini-3.8-flash` queued for 170+ seconds on Google's API, hitting the client timeout. `gemini-2.5-flash` was retired by Google returning 404.
   - *Fix:* Benchmarked all Google AI Studio models and switched primary model to **`gemini-3.5-flash`** (responds in 3.5s with status 200). Increased timeout to 20s.
2. **Toast Banner Overlapping Navbar & Header Actions (Fixed)**:
   - *Problem:* Default top-right Sonner toast blocked the `+ Upload New Resource` button and user avatar dropdown.
   - *Fix:* Repositioned to `bottom-left` in `layout.tsx` with glassmorphic styling (`bg-background/95 backdrop-blur-md shadow-xl border-border/80`).
3. **Missing `Progress` Component Compilation Error (Fixed)**:
   - *Problem:* `role-layout.tsx` imported `@/components/ui/progress`, causing TypeScript error `TS2307`.
   - *Fix:* Created `src/components/ui/progress.tsx` with full ARIA accessibility and percentage transitions.
4. **Admin Edit Monograph State Missing (Fixed)**:
   - *Problem:* The admin table had an edit button referencing `setSelectedBook`, `setEditTitle`, `setEditModalOpen`, but state and dialog were unwritten.
   - *Fix:* Declared state, implemented `handleUpdateBook` with Supabase update, and added the Edit Monograph Dialog.
5. **Apostrophe Unescaped in JSX (Fixed)**:
   - *Problem:* `Shor's algorithm` in `book-preview-reader.tsx` caused ESLint rule `react/no-unescaped-entities` failure.
   - *Fix:* Escaped to `Shor&apos;s algorithm`.
6. **Next.js Build Invariant `_not-found` Error (Fixed)**:
   - *Problem:* Competing dev server locks on `.next` caused `ENOENT: routes-manifest.json` and build failure.
   - *Fix:* Cleaned `.next` cache and verified builds run cleanly with zero errors.

---

## 🧪 Testing & Verification Status

- **TypeScript (`npx tsc --noEmit`):** 0 Errors ✅
- **ESLint (`npm run lint`):** 0 Warnings, 0 Errors ✅
- **Next.js Production Build (`npm run build`):** 12/12 routes statically and dynamically generated with exit code 0 ✅
- **Live Browser End-to-End Suite:**
  - Auth flow (Login, Sign Out, Role Switching) ✅
  - Admin Catalog CRUD (Upload, Edit, Delete, AI Description Generation) ✅
  - Reader Workflow (Search, Filter, Detail Viewer, BibTeX Copy, Download Logging, Bookmarking) ✅
  - AI Research Chatbot & Contextual Book Q&A ✅

---

## 🎯 Next Big Modules to Work On (Roadmap)

### 1. **Global Command Palette (`cmd+K` / `ctrl+K` Dialog)** *(Priority: High)*
- **Objective:** Clicking `⌘K` or pressing `Ctrl+K`/`Cmd+K` anywhere opens a floating search modal (using Shadcn `Command` / `cmdk`).
- **Features:** Instant keyboard navigation to books, categories, dashboard tabs, or AI search shortcuts.

### 2. **Persistent User Collections & Reading Lists** *(Priority: High)*
- **Objective:** Upgrade the temporary collection modal in `/dashboard` to a persistent database entity.
- **Implementation:**
  - Create Supabase migration: `collections` table (`id`, `user_id`, `name`, `description`, `color`, `created_at`) and `collection_books` join table.
  - Allow users to organize bookmarks into custom folders (e.g. "Thesis Research", "Lattice Cryptography").

### 3. **Native PDF Full-Manuscript Streamer & Annotation Engine** *(Priority: Medium)*
- **Objective:** In `book-preview-reader.tsx`, add an enhanced canvas reader using `pdfjs-dist` or embed with search, page thumbnail sidebar, and bookmarking specific page numbers.

### 4. **User Profile & Institutional Verification Settings** *(Priority: Medium)*
- **Objective:** Complete the `/dashboard?tab=profile` subview.
- **Features:** Allow scholars to update their avatar URL, bio, affiliated university/department, and change password.

---

## 🔐 Credentials Reference

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@libris.ai` | `Admin@123456` |
| **Reader / Scholar** | `student@libris.ai` | `Student@123456` |
