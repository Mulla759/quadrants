# Quadrant — Portfolio documentation

Review guide for the Method **Engineering Resident** and **Product Management Resident** portfolio submission. This folder holds the evidence for both tracks; the product is a small, real, working application that you can open in a browser in under a minute.

## What's in this folder

| File | Purpose |
| --- | --- |
| [`case-study.md`](case-study.md) | Product narrative: problem, discovery, MVP, walkthrough (with real screenshots), results, next steps. |
| [`engineering.md`](engineering.md) | Architecture, data flow, one documented technical challenge, testing, and version-control evidence. |
| [`decisions.md`](decisions.md) | MVP scope table and the 5 most consequential decisions, with alternatives and revisit conditions. |
| [`feedback.md`](feedback.md) | User feedback log: real feedback entries with source, date, insight, and limitations. |
| [`assets/`](assets/) | Screenshots of the current MVP, captured from the real running app (synthetic demo data, labeled). |

Existing project docs that these link to: [`../README.md`](../README.md) (overview + commands), [`../docs/AGENT.md`](../docs/AGENT.md) (repo layout + MVP checklist M-1…M-15), [`../docs/DESIGN.md`](../docs/DESIGN.md) (visual system), [`../docs/BROWSER_SUPPORT.md`](../docs/BROWSER_SUPPORT.md).

## Recommended review order

1. [`../README.md`](../README.md) — what the product is, demo/source links, 60-second setup.
2. [`case-study.md`](case-study.md) — the product story end to end.
3. [`decisions.md`](decisions.md) — scope and trade-offs behind that story.
4. [`engineering.md`](engineering.md) — how it's built, tested, and how problems were solved.
5. Open the live app and cross-check the walkthrough against it.

## Evidence conventions

Every substantive claim is labeled: **Verified** (traceable to a file, commit, test, or reproducible check), **Hypothesis** (plausible but unvalidated), **Planned** (proposed future work), or **Missing** (no evidence exists). Repository inspection alone does not establish user discovery, and nothing here invents interviews, users, or metrics.

## Rubric-to-evidence checklist

| Rubric requirement | Status | Direct evidence | Remaining gap or action |
| --- | --- | --- | --- |
| Engineering: code quality | Supported | [Repo](https://github.com/Mulla759/quadrants) (public), live deployment, [architecture notes](engineering.md), `pnpm typecheck` passing | — |
| Engineering: testing and version control | Supported | [Test suite](engineering.md#testing), CI workflow (`.github/workflows/ci.yml`), 21-commit history with feature branches and a merged PR | CI is newly added this week; see [engineering.md](engineering.md#testing) for what remains untested |
| Engineering: technical problem-solving | Supported | [The narrow-pane animation bug](engineering.md#technical-challenge) — found, investigated, fixed, and validated during this task (labeled as such) | — |
| Product: problem and framing | Supported | [Problem and opportunity](case-study.md#1-problem-and-opportunity), origin story in [README](../README.md) | Market demand is a hypothesis, not measured |
| Product: discovery | Partial | One real, linkable discovery source (Isabel's [video](https://www.tiktok.com/@invinciblevenus_/video/7641595518291954977)) plus one real but informal interview (n = 1, Abdikarim Mohamed) recorded in the [feedback log](feedback.md) | No systematic research yet — no surveys, usability tests, or analytics. Collection is ongoing; plan in [case-study.md](case-study.md#3-discovery) |
| Product: prioritization and scope | Supported | [MVP scope table and decisions](decisions.md), MVP checklist M-1…M-15 in [docs/AGENT.md](../docs/AGENT.md) | Some original rationale is reconstructed retroactively and labeled |
| Product: results | Partial | Technical outcomes are verified ([engineering.md](engineering.md#testing), live site). User/business outcomes: **Missing** — no analytics exist (local-first, no account) | Measurement plan in [case-study.md](case-study.md#6-results) |
| Across both tracks (communication, ambiguity) | Supported | This guide, the case study, and decision records are written for a multidisciplinary reviewer; uncertainty is labeled rather than hidden | — |

Statuses: **Supported** (direct evidence exists), **Partial** (some evidence, with gaps), **Missing** (no evidence; a plan is documented).
