# TASKS.md — Autonomous Overnight Execution Checklist

> **Instruction for Agent:** Update this file by marking `[ ]` as `[x]` as you complete and verify each milestone. Do not stop until every single item below is `[x]`.

## Milestone 1: Environment, Types & Supabase Clients
- [ ] Verify `src/integrations/supabase/types.ts` matches all 5 tables (`profiles`, `categories`, `books`, `downloads`, `saved_books`) and helper types.
- [ ] Verify `src/integrations/supabase/client.ts`, `server.ts`, and `middleware.ts` handle cookie sessions and edge runtime cleanly.
- [ ] Verify `src/hooks/use-auth.tsx` fetches the current user session + `profiles` row (`role`, `is_suspended`) and updates reactively on login/logout.

## Milestone 2: Authentication Screens & Route Guards
- [ ] Wire `src/app/(auth)/login/page.tsx` with email/password login, Google OAuth, suspended-user check, and `sonner` toast feedback.
- [ ] Wire `src/app/(auth)/register/page.tsx` with account creation, metadata passing (`name`), and redirect to `/dashboard`.
- [ ] Wire `src/app/(auth)/reset-password/page.tsx` with password reset email trigger and password update form.
- [ ] Verify `src/middleware.ts` protects `/dashboard` (authenticated) and `/admin` (`role === 'admin'`).

## Milestone 3: Public Catalog, Categories & Instant Search
- [ ] Wire `src/app/page.tsx` and `src/app/catalog/page.tsx` to fetch live books & categories from Supabase.
- [ ] Implement debounced search by title/author and category/file-type pill filtering.
- [ ] Wire `src/app/categories/page.tsx` to display all categories with book counts and click-to-filter navigation.
- [ ] Wire `src/components/shared/book-card.tsx` bookmark toggle (`saved_books`) and direct download counter (`downloads`).

## Milestone 4: Book Detail, In-Browser Reader & Book AI Panel
- [ ] Wire `src/app/books/[id]/page.tsx` to fetch book metadata, category name, download count, and user bookmark state.
- [ ] Verify `src/components/shared/book-preview-reader.tsx` renders PDFs (`iframe`), Audio (`audio`), Images (`img`), and document fallbacks cleanly.
- [ ] Wire `src/components/shared/book-ai-panel.tsx` to `/api/ai` for contextual book Q&A with quick prompt chips.

## Milestone 5: Student Dashboard (`/dashboard`)
- [ ] Wire KPI cards (Saved Books count, Total Downloads count, Categories Explored count).
- [ ] Render the user's Saved Books grid with remove-bookmark and read/download actions.
- [ ] Render the user's Recent Downloads table with timestamps and re-download links.

## Milestone 6: Admin Dashboard, Storage Upload & AI Description (`/admin`)
- [ ] Wire Admin KPI stat cards (Total Users, Total Books, Total Downloads, Total Categories).
- [ ] Implement Book Upload & Edit modal with Supabase Storage upload (`library-files` and `book-covers` buckets).
- [ ] Wire the "✨ Auto-Generate Description with Gemini AI" button in the Book Modal to `/api/ai`.
- [ ] Wire Book Delete confirmation (`confirm-modal.tsx`) to remove the database row and storage files.
- [ ] Implement Category CRUD (Create, Edit, Delete categories) in the Categories tab.
- [ ] Implement User Management table (Toggle `admin`/`user` role and `Active`/`Suspended` status) in the Users tab.

## Milestone 7: Gemini AI Backend Routes & Global Chat Widget
- [ ] Verify `src/lib/gemini.server.ts` and `src/lib/chatbot.server.ts` use `GEMINI_API_KEY` cleanly with graceful fallback error messages if the key is missing or rate-limited.
- [ ] Wire `src/app/api/ai/route.ts` and `src/app/api/chatbot/route.ts`.
- [ ] Wire `src/components/layout/chat-widget.tsx` floating drawer with message history, markdown formatting, and clickable book recommendation links.

## Milestone 8: Final QA, Lint, Type-Check & Build Verification
- [ ] Run `npx tsc --noEmit` — 0 TypeScript errors.
- [ ] Run `npm run lint` — 0 ESLint errors.
- [ ] Run `npm run build` — Production build succeeds cleanly.