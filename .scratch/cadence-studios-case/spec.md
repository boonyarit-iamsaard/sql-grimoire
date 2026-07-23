# Case 2 — The Double Booking (Cadence Studios)

Status: ready-for-agent

## Goal

Build the second Case — a constraints-and-transactions curriculum at a new fictional company —
before the second playtest, then run that playtest against both Cases. This is the amended plan
of record in `VISION.md` (second note dated 2026-07-19): the product stays free for now, the
concurrency spike is deferred with monetization, and content ships ahead of the next validation
gate, repeating the round-one call.

## The incident

Cadence Studios rents rehearsal rooms by the hour. Customers are complaining that the studio
keeps selling the same room and time slot twice. The Case rides one incident from discovery to
root-cause prevention: find the collisions, quantify the damage, discover that nothing in the
schema forbids them, add the missing guardrails, and finally fix the booking flow whose
half-failed writes no constraint can catch.

## Decisions of record

Settled in a grilling session on 2026-07-19:

1. **Scope: constraints and transactions in one Case**, per the sequencing plan. Roughly rungs
   3–4 of the curriculum ladder, on sql.js unmodified.
2. **New fictional company.** Cases are self-contained; the schema is designed to be
   corruptible, which the Harborline ledger was not.
3. **Five-Mission ramp**, mirroring Case 1's shape (investigate, quantify, counterintuitive
   peak): collisions → damage → missing UNIQUE → orphaned payments and the missing FOREIGN
   KEY → the half-finished booking fixed with a transaction. Missions 1–2 are result-graded
   with existing machinery; Missions 3–5 are State-graded.
4. **Grading extension: behavioral Probes** (`docs/adr/0002-behavioral-probe-grading.md`).
   State-graded Missions accept multi-statement scripts, replayed on a fresh database, then
   verified by Probes — result-matching queries or must-fail statements. Never schema
   introspection. Glossary terms Probe and State-graded Mission are in `CONTEXT.md`.
5. **The demand probe moves.** A locked Case 3 card on the Casebook teases a performance
   incident (indexing and query plans, a known-feasible PGlite path) with mechanics unnamed —
   no promise the engine cannot yet keep.
6. **Both Cases are measured in the second playtest, scored separately.** Protocol and pass
   rules: `.scratch/guild-ledger-arc/issues/05-playtest-protocol.md`.

## Build order

Issues are numbered in dependency order: probe grading engine → schema and seed foundation →
missions one through five → Case 3 teaser card. Missions 1–2 can proceed in parallel with the
grading engine; Missions 3–5 depend on it.

## Out of scope

Everything in the `VISION.md` out-of-scope list, plus: pricing and monetization work, the
two-session concurrency workbench spike, PGlite, and any Case 3 content beyond the locked
teaser card.
