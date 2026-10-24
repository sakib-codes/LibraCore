# AGENTS.md — Autonomous Engineering Manual for LibraCore (LibrisAI)

## 1. Mandatory Context & Source of Truth Hierarchy
Before modifying any code, creating new features, or altering existing files in `sakib-codes/libracore`, you **MUST** read the repository documentation in this exact order:
1. **`MEMORY.md` (Primary System State & Regression Guard):** Contains the current working feature matrix, resolved bug logs, active Gemini model config (`gemini-3.5-flash`), test credentials, and the upcoming feature roadmap. **Never revert or break any fix documented in `MEMORY.md`.**
2. **`PROJECT_SPEC.md` (Functional & Database Specification):** Contains the core database schema, new roadmap schemas (`collections`, `collection_books`, profile extensions), storage bucket rules, and API contracts.
3. **`DESIGN_SYSTEM.md` (UI/UX Tokens & Component Standards):** Contains the Tailwind CSS, Shadcn UI, Glassmorphism rules, and Google Stitch MCP prompts.
4. **`TASKS.md` (Live Autonomous Execution Checklist):** Contains the step-by-step implementation checklist for the next roadmap modules. Update `[ ]` to `[x]` as you complete each task, and update `MEMORY.md` when a module reaches `✅ 100% Working`.

---

## 2. Non-Negotiable Regression Guards (From `MEMORY.md`)
- **Gemini Model Lock:** Always use **`gemini-3.5-flash`** as the primary model in `src/lib/gemini.server.ts` and `src/lib/chatbot.server.ts` (with `gemini-flash-latest` and `gemini-3.5-flash-lite` as fallbacks, and a 20s timeout). **NEVER** revert to `gemini-2.5-flash` (retired 404) or `gemini-3.8-flash` (170s queue timeout).
- **Toaster Position Lock:** Keep `<Toaster position="bottom-left" richColors closeButton />` in `src/app/layout.tsx` so toasts never block the top-right Navbar or `+ Upload New Resource` button.
- **JSX Entity Escaping:** Always escape apostrophes (`&apos;`) and quotes (`&quot;`) in JSX text nodes to prevent ESLint `react/no-unescaped-entities` build failures.
- **Cloudflare Edge Compatibility:** Ensure all API routes and server actions remain lightweight and compatible with `@opennextjs/cloudflare`.

---

## 3. Verification & Self-Healing Loops
After completing every component, migration, or route update, run these three verification commands sequentially:
1. `npx tsc --noEmit` (Must return 0 TypeScript errors)
2. `npm run lint` (Must return 0 ESLint warnings or errors)
3. `npm run build` (Must cleanly generate all Next.js routes with exit code 0; if `.next` lock issues occur, clean `.next` and re-run)

## 4. Autonomous Operating Rules (Unattended Mode)
- **Do Not Pause for Human Input:** Resolve all technical blockers autonomously.
- **Auto-Generate Missing UI:** If a roadmap feature requires new UI primitives (e.g., `command.tsx` for the `⌘K` palette, pagination, or annotation drawers), generate them via the **Google Stitch MCP** tool or construct them cleanly using `@radix-ui/*` and `lucide-react`.
- **Keep `MEMORY.md` & `TASKS.md` Updated:** Whenever you finish a roadmap module or fix a new bug, log it in `MEMORY.md` and check it off in `TASKS.md`.

---

## 5. Active Task Claiming Protocol & State Tracking
To prevent duplicate work or conflicts when multiple agents or automated sessions run:
1. **Mandatory Task Claiming:** Whenever an agent picks up a task or milestone, it **MUST IMMEDIATELY** mark that item in `TASKS.md` as `[🔄 IN PROGRESS - Agent Active]` before writing any code.
2. **Memory Lock Update:** Update the "Active Working Lock" section in `MEMORY.md` with the current claimed milestone and active timestamp.
3. **Task Completion Handoff:** Once the milestone is implemented and verified through the 3-step verification loop (`tsc`, `lint`, `build`), change `[🔄 IN PROGRESS - Agent Active]` to `[x]` in `TASKS.md`, update `MEMORY.md` feature status to `✅ 100% Working`, and clear the lock.