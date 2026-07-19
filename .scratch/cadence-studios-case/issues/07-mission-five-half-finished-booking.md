# 07 — Mission five: the half-finished booking

Status: ready-for-agent
Blocked by: 06

## Problem

The finale and the transactions payoff: the booking flow writes a booking row and then a
payment row, and a crash between the two writes left the ledger half-updated — corruption the
Mission three and four constraints cannot catch, because each row is individually valid. The
player wraps the two-step write in a transaction and proves atomicity. State-graded.

## Constraints

- The briefing presents the failing flow as a script fragment (the two INSERTs with the crash
  point told as story); the graded submission performs the repair and re-runs the flow
  atomically with `BEGIN`/`COMMIT` (and `ROLLBACK` in the rollback beat, per authoring).
- Single-session transactions only, per the curriculum ladder (rung 4 runs on sql.js);
  concurrency is explicitly out of scope and deferred with the spike.
- Probes: query Probes confirming booking and payment exist together (or neither — matching
  the reference outcome), and confirming no half-state remains. Whether a must-fail Probe can
  meaningfully exercise rollback is a design question for the implementer; do not force one if
  the story does not support it.
- Primer: atomicity as the guarantee; why "check then fix in application code" recreates the
  incident; the transaction as the unit the database promises.
- The Mission's explanation closes the Case's arc explicitly: found → measured →
  prevented-the-kind → prevented-the-orphan → prevented-the-cause.
