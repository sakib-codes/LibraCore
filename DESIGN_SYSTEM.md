# DESIGN_SYSTEM.md — UI Styling, Theme Tokens & Stitch Reference

## 1. Visual Identity (Ported from EduBridge Reference)
- **Aesthetic:** Clean, academic, high-contrast light mode with crisp borders and subtle depth.
- **Color Palette (Tailwind / CSS Variables in `src/styles/globals.css`):**
  - Background Surface: `bg-slate-50` (`#F8FAFC`) for dashboard canvases, `bg-white` (`#FFFFFF`) for cards, tables, and modals.
  - Primary Accent: Deep Academic Indigo (`bg-indigo-600` / `#4F46E5`, hover `hover:bg-indigo-700`, light badge `bg-indigo-50 text-indigo-700 border-indigo-200`).
  - Borders & Dividers: `border-slate-200` (`#E2E8F0`), subtle card shadow `shadow-sm hover:shadow-md transition-all`.
  - Semantic Status Badges (`src/components/shared/status-badge.tsx`):
    - `PDF`: `bg-rose-50 text-rose-700 border-rose-200`
    - `EPUB` / `DOC`: `bg-indigo-50 text-indigo-700 border-indigo-200`
    - `AUDIO`: `bg-amber-50 text-amber-700 border-amber-200`
    - `IMAGE`: `bg-emerald-50 text-emerald-700 border-emerald-200`
    - `Active`: `bg-emerald-50 text-emerald-700` | `Suspended`: `bg-rose-50 text-rose-700`

## 2. Typography & Spacing
- **Font:** Inter / Geist Sans (`font-sans antialiased`).
- **Page Headers (`src/components/shared/page-header.tsx`):** `text-2xl md:text-3xl font-bold tracking-tight text-slate-900` with `text-sm text-slate-500` subtitle.
- **Card Radius & Padding:** `rounded-xl border border-slate-200 bg-white p-5 shadow-sm`.

## 3. Layout Architecture
- **Global Wrapper (`src/components/layout/app-shell.tsx`):** Renders sticky glassmorphic `navbar.tsx` (`h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40`), main content slot, and floating `chat-widget.tsx` (`fixed bottom-6 right-6 z-50`).
- **Dashboard Wrapper (`src/components/layout/role-layout.tsx`):** Responsive collapsible sidebar (`w-64 border-r border-slate-200 bg-white`) for Student (`/dashboard`) and Admin (`/admin`) views.
- **Empty & Loading States:** Always render `src/components/shared/loading-skeleton.tsx` while fetching data and `src/components/shared/empty-state.tsx` when arrays are empty.

## 4. Google Stitch MCP Fallback Prompts
If any UI component or screen is missing or needs regeneration via the Stitch MCP tool, use these exact specifications:
1. **Catalog Grid Card (`book-card.tsx`):** Aspect-ratio 3:4 cover container with fallback book icon, top-right `StatusBadge` for file format, top-left circular Bookmark icon button, category pill, 2-line clamped bold title, author subtitle, 2-line description, download counter, and Preview + Download buttons.
2. **Book Detail Split View (`/books/[id]/page.tsx`):** 12-column grid on desktop (`lg:col-span-8` left for Book Metadata + Tabbed In-Browser Previewer; `lg:col-span-4` right for sticky `book-ai-panel.tsx`).
3. **Admin Modal (`admin/page.tsx`):** Clean Shadcn `Dialog` with Title, Author, Category `Select`, File Type `Select`, Description `Textarea` with `✨ Auto-Generate with AI` button, and styled file inputs for Resource File and Cover Image.