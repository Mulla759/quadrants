# Quadrant — Design

Source of truth: `~/Documents/quadrant.pen`. The MVP is built from frame **1. Quiet Canvas**
(desktop 1440×900). Do not redesign the system; implement it.

## Frames

| Frame | Status | Use |
| --- | --- | --- |
| 0. Landing Page | **Implemented** | Marketing page served at `/` (app at `/app`). React source in `packages/web/src/landing/`; exported reference in `design/landing/`. |
| 1. Quiet Canvas | **Source of truth** | Map view: sidebar, top bar, 2×2 matrix, status bar, all interaction states |
| 2. Matrix Map | Retired | Alternative explored for the PRD open question; not used |
| 3. Priority Board | Retired (WIP probe) | Not used |
| 4. Today View | Active | Today: top three + side quests, priority numbers, carry-over |
| 5. Command Palette | Active | ⌘K grouped results (Tasks / Commands / Maps) |
| 6. Categories | Active | Category management + the 8-color system |
| 7. Task Detail | Active | Right drawer: quadrant, category, due date, notes |

Retiring 2 and 3 resolves the PRD question "Pick between frames 2 and 3, or retire them".

## Tokens

Colors are referenced as pen variables and, in code, as CSS variables. Light is the default;
dark values were added to the same variables (theme axis `mode`).

| Token | Light | Dark |
| --- | --- | --- |
| `bg` | `#FAFAF9` | `#141413` |
| `sidebar` | `#F4F4F2` | `#191918` |
| `surface` | `#FFFFFF` | `#1C1C1B` |
| `text-primary` | `#1F1F1F` | `#F2F2F0` |
| `text-secondary` | `#71717A` | `#A0A0A8` |
| `text-faint` | `#A1A1AA` | `#6E6E76` |
| `line` | `#E4E4E7` | `#2C2C2E` |
| `hover` | `#F4F4F5` | `#232322` |
| `selected` | `#EFEFEF` | `#2A2A29` |
| `accent` | `#3E63DD` | `#6E82F2` |
| axis line | `#0000001F` | `#FFFFFF24` |

- Accent is only for selection, focus, active map, drop target.
- No gradients. Radii: `3` (kbd), `4` (rows/fields), `8` (palette). One shadow (dragged task;
  overlay chrome may add a scrim shadow). Never decorate.

## Type

- **Inter** for UI; weights 400 normal / 500 medium / 600 semibold.
- **JetBrains Mono** for numbers, counts, shortcut keys, axes (10–11px, tracking `1` on axes).
- Sizes are only 11 / 13 / 14 / 20.

## Layout (1440×900)

- Sidebar `232`, padding `[12,10]`, gap `24`: workspace row (logo mark 20×20 `text-primary`,
  `grid-2x2` 12 white, "Quadrant" 14/600), primary nav (Search ⌘K, Map, Inbox, Today, Archive),
  Maps (header 12/500 faint + plus, map rows with counts), spacer, footer (Settings, Dark mode ⇧⌘L).
- Nav rows: height 30, radius 4, padding `[6,8]`, gap 10, icon 15; active = `#E9E9E6` (dark: `selected`),
  active map icon/label in accent/primary.
- Top bar `48`, padding `[0,24]`, border-bottom `line`: breadcrumb (`Maps / <Map> / <View>`), count
  (mono 11 faint), search field `240×28` (surface, border, radius 4, `/` kbd), command hint, avatar 24.
- Map stage padding `[16,32,12,32]`, gap 8: top axis ("↑ MORE IMPORTANT", mono 10, tracking 1),
  row `[Left Axis 14]["LESS URGENT"]["Matrix"][Right Axis 14 "MORE URGENT"]`, bottom axis ("↓ LESS IMPORTANT").
- Matrix: 2×2, split by 1px axis lines + 6px center dot (`bg` fill). Quadrants padded 24, gap 16.
- Status bar `28`, padding `[0,24]`, border-top `line`: shortcut hints (key mono 11 secondary + label
  11 faint, gap 5, group gap 16) and status text right ("Saved · 2 done this week").

## Quadrants

