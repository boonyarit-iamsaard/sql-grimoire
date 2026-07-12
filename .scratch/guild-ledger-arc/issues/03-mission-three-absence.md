# 03 — Mission three: absence incident

Status: ready-for-human
Blocked by: 02

## Problem

The Arc's finale: an incident whose answer is about what is **not** in the ledger — orders
with no shipment row at all — requiring `LEFT JOIN` and `NULL` reasoning. This is the first
genuinely counterintuitive step and the difficulty peak of the Arc, placed directly before
the locked `???` probe Location.

## Constraints from the spec

- Second Mission of the Inner Archives Location (blocked by issue 02 for story and ramp
  continuity).
- Same guild-ledger schema; the seed grows more shipment gaps (mission one's seed already
  contains two orders without shipments — orders 104 and 109 — as the germ of this incident).
- SELECT-graded; the reference query uses `LEFT JOIN` with an `IS NULL` filter (or an
  equivalent the founder prefers pedagogically — `NOT EXISTS` may appear in hints as a
  contrast, but grading is result-based so either solves it).
- Directory-per-mission layout as in issue 02.
- The success screen of this Mission is the Arc's end: its reward text should land the story
  and point the player at the still-locked `???` Location — the unmet-demand probe.

## Creative work (founder plus agent, together)

Same elements as issue 02, plus the Arc-closing beat.

## Acceptance

The Mission is solvable by a playtester who finished missions one and two with at most the
hints; an INNER JOIN attempt visibly returns the wrong (empty or incomplete) result rather
than an error, because that contrast is the lesson; `pnpm sql:check`, tests, and build pass.
