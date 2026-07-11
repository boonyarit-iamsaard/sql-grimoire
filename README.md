# SQL Grimoire

> _Fill your spellbook. Master the database._
>
> **PROTOTYPE — throwaway code answering one question:**
> _do developers enjoy solving a real SQL challenge inside a light RPG narrative enough to want a second mission?_
> Built from [requirements.md](requirements.md). One complete mission (~10–15 min): **The Missing Shipment**.
>
> Long-term, this prototype is step one toward a platform that teaches database _reasoning_
> (querying → schema design → constraints → transactions → concurrency → indexing → query
> plans → migrations → ORM behavior) through production incidents framed as quests. The
> query-evaluation logic (`apps/web/src/sql/evaluator.ts`) and the mission-as-data model are kept
> pure and portable for exactly that reason.
>
> Naming: the product/repo name is **sql-grimoire** (chosen 2026-07-11; "sql-wizard" and
> "sqlmancer" are taken, "SQL Grimoire" was unclaimed). The in-game world ("The Duskharbor
> Coast") is story copy and may change freely.

## Run it

```sh
pnpm install
pnpm dev
```

Open the printed URL (default <http://localhost:5173>).

## What's inside

- **React + TypeScript + Vite + React Router**, plain CSS in a Catppuccin Macchiato theme,
  JetBrains Mono (self-hosted) for all code surfaces.
- **sql.js (SQLite in WebAssembly)** running inside a Web Worker. A runaway query is
  interrupted after 2s by terminating the worker and rebuilding the database.
- **Result-based grading** (`apps/web/src/sql/evaluator.ts`): the player query and the reference query are
  both executed and their _results_ compared — column names case-insensitively, rows as a sorted
  multiset (row order ignored, duplicates preserved, `NULL`s handled via a sentinel). SQL text is
  never compared.
- **Progress in `localStorage`** (`apps/web/src/game/progress/progress-store.ts`): XP, completed missions,
  grimoire entries, last query. Survives refresh; "Reset progress" on the landing page wipes it.
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

Expected: 4 rows (orders 102, 105, 107, 110).

## Judging the prototype

Things to watch while someone plays:

- Do they read the dialogue or skim past it? (Is the narrative pulling weight?)
- Do failure messages get them unstuck without giving the answer away?
- After the success screen, do they ask what the next mission is? ← the actual success metric.
