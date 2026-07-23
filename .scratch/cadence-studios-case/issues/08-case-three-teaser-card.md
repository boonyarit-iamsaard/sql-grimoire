# 08 — Locked Case 3 teaser card

Status: ready-for-agent
Blocked by: 07

## Problem

The unmet-demand probe currently lives on the locked coming-soon Case that Case 2 will replace.
Once Case 2 is real content, the Casebook needs a new locked card at the end, because the
second-playtest pass rule counts reported clicks on it as a demand signal
(`.scratch/guild-ledger-arc/issues/05-playtest-protocol.md`).

## Constraints

- One catalog entry: a fictional company name and a one-line performance-incident hook ("the
  query that got slow" territory — indexing and query plans). Mechanics deliberately unnamed on
  the card: the two-session concurrency workbench is deferred, and the card must not promise
  what the engine cannot yet keep. PGlite behind the `SqlRuntime` interface is the
  known-feasible path if Case 3 proceeds.
- Locked state and click behavior reuse whatever the current coming-soon Case does; no new
  mechanics.
- No Case 3 content beyond the card.
