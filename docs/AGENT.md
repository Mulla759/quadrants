# AGENT.md: working in this repo

Quadrant is a calm, text-first to-do app built on one urgency × importance map, a daily top three,
and color-coded life categories. Local-first, no account. See the root [`README.md`](../README.md)
for the product and [`DESIGN.md`](DESIGN.md) for the visual system. The full PRD lives in the task
description / issue tracker.

## Repo layout

```
quadrants/
├─ design/
│  └─ landing/          Exported design references for the landing page (frame "0. Landing Page")
├─ docs/                Project docs: AGENT.md, DESIGN.md, BROWSER_SUPPORT.md
├─ packages/
│  ├─ core/   @quadrant/core: data model, Yjs docs, IndexedDB persistence, ordering, plans
│  └─ web/    @quadrant/web : React + Vite + Tailwind app (the MVP + landing page)
├─ package.json · pnpm-workspace.yaml · pnpm-lock.yaml · turbo.json · tsconfig.base.json
└─ README.md · LICENSE · AGENTS.md
```

Root config (`package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json`,
`tsconfig.base.json`) must stay at the repository root: pnpm and Turborepo resolve it from there.


## Routing

Two surfaces share one Vite app, selected in `packages/web/src/Root.tsx` via the tiny router in
`packages/web/src/router.tsx` (no dependency):

- `/`: the landing page (`packages/web/src/landing/**`). Composition only in `LandingPage.tsx`;
  each section is one file under `landing/sections/`; shared presentational primitives under
  `landing/ui/`. Keep sections self-contained (SRP) so edits to one never break another.
- `/app` (and `/app/...`): the application (`packages/web/src/App.tsx` and `components/**`).

Navigate with `navigate("/app")`; never use a raw `<a href>` that reloads the page for in-app
routing. The PWA `start_url` is `/app`.

## Commands

```sh
pnpm install
pnpm dev                 # web dev server (http://localhost:5173)
pnpm build               # builds core then web
pnpm test                # vitest across packages
pnpm typecheck           # tsc --noEmit across packages
pnpm --filter @quadrant/core test
pnpm --filter @quadrant/web dev
```

## MVP scope (must ship)

M-1 four-quadrant map · M-2 inline create (N) · M-3 edit title/due/category (E) · M-4 drag + keys 1–4 ·
M-5 complete (Space, 0.6s scribble, undo 5s) · M-6 up to 8 categories with muted colors · M-7 Today
(3 focus + 3 side quests, carry-over) · M-8 multiple maps in sidebar with counts · M-9 Inbox + Archive
(auto-archive after 7 days) · M-10 IndexedDB, offline, "Saved" status · M-11 export/import JSON ·
M-12 keyboard shortcuts, `/` search, dark mode. P1: M-13 ⌘K palette + grouped search · M-14 task detail
panel · M-15 installable PWA.

Non-goals for the MVP: accounts, teams, permissions, billing, subtasks, projects, recurrence,
reminders, calendar/AI integrations.

## Conventions

- TypeScript strict. Named exports. React function components. No classes in the UI layer.
- Tailwind utilities only; tokens come from the CSS variables in `DESIGN.md` (no hardcoded colors).
- Local-first: the browser is the source of truth. All MVP features must work with the network off.
- Keyboard-first: every core action has a shortcut; shortcuts are shown in the status bar.
- No comments unless the logic is non-obvious. No new dependencies without a reason.
- Do not add analytics, accounts, or network calls in the MVP.

## Core API contract (`@quadrant/core`)

Both the data layer and the UI are written against this contract. Do not change signatures without
updating this file.

