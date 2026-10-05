# Landing page

Source design: `design/landing/reference.html` (exported from `~/Documents/quadrant.pen`, frame
"0. Landing Page"). It is the visual source of truth; keep the React implementation faithful to it.

## Structure (single responsibility)

- `LandingPage.tsx`: composition only. It renders the sections; it holds no content or logic.
- `sections/<Name>.tsx`: one section per file. A section owns its own copy and its own markup.
- `ui/*.tsx`: shared presentational primitives (`Button`, `Container`, `Kbd`, `MonoLabel`,
  `CategoryDot`). No business logic, no section-specific content.

Rules:

- Keep each section self-contained. Do not reach into another section's file.
- Content lives next to the section that renders it; shared data belongs in `ui` only if it is
  purely presentational.
- Navigation between the landing page and the app goes through `src/router.tsx` (`navigate("/app")`),
  never a raw anchor that reloads the page.
- Use the design tokens (`bg`, `ink`, `muted`, `line`, `accent`, …) from `src/index.css`. Do not
  hardcode hex values that already exist as tokens.
