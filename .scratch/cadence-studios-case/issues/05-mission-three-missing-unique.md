# 05 — Mission three: why did the database allow this?

Status: ready-for-agent
Blocked by: 01, 04

## Problem

The first State-graded Mission and the Case's constraints turn: the player inspects the schema,
realizes nothing forbids two bookings on the same room and slot, and adds the missing UNIQUE
guardrail. First real use of the Probe engine (issue 01).

## Constraints

- Submission is a script; any correct form passes — a table-level composite UNIQUE constraint or a
  composite unique index, under any name — because grading is behavioral
  (`docs/adr/0002-behavioral-probe-grading.md`). The guardrail must cover the whole (room, date,
  slot) key: a column-level UNIQUE on any single column is not a correct answer, and the Probes
  reject it.
- Probes: a must-fail Probe inserting a duplicate (room, date, slot) booking, which a correct
  guardrail must refuse; and a query Probe confirming the existing legitimate bookings survived
  the player's script unharmed.
- The seed for this Mission starts from a cleaned ledger (the collisions resolved off-stage
  between Missions — the briefing says so) so the UNIQUE constraint can actually be added;
  teaching that a constraint cannot be added over violating data is part of the story, and may
  surface as a hint if the player attempts it against dirty data instead.
- Primer: what constraints are, why UNIQUE is a database-level guarantee rather than an
  application check, and SQLite's ways of declaring one. The constraint-violation error message
  is part of the pedagogy — never suppressed.
