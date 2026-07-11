# SQL Grimoire

> _Fill your spellbook. Master the database._
>
> **PROTOTYPE — experimental code answering one question:**
> _Do developers enjoy solving a real SQL challenge inside a light RPG narrative enough to want a second mission?_
> Built from [requirements.md](requirements.md). The prototype contains one complete mission that
> takes approximately 10–15 minutes: **The Missing Shipment**.
>
> In the long term, this prototype is the first step toward a platform that teaches database
> _reasoning_ across querying, schema design, constraints, transactions, concurrency, indexing,
> query plans, migrations, and ORM behavior through production incidents framed as quests. The
> query-evaluation logic (`apps/web/src/sql/evaluator.ts`) and the mission-as-data model are kept
> pure and portable for exactly that reason.
>
> Naming: the product and repository are named **sql-grimoire** (chosen 2026-07-11; "sql-wizard" and
> "sqlmancer" are taken, "SQL Grimoire" was unclaimed). The in-game world ("The Duskharbor
> Coast") is story copy and may change freely.

## Running the application

```sh
pnpm install
pnpm dev
```

Open the printed URL (default <http://localhost:5173>).

## Technology and architecture

- **React, TypeScript, Vite, and TanStack Router**, plain CSS in a Catppuccin Macchiato theme,
  JetBrains Mono (self-hosted) for all code surfaces.
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
JOIN customers AS c ON c.id = o.customer_id
JOIN shipments AS s ON s.order_id = o.id
WHERE s.status = 'delayed';
```

The expected result contains four rows for orders 102, 105, 107, and 110.

## Evaluating the prototype

Observe the following behavior during a playtest:

- Does the player read the dialogue or skip it, and does the narrative sustain the player's interest?
- Do failure messages help the player proceed without revealing the answer?
- After viewing the success screen, does the player ask about the next mission? This is the primary
  success metric.