| id | Position | Number | Title | Description |
| --- | --- | --- | --- | --- |
| 1 | top-right | 01 | Most important | Urgent and important — do first |
| 2 | bottom-right | 02 | Semi-important | Urgent, less important — batch or delegate |
| 3 | top-left | 03 | Good to do | Important, not urgent — schedule it |
| 4 | bottom-left | 04 | Least important | Neither — drop it or do it later |

Quadrant label = number (mono 11 faint) · title (13/500) · count (mono 11 faint), then description
(11 faint), then the task list. Quadrants themselves stay uncolored.

## Task row

Height 30, radius 4, padding `[0,8]`, gap 8, `alignItems: center`, width fills.

`[drag handle 14, on hover/selected] [circle|circle-check 15] [title 14, fixed-width fill]
[category dot 6] [meta 11, e.g. "School · Oct 12"] [ellipsis 16, on hover]`

- Hover: `hover` fill, drag handle + ellipsis appear.
- Selected: `selected` fill.
- Completed: `circle-check` + faint title + meta "Done" + scribble strike.
- New task row: plus 15 + "New task" 14 faint.
- Inline new task: surface fill, accent 1px border, radius 4, caret 2×16 accent, hints "enter save · esc cancel".
- Drag: lifted row (surface, border, shadow 0 4 12 `#0000001A`), 300×30 ghost; target quadrant tinted
  `#3E63DD08`; drop indicator height 6 (6px dot + 2px accent line).

## Category colorization (PRD M-6)

Life categories are color-coded; the dot (6px) sits inside the meta group immediately before the
tag/date text: `● Website · Today`. Up to 8 per map. Quadrants stay neutral so color always means
life area. The 8 muted colors:

1 `#4E8A7E` School · 2 `#5B7CBA` Website · 3 `#9A5C8F` Career · 4 `#B98A2F` Finance ·
5 `#C05F45` Private · 6 `#6E9163` Scouts · 7 `#BC5B6B` Health · 8 `#64748B` Admin

Categories frame: rows (dot · name · count · ellipsis), the selected row expands to 8 swatches (14px,
active swatch ringed with accent), "New category", and the note "Quadrants stay uncolored — color marks
the life area."

## Today view

Header ("Today", date + "picks stay until done"), then two sections:

- **Top three** — "3 / 3", "Urgent + important — pick up to three". Picks are numbered 1–3 (mono 11 faint),
  rows carry the category dot; full list shows no add row.
- **Side quests** — "2 / 3", "Rest, play, people — keep the day balanced". Rows + "Add pick".
- Unfinished picks carry over to the next day until completed.

## Command palette

Scrim `#000F0F33`-style (`#0F0F0F33`), palette `480` wide, radius 8, surface, border, soft shadow,
centered at y 168. Input row (search icon, "Type a command or search…", `esc` kbd), divider, grouped
results (Tasks / Commands / Maps; row 30, selected `hover`), divider, footer hints `↑↓ navigate ·
↵ select · esc close`.

## Task detail

Right drawer `320` (x 1120, y 48, h 824), surface, 1px left border, padding 16, gap 16: header
("Task" + close), title 20/600, meta dot + context, divider, fields (Quadrant / Category / Due date /
Notes box), divider, hint column `Space complete · 1–4 move quadrant · E rename · ⌫ delete task`.

## Scribble (completion)

Port of `~/Documents/quadrant-assets/scribble.glsl` to canvas 2D (package `web`), not a shader in the
browser. H = 20; x from margin 4 across the title width; y = H/2 with wobble; `loops` 9–20; stroke
1.2–1.4 `#52525B`; alpha 0.85; draw 0.55–0.6s with cubic ease-out after a 0.4s delay. Honors
`prefers-reduced-motion` (draw immediately, no loops).

## Interaction states

hover (tint, drag handle, `···`), drag (lift + ghost + tinted target + accent drop line), selected,
inline new task, completed (0.6s scribble), keyboard focus (accent).

## Open decisions

- Today plan is **per map** in the MVP (PRD open question); revisit for a cross-map Today.
- Categories are **per map** in the MVP.
- Quadrant 04 does not auto-suggest archiving yet.
- Mobile/tablet: no dedicated frames; handled responsively in code (phone shows one quadrant at a
  time with a 2×2 mini-map switcher).
- Widgets: V2, not designed here.
