# Quadrant — MVP scope and decisions

> **Evidence labels:** **Verified** = traceable to a file/commit/test/reproducible check · **Hypothesis** = plausible but unvalidated · **Planned** = proposed future work · **Missing** = no evidence exists.
> **Decision labels:** **Historical** = documented in the repo at development time · **Retrospective** = reconstructed now, from repo evidence, for this portfolio · **This task** = made while preparing this portfolio (dated).

## MVP scope

| User need | MVP capability | Status | Rationale | Supporting evidence |
| --- | --- | --- | --- | --- |
| Know what to do first | Four-quadrant urgency × importance map | Included | Core of the method (M-1) | `QUADRANTS` in [core/src/index.ts](../packages/core/src/index.ts), [MVP checklist](../docs/AGENT.md) |
| Capture fast | Inline create/edit, keyboard N/E, drag + keys 1–4 | Included | "Keyboard-fast" is the pitch (M-2/M-3/M-4) | `InlineTaskInput.tsx`, `Hotkeys.tsx`, `MapView.tsx` |
| Finish with relief | Scribble-complete, 5 s undo, 7-day auto-archive | Included | Paper fidelity: the satisfying moment (M-5) | `lib/scribble.ts`, `ARCHIVE_AFTER_MS = 7 * DAY` in core, `ui.tsx` 5 s toast |
| Life balance | Today: 3 focus + 3 side quests, carry-over | Included | The "three things" ritual (M-7) | `FOCUS_LIMIT = 3`, daily-plan tests in core |
| Context | Up to 8 muted-color categories, multiple maps, Inbox, Archive | Included | Color = life area, per the method (M-6/M-8/M-9) | `CATEGORY_COLORS`, `MapStore`/`WorkspaceStore` |
| Own your data | IndexedDB, offline, "Saved" status, JSON export/import | Included | Privacy by default (M-10/M-11) | `y-indexeddb` usage in core, export/import in `lib/utils` |
| Power use | Shortcuts, `/` search, ⌘K palette, ⌘P print, dark mode, PWA groundwork | Included (install surfaces as "Coming soon") | Completes the MVP promise (M-12…M-15) | `CommandPalette.tsx`, `PrintSheet.tsx`, `vite.config.ts` manifest |
| Multiplayer/share | Link-shared maps, live presence | Deferred → V1 | Needs a server; not required for solo value | [README roadmap](../README.md) |
| Accounts & sync | Optional login backup/sync | Deferred → V2 | Local-first is the differentiator (D01) | [README roadmap](../README.md) |
| Mobile apps | Expo mobile + widgets | Deferred → V2 | Desktop-first MVP; web PWA bridges the gap | [README roadmap](../README.md) |
| Teams/permissions/billing, subtasks, recurrence | — | Excluded | Out of scope for a personal tool; avoid fake complexity | [MVP non-goals](../docs/AGENT.md) |

## Decisions

### D01 — Local-first, no account (Historical)

**Problem.** A personal productivity tool should be private and instant; accounts add friction and a backend.
**Alternatives.** Cloud accounts with sync; local files; plain localStorage.
**Choice.** IndexedDB via Yjs (`y-indexeddb`), fully offline, "Saved" status, JSON export/import, no server.
**Cost accepted.** No cross-device sync, no collaboration, no usage analytics — which directly causes the *results* evidence gap in the case study.
**Evidence.** [core persistence layer](../packages/core/src/index.ts), [README](../README.md), roadmap V1/V2.
**Revisit when.** A real request for sharing/sync from users (see next-steps signals).

### D02 — Yjs CRDT documents from day one (Historical)

**Problem.** V1 (share a map by link) needs conflict-free merging; retrofitting that onto a plain JSON store would be a migration.
**Alternatives.** Plain objects in localStorage; a hand-rolled sync protocol.
**Choice.** Every map and the workspace is a Yjs doc persisted with `y-indexeddb`, even though the MVP is single-user.
**Cost.** Slightly heavier persistence and a mental model (CRDT) most apps don't need yet.
**Evidence.** [core docs in docs/AGENT.md](../docs/AGENT.md), Yjs usage in core, roadmap V1.
**Revisit when.** If V1 sync is descoped, plain storage would be simpler.

### D03 — Paper-fidelity interactions (Historical)

**Problem.** The method's emotional payoff — crossing something out — is what makes the paper system work; a checkbox alone loses it.
**Alternatives.** Standard strikethrough; instant deletion; no animation.
**Choice.** A hand-drawn scribble strokes across the task on completion, with a 5-second undo window and quiet auto-archive after 7 days.
**Cost.** Canvas animation code, edge cases (reduced motion, varying title widths) — an engine ([`lib/scribble.ts`](../packages/web/src/lib/scribble.ts)) instead of one CSS class.
**Evidence.** M-5 checklist item, scribble tests, the walkthrough screenshot `assets/mvp-02-core-action.png`.
**Revisit when.** If users find the 5 s undo too short or the scribble distracting (needs the planned usability test to know).

### D04 — One Vite app, two surfaces (Historical)

**Problem.** A landing page that sells the method and a fast app are both needed; two projects would double the maintenance.
**Alternatives.** Separate marketing site; a framework router (React Router) in one app.
**Choice.** A single Vite app with a ~30-line, dependency-free router: `/` = landing, `/app` = product; PWA `start_url` is `/app`.
**Cost.** Hand-rolled routing (must keep the tiny router honest) and one bundle for both audiences.
**Evidence.** [`router.tsx`](../packages/web/src/router.tsx), routing note in [docs/AGENT.md](../docs/AGENT.md), screenshot `assets/mvp-01-entry.png`.
**Revisit when.** If the landing needs SEO/SSR or diverges heavily from the app.

### D05 — Static hosting with SPA rewrites (This task, 2026-11-22)

**Problem.** Deploy the monorepo to Vercel so reviewers get a live demo; `/app` must not 404 on refresh (client-side routing).
**Alternatives.** Vercel "framework preset" auto-detection (couldn't be relied on non-interactively for a turbo monorepo); a small Node server for routing (overkill).
**Choice.** Root `vercel.json`: `pnpm install --frozen-lockfile` → `pnpm build` (turbo builds `core` then `web`) → serve `packages/web/dist` with all routes rewritten to `index.html` (filesystem files take precedence over the rewrite, so assets are unaffected).
**Cost.** Deployment settings live in the repo; the SPA rewrite pattern assumes a static, JS-only site (true here).
**Evidence.** [`vercel.json`](../vercel.json), live URL in the [README](../README.md), deployed site verified (landing and `/app` both render).
**Revisit when.** If SSR/SEO or non-JS rendering becomes a requirement.
