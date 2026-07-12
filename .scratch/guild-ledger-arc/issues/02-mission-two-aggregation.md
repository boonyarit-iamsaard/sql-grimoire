# 02 — Mission two: aggregation incident

Status: resolved
Blocked by: 01

## Problem

The Arc needs its middle Mission: a guild-ledger incident whose answer requires `GROUP BY`,
an aggregate function, and ideally `HAVING` — the rows-to-groups mental model, one difficulty
step above mission one's joins.

## Constraints from the spec

- Lives in the new Inner Archives Location (hence blocked by issue 01).
- Same guild-ledger schema as mission one; the seed grows to make the aggregation question
  meaningful (more customers, orders, and cities so groups have interesting sizes).
- SELECT-graded through the existing challenge contract (`expectedColumns`,
  `referenceQuery`, hints); no engine or evaluator changes.
- Directory-per-mission layout: `apps/web/src/missions/<slug>/` with `mission.ts`,
  `schema.sql`, `seed.sql`, `reference.sql`.
- Narrative continuity: mission one's reward ends with the doorkeeper waving the player into
  the inner archives; this Mission opens there. Incident candidates in the spirit of the
  world: "which route or city concentrates the delays?" — a question whose answer is a
  ranking or a filtered group summary.

## Creative work (founder plus agent, together)

Scenario, dialogue, character (a new archives NPC or Odalia again), hints (three, hint one
conceptual, hint three nearly the answer, mirroring mission one), reward text, explanation
summary and concepts, and seed-data storytelling.

## Acceptance

A playtester who solved mission one can solve mission two with at most the hints; the
reference query uses `GROUP BY` and an aggregate; `pnpm sql:check`, tests, and build pass.

## Answer

Shipped as "The Council's Tally" (`apps/web/src/missions/council-tally/`), proposed by the
agent and accepted by the founder without changes. The guild council votes at dawn on repair
funds; the player tallies delayed orders per city and reports every city with two or more
(`city`, `delayed_orders`; answer: Duskharbor 4, Thornfield 2, verified by executing the
seed and reference against SQLite). New NPC Archivist Hesper with two hand-authored SVG
portraits (neutral, stern); new Inner Archives Location registered with
`prerequisiteLocationId: "merchant-guild"` and new location art. The `???` probe tooltip was
reworded to stay truthful after the Archives unlock. Reward 120 XP; the success message
plants mission three's hook (orders with no shipment scroll at all). All gates pass:
sqlfluff, 11 tests, typecheck, build.
