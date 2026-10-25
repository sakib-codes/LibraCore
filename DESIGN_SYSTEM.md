# DESIGN_SYSTEM.md — UI Styling, Theme Tokens & Stitch Reference

## 1. Visual Identity (Dual Light & Google AI Studio Dark Mode)
- **Light Aesthetic:** Clean, academic slate theme with crisp borders and subtle depth.
- **Dark Aesthetic (Google AI Studio Obsidian Palette):**
  - **Philosophy:** Eliminates optical halation, pupil fatigue, and glaring contrast by avoiding pure `#FFFFFF` (100% luminance) on dark backgrounds, avoiding saturated neon chromatic tension, and restraining typography weights from thick `font-black` (900) down to `font-semibold` (600) / `font-medium` (500).
  - **Canvas Background:** Pure neutral obsidian charcoal `#131314` (`hsl(240 3% 7.8%)`) — matches Material 3 Dark Surface.
  - **Surface Container (Cards & Sidebar):** Elevated graphite slate `#1E1F20` (`hsl(240 3% 12.2%)`).
  - **Surface High (Buttons, Active Pills, Inputs):** Velvet graphite pill `#282A2C` (`hsl(210 4% 16.5%)`).
  - **Dividers & Low-Contrast Borders:** `#303134` / `#3C4043` (`hsl(215 5% 21%)`) — whisper-quiet separation without cage lines.
  - **Primary Foreground Text:** Soft warm grey `#E3E3E3` (`hsl(210 6% 88.5%)`) — provides a restful ~13:1 contrast ratio that completely halts glare.
  - **Secondary / Muted Foreground:** Google neutral grey `#9AA0A6` (`hsl(215 7% 62.5%)`) — comfortable sustained reading for metadata and labels.
  - **Primary Interactive Accent:** Soft cornflower / periwinkle `#A8C7FA` (`hsl(217 91% 82%)`) — gentle desaturated pastel.
  - **Semantic Status Badges:** Neutral pill chips (`bg-secondary text-muted-foreground border border-border/80 text-[10px] rounded-full`) to eliminate neon distraction.
- **Typography Weight Rules in Dark Mode:**
  - Never use `font-black` (900) or `font-extrabold` (800) in dark mode headings or numbers. Dark backgrounds visually expand glyph weight; clamp major headings to `font-semibold` (600) and subtitles to `font-medium` (500) or `font-normal` (400).
  - Use rounded-full pill geometry for active sidebar links, tabs, and filters.

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