```ts
export type QuadrantId = 1 | 2 | 3 | 4;
export type TaskLocation = QuadrantId | "inbox";
export type CategoryColorIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Task {
  id: string; title: string; quadrant: TaskLocation; order: string;
  categoryId?: string; dueDate?: string; notes?: string;
  completedAt?: number; archivedAt?: number; createdAt: number; updatedAt: number;
}
export interface Category { id: string; name: string; color: CategoryColorIndex; order: string }
export interface DailyPlan { date: string; focus: string[]; sideQuests: string[] }
export interface MapMeta { id: string; name: string; icon?: string; createdAt: number; schemaVersion: number }
export interface MapExport {
  version: number; map: MapMeta; tasks: Task[]; categories: Category[]; plans: DailyPlan[];
}

export const CATEGORY_COLORS: readonly string[];          // 8 hex, index = color - 1
export const QUADRANTS: readonly { id: QuadrantId; number: string; name: string; description: string }[];
export const FOCUS_LIMIT = 3;                             // focus and side quests each cap at 3
export const ARCHIVE_AFTER_MS: number;                    // 7 days

export function orderBetween(prev?: string, next?: string): string;
export function orderAfter(last?: string): string;
export function orderBefore(first?: string): string;
export function sortByOrder<T extends { order: string }>(items: T[]): T[];

export class MapStore {
  static open(mapId: string): Promise<MapStore>;
  readonly mapId: string;
  readonly meta: MapMeta;
  readonly saved: boolean;                       // false while an IndexedDB write is pending
  renameMap(name: string): void;
  setIcon(icon: string): void;

  listTasks(filter?: { quadrant?: TaskLocation; includeCompleted?: boolean; includeArchived?: boolean }): Task[];
  getTask(id: string): Task | undefined;
  addTask(input: { title: string; quadrant?: TaskLocation; categoryId?: string; dueDate?: string; notes?: string; order?: string }): string;
  updateTask(id: string, patch: Partial<Pick<Task, "title" | "quadrant" | "categoryId" | "dueDate" | "notes">>): void;
  moveTask(id: string, quadrant: TaskLocation, order: string): void;
  completeTask(id: string): void;
  restoreTask(id: string): void;
  deleteTask(id: string): void;

  listCategories(): Category[];
  addCategory(input: { name: string; color: CategoryColorIndex }): string;
  updateCategory(id: string, patch: Partial<Pick<Category, "name" | "color">>): void;
  deleteCategory(id: string): void;              // detaches the category from its tasks

  getPlan(date: string): DailyPlan;
  setFocus(date: string, taskIds: string[]): void;       // capped at FOCUS_LIMIT
  setSideQuests(date: string, taskIds: string[]): void;  // capped at FOCUS_LIMIT
  addFocus(date: string, taskId: string): void;
  removeFocus(date: string, taskId: string): void;
  addSideQuest(date: string, taskId: string): void;
  removeSideQuest(date: string, taskId: string): void;
  carryOver(fromDate: string, toDate: string): void;     // copies undone picks (caps respected)

  archiveCompleted(olderThanMs?: number): number;        // returns count archived
  exportJSON(): string;                                  // MapExport
  static importJSON(json: string): Promise<MapStore>;    // creates a NEW map from a MapExport

  subscribe(listener: () => void): () => void;           // fires on any doc change
  destroy(): void;
}

export class Workspace {
  static open(): Promise<Workspace>;
  listMaps(): MapMeta[];
  createMap(name: string, icon?: string): Promise<string>;
  renameMap(id: string, name: string): void;
  deleteMap(id: string): void;
  get activeMapId(): string | undefined;
  setActiveMap(id: string): void;
  get theme(): "light" | "dark";
  setTheme(theme: "light" | "dark"): void;
  subscribe(listener: () => void): () => void;
  destroy(): void;
}

export function todayKey(date?: Date): string;                 // "YYYY-MM-DD"
export function formatDueDate(due?: string, now?: Date): string; // "Today" | "Tomorrow" | "Wed" | "Oct 12"
```

Storage: one Yjs `Y.Doc` per map (`y-indexeddb`, room `quadrant-map-<id>`). A local-only workspace
doc (`quadrant-workspace`) holds `deviceId`, `mapIds`, `activeMapId`, `theme`. IDs are nanoid.
Order uses fractional indexes.

## Git workflow used to build this

Branches live in separate worktrees (sibling directories), one owner per package:

- `feat/scaffold`: monorepo + `@quadrant/core` reference implementation (in-memory) so the web app
  can run before the Yjs layer lands.
- `feat/core`: the real `@quadrant/core` (Yjs + y-indexeddb) + vitest tests. Owns `packages/core/**`.
- `feat/web`: `@quadrant/web`. Owns `packages/web/**`.

Merge order: `scaffold` → `core` → `web`. `feat/core` replaces the scaffold's reference
implementation; it has the same contract, so nothing else changes.

Commit style: `feat(core): …`, `feat(web): …`, `chore: …`, `docs: …`.

## Verification (must pass before committing)

1. `pnpm typecheck` and `pnpm test` are green.
2. `pnpm build` succeeds.
3. Both surfaces are loaded in the pen.dev integrated browser: the landing page
   (`load-page http://localhost:5173/`) and the app (`load-page http://localhost:5173/app`): then
   checked with `return-screenshot`; the app is driven with CDP for the keyboard flows (add, triage,
   today, complete, reload persistence).

Update `DESIGN.md` when a design decision changes and this file when the API or commands change.
