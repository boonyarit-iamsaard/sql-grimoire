# SQL Grimoire

Browser-based SQL-learning RPG. Currently a **validated one-mission prototype** ("The Missing
Shipment") built from `requirements.md`; the long-term goal is a commercial platform teaching
database reasoning (querying → schema design → constraints → transactions → concurrency →
indexing → query plans → migrations → ORM behavior) through production incidents framed as
quests. The open validation question: do playtesters finish mission one wanting mission two?
Full founder vision, curriculum ladder, and sequencing plan: see `VISION.md`.

## Commands

- `pnpm dev` — dev server (Vite, default port 5173)
- `pnpm build` — typecheck (`tsc -b`) + production build
- `pnpm preview` — serve the production build

## Architecture (the seams that matter)

- **Missions are pure data** (`src/game/missions/`): schema/seed SQL, dialogue, hints, reward,
  explanation. Adding a mission = new data file + entry in the `missions` array. No engine changes.
- **SQL runtime behind an interface** (`src/sql/sql-runtime.ts`): current impl is sql.js (SQLite
  wasm) inside a Web Worker (`sqlite-runtime.ts` + `sql.worker.ts`). Queries exceeding 2s are
  interrupted by terminating the worker and rebuilding the DB. Future missions (query plans,
  concurrency) may need a PGlite implementation behind the same interface.
- **Grading compares results, never SQL text** (`src/sql/evaluator.ts`,
  `src/sql/result-normalizer.ts`): pure, portable modules. Columns case-insensitive/any order;
  rows are a sorted multiset (order ignored, duplicates preserved, NULL via sentinel).
- **Progress in localStorage** (`src/game/progress/progress-store.ts`). The persisted field is
  still named `journal` and the storage key `sql-rpg-progress-v1` — renamed only in the UI
  ("Grimoire", `/grimoire` route) to avoid breaking saves.

## Conventions & gotchas

- Plain CSS in `src/styles.css`, Catppuccin Macchiato palette (vars `--ctp-*`), JetBrains Mono
  (self-hosted via Fontsource) at `--mono-size: 14px` for all code surfaces.
- `optimizeDeps.include: ["sql.js"]` in `vite.config.ts` is load-bearing: sql.js is CommonJS and
  the dev-mode module worker fails to import it without prebundling (prod build works either way).
- Don't gate Run/Submit on client-side SQL validity — SQLite is the judge; error messages are the
  pedagogy. Submit is disabled only on empty input.
- All art is hand-authored SVG; sounds are WebAudio-synthesized. Third-party licenses in
  `ASSET-LICENSES.md`.
- Naming (2026-07): product/repo is `sql-grimoire` ("sql-wizard"/"sqlmancer" are taken). The
  in-game world ("Duskharbor Coast") is disposable story copy. Directory may still be named
  `sql-rpg-prototype` — rename to `sql-grimoire` is pending.

## Markdown workflow

After finishing any edits to Markdown files, always run:

- `pnpm dlx prettier --write "**/*.md"`
- `pnpm dlx markdownlint-cli "**/*.md"`

## Verification

E2E scripts (Playwright driven by bun) live in the session scratchpad, not the repo — the flow
they cover: landing → map → briefing → workbench → run/error/hint → wrong submit → correct
submit → XP/grimoire → refresh persistence → runaway-query interruption. If they're gone,
re-derive from this list against `pnpm preview`.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`,
`wontfix`), unchanged. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
