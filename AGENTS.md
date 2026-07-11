# SQL Grimoire

SQL Grimoire is a browser-based SQL-learning RPG. It is currently a **validated one-mission prototype** ("The Missing
Shipment") built from `requirements.md`; the long-term goal is a commercial platform teaching
database reasoning across querying, schema design, constraints, transactions, concurrency,
indexing, query plans, migrations, and ORM behavior through production incidents framed as
quests. The current validation question is whether playtesters finish mission one wanting mission two.
Full founder vision, curriculum ladder, and sequencing plan: see `VISION.md`.

## Commands

- `pnpm dev` starts the Vite development server on port 5173 by default.
- `pnpm build` runs the typecheck (`tsc -b`) and creates the production build.
- `pnpm test` runs the Vitest suite.
- `pnpm preview` serves the production build.

## Architectural seams

- **Missions are pure data** (`apps/web/src/missions/`). Each Mission contains schema and seed SQL,
  dialogue, hints, a reward, and an explanation. Add a mission data file, then register it and its Location in the campaign
  catalog (`apps/web/src/features/campaign/campaign-catalog.ts`). Adding a Mission requires no route changes.
- **Routes are thin adapters** (`apps/web/src/routes/`): TanStack Router generates the typed route
  tree from these files. Route modules translate URL parameters and navigation into feature-screen
  props; feature implementations do not depend on the router.
- **Mission Attempts own investigation sequencing**
  (`apps/web/src/features/mission/mission-attempt.ts`): database lifecycle, result projection,
  reset-isolated grading, and completion facts sit behind one interface. React owns presentation.
- **SQL runtime behind an interface** (`apps/web/src/sql/sql-runtime.ts`): the current implementation
  uses sql.js (SQLite WebAssembly) inside a Web Worker (`sqlite-runtime.ts` and `sql.worker.ts`). Queries
  exceeding two seconds are interrupted by terminating the worker and rebuilding the database. Future missions (query plans,
  concurrency) may need a PGlite implementation behind the same interface.
- **Grading compares results, never SQL text** (`apps/web/src/sql/evaluator.ts`): one pure,
  portable module owns canonicalization and verdicts. Columns are case-insensitive/in any order;
  rows are a sorted multiset (order ignored, duplicates preserved, NULL via sentinel).
- **Player Progress owns durable completion**
  (`apps/web/src/features/progress/progress-store.ts`). The persisted field remains `journal` and the
  storage key remains `sql-rpg-progress-v1` to preserve saves; feature screens use domain
  operations instead of the storage shape.

## Conventions and considerations

- Formatter split: Biome owns only languages it fully supports (JavaScript, TypeScript, JSON, and CSS);
  Prettier is the fallback for everything else (Markdown, HTML, YAML). When Biome
  support for a language becomes stable, move it to Biome: enable it in `biome.json` and add
  a per-language override in `.vscode/settings.json`.
- Tailwind CSS v4 (CSS-first config): `apps/web/src/styles.css` holds the `@theme` tokens —
  Catppuccin Macchiato palette (`--color-ctp-*`), fonts, `--shadow-paper`, keyframes — plus
  base heading/body styles; everything else is utilities in JSX. Class composition goes through
  `cn()` (`apps/web/src/lib/cn.ts`, clsx and tailwind-merge). Shared `Button` component in
  `apps/web/src/shared/ui/button.tsx` — its variant record intentionally mirrors `cva`; adopt
  `cva` only when a second variant axis, such as `size`, appears. Code surfaces use the `text-mono` token (14 pixels,
  JetBrains Mono self-hosted via Fontsource). Residual CSS is only for CodeMirror internals
  and the `prefers-reduced-motion` override.
- `optimizeDeps.include: ["sql.js"]` in `apps/web/vite.config.ts` is required because sql.js is CommonJS and
  the development-mode module worker fails to import it without prebundling. The production build works with or without prebundling.
- Do not disable Run or Submit based on client-side SQL validity. SQLite determines validity, and
  its error messages are part of the pedagogy. Submit is disabled only on empty input.
- All art is hand-authored SVG, and sounds are synthesized with WebAudio. Third-party licenses are
  documented in `ASSET-LICENSES.md`.
- Naming (2026-07): the product and repository are named `sql-grimoire` ("sql-wizard" and "sqlmancer" are taken). The
  in-game world ("Duskharbor Coast") is narrative text that may change. The directory may still be named
  `sql-rpg-prototype` — rename to `sql-grimoire` is pending.

## Markdown workflow

Write documentation in clear, grammatically correct, professional English. Avoid casual,
conversational, or abbreviated phrasing in README files, architecture documents, requirements,
and agent instructions. Use words instead of shorthand symbols when writing prose; for example,
write "and" instead of `+` or `&`.

After finishing any edits to Markdown files, always run `pnpm md:check` —
prettier (write) and markdownlint over `**/*.md`, both pinned as local
devDependencies.

## Verification

End-to-end scripts (Playwright driven by Bun) live in the session scratchpad rather than the
repository. They cover the landing page, map, briefing, workbench, query execution, SQL errors,
hints, incorrect and correct submissions, XP and Grimoire updates, persistence after refresh,
and runaway-query interruption. If the scripts are unavailable, reconstruct them from this list
and run them against `pnpm preview`.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, and `wontfix`) remains unchanged. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository with one `CONTEXT.md` file and one `docs/adr/` directory at
the repository root. See `docs/agents/domain.md`.
