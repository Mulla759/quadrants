# Docs

Project documentation for **Quadrant**.

| Doc | What it covers |
| --- | --- |
| [`../README.md`](../README.md) | Product overview, origin story, quick start, roadmap |
| [`AGENT.md`](AGENT.md) | Repo layout, routing, commands, and the `@quadrant/core` API contract |
| [`DESIGN.md`](DESIGN.md) | Visual system: frames, tokens, layout, interaction states |
| [`BROWSER_SUPPORT.md`](BROWSER_SUPPORT.md) | Supported browsers, graceful degradation, static hosting |

## Repo root

Files that must stay at the root so tooling resolves them:

- `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` — pnpm workspace
- `turbo.json`, `tsconfig.base.json` — Turborepo and TypeScript base config
- `README.md`, `LICENSE`, `.gitignore`
- `AGENTS.md` — Turborepo's managed agent-guidance block

Everything else lives in folders: `design/` (exported references), `docs/` (this folder), and
`packages/` (the `core` and `web` workspaces).
