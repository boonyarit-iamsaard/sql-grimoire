# SQL Grimoire

> _Fill your spellbook. Master the database._

SQL Grimoire is a browser-based SQL-learning RPG: an embedded database, result-graded challenges,
and a narrative world where missions are production incidents framed as quests.

This repository contains a complete but unvalidated one-mission prototype, **The Missing
Shipment**, which takes approximately 10–15 minutes to play. Playtesting has not yet started; the
prototype exists to answer one question: _do developers enjoy solving a real SQL challenge inside
a light RPG narrative enough to want a second mission?_

## Running the application

```sh
pnpm install
pnpm dev
```

Open the printed URL (default <http://localhost:5173>).

## Development setup

Two tools are required beyond a checkout:

- **Node.js 24 and pnpm.** The pnpm version is pinned by the `packageManager` field in
  `package.json`; `pnpm install` provides every JavaScript-ecosystem tool (Biome, Prettier,
  Vitest, and the rest) from the lockfile.
- **sqlfluff**, the SQL formatter and linter. It is a Python tool and therefore lives outside
  the pnpm toolchain. Install it with pipx, pinned to the same version the CI workflow
  (`.github/workflows/ci.yaml`) installs:

  ```sh
  pipx install sqlfluff==4.2.2
  ```

  The pre-commit hook lints staged `.sql` files, so sqlfluff must be on the `PATH` before
  committing SQL changes. Run `pnpm sql:check` to format and lint all SQL locally. When
  upgrading sqlfluff, change the version here and in `ci.yaml` together.

## Documentation map

- [VISION.md](VISION.md) — the founder vision, curriculum ladder, and sequencing plan.
- [PRODUCT.md](PRODUCT.md) — target users, product purpose, brand personality, and design
  principles.
- [DESIGN.md](DESIGN.md) — the design system ("The Candlelit Ledger Desk").
- [CONTEXT.md](CONTEXT.md) — the domain glossary.

## Technology and architecture

- **React, TypeScript, Vite, and TanStack Router**, Tailwind CSS v4 in a Catppuccin Macchiato
  theme, JetBrains Mono (self-hosted) for all code surfaces.
- **sql.js (SQLite in WebAssembly)** running inside a Web Worker. A runaway query is
  interrupted after two seconds by terminating the worker and rebuilding the database.
- **Result-based grading** (`apps/web/src/sql/evaluator.ts`): the player query and the reference query are
  both executed and their _results_ compared — column names case-insensitively, rows as a sorted
  multiset (row order ignored, duplicates preserved, `NULL`s handled via a sentinel). SQL text is
  never compared.
- **Progress in `localStorage`** (`apps/web/src/features/progress/progress-store.ts`): XP, completed missions,
  Grimoire entries, and the last query. Progress survives a page refresh; selecting "Reset progress"
  on the landing page deletes the stored progress.
- **The Grimoire** (`/grimoire`): every completed mission inscribes its query, the reference
  solution, and the concepts learned — the player's growing spellbook.
- **All art is hand-authored SVG** and both sounds are WebAudio-synthesized. Third-party assets
  (font, editor theme) are listed in [ASSET-LICENSES.md](ASSET-LICENSES.md).

## Walkthrough (spoiler)

```sql
SELECT
    o.id AS order_id,
    c.name AS customer_name,
    s.status AS shipment_status
FROM orders AS o
INNER JOIN customers AS c ON o.customer_id = c.id
INNER JOIN shipments AS s ON o.id = s.order_id
WHERE s.status = 'delayed';
```

The expected result contains four rows for orders 102, 105, 107, and 110.

## Evaluating the prototype

Observe the following behavior during a playtest:

- Does the player read the dialogue or skip it, and does the narrative sustain the player's interest?
- Do failure messages help the player proceed without revealing the answer?
- After viewing the success screen, does the player ask about the next mission? This is the primary
  success metric.
