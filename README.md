# Quadrant

A calm, text-first to-do app built on one urgency × importance map, a daily top three, and
color-coded life categories. It runs in the browser with no account and stores everything locally.

Quadrant digitizes the paper system: sort every task into four urgency/importance quadrants,
color-code it by life area, cross it out when done, and each day box three priority tasks plus
three side quests for balance. Unfinished daily picks carry over until they are finished.

## MVP

- Four-quadrant map: 01 Most important · 02 Semi-important · 03 Good to do · 04 Least important
- Inline capture (`N`), edit (`E`), triage by drag or `1`–`4`, complete (`Space`, scribble, undo)
- Up to 8 muted-color life categories, shown as a dot on each row
- Today: top three + side quests, with carry-over
- Multiple maps, Inbox, Archive (auto-archive after 7 days)
- IndexedDB persistence, fully offline, "Saved" status, JSON export/import
- Keyboard shortcuts, `/` search, ⌘K command palette, dark mode, installable PWA

## Quick start

```sh
pnpm install
pnpm dev        # http://localhost:5173/ (landing) · http://localhost:5173/app (app)
pnpm test
pnpm build
```

## Structure

```
design/landing  exported design references for the landing page (frame "0. Landing Page")
packages/core   @quadrant/core — data model, Yjs docs, IndexedDB, ordering, daily plans
packages/web    @quadrant/web  — React + Vite + Tailwind (landing page at /, app at /app)
```

Design source of truth is `~/Documents/quadrant.pen` (frame "1. Quiet Canvas" for the app, frame
"0. Landing Page" for the site); see `DESIGN.md`. Agent and API notes live in `AGENT.md`.

## Roadmap

- **MVP** — the local single-user system above.
- **V1** — share a map by link, live presence over WebSockets (Hocuspocus + Postgres).
- **V2** — optional login (backup/sync), Expo mobile apps, home-screen widgets.
