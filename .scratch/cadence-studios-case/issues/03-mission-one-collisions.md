# 03 — Mission one: find the collisions

Status: ready-for-agent
Blocked by: 02

## Problem

The Case opener: customers are complaining that Cadence Studios sold the same room and slot
twice. Produce the list of double-booked slots. Result-graded with existing machinery — no
dependency on the Probe engine — so it can proceed in parallel with issue 01.

## Constraints

- Reference solution: `GROUP BY` room, date, slot with `HAVING COUNT(*) > 1` (or an equivalent
  self-join the founder prefers pedagogically); warms up Case 1 skills on the new schema.
- Primer: refresher framing — grouping as collision detection. Assume Case 1's concepts; teach
  only what is new about using aggregation to find duplicates.
- Incident briefing is the business complaint, not a SQL prompt, matching the Case 1 voice.
- Register the new Case and Mission in the case catalog
  (`apps/web/src/features/cases/case-catalog.ts`); Mission ID chosen once and kept stable.
