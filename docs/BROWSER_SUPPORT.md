# Browser support

Quadrant is a local-first web app. It stores everything in the browser (IndexedDB via
Yjs + `y-indexeddb`) and never requires an account or a server round-trip to use.

## Supported browsers

| Browser          | Minimum |
| ---------------- | ------- |
| Chrome / Edge    | 90+     |
| Firefox          | 90+     |
| Safari (macOS)   | 14+     |
| iOS Safari       | 14+     |
| Android Chrome   | latest  |

The production bundle targets `es2019` / `safari13` (`build.target` in `vite.config.ts`),
so anything at or above the matrix above should run it.

## Graceful degradation

- **IndexedDB is required for persistence.** `Workspace.open()` opens a `y-indexeddb`
  document. If IndexedDB is missing or restricted (for example, Safari/Chrome private
  windows, some embedded/`file://` contexts, or hardened privacy settings), the app does
  not spin forever: `packages/web/src/lib/browser.ts` exposes `hasIndexedDB()`, and
  `WorkspaceProvider` renders a clear fallback screen asking the user to open Quadrant in
  a normal window or a current browser. If the storage library still rejects while opening,
  `AppShell` shows its existing error state with a retry button.
- **No account, no server.** There is no network dependency for core editing; the app
  works fully offline once loaded.
- **No `localStorage` for data.** Task/map data lives only in IndexedDB. `localStorage` is
  not used as a data store, so clearing it does not lose work.
- **Optional APIs degrade quietly.** `structuredClone`, `crypto.randomUUID`,
  `Intl.DateTimeFormat`, the async Clipboard API, and `matchMedia` are feature-detected.
  `randomId()` falls back to a `crypto.getRandomValues` / `Math.random` UUID when
  `crypto.randomUUID` is unavailable, and the UI behaves the same without reduced-motion
  support.

## Routing and static hosting

The app uses a tiny history router (`packages/web/src/router.tsx`) with `<LandingPage/>`
at `/` and the application at `/app` (and `/app/...`). It relies on a SPA history
fallback: any unknown path serves `index.html` and the client routes from there.

- Vite handles this by default with `appType: "spa"`, which is set explicitly in
  `vite.config.ts`. This applies to both `vite dev` and `vite preview`, so a direct load
  of `/app` resolves to the app.
- On a static host, configure an equivalent rewrite/catch-all to `/index.html`
  (for example, an SPA fallback rule). The web app manifest uses `start_url: "/app"` and
  `scope: "/"`, so an installed PWA launches straight into the app while the landing page
  remains reachable.
