# 01 — Behavioral Probe grading for State-graded Missions

Status: ready-for-agent

## Problem

The evaluator (`apps/web/src/sql/evaluator.ts`) grades by comparing one SELECT's result set
against a reference query. Case 2's Missions three through five are answered with schema changes
and transactional fixes, which that contract cannot grade. Decision of record:
`docs/adr/0002-behavioral-probe-grading.md`.

## Proposed shape

- Extend the Mission contract with an optional State-graded variant: the submission is a script
  of one or more statements, and grading is defined by an ordered list of Probes instead of
  `expectedColumns` plus `referenceQuery`.
- A Probe is either a query Probe (a SELECT whose canonicalized result, after the player's
  script, must equal the same Probe run after the reference script — reuse the evaluator's
  canonicalization unchanged) or a must-fail Probe (a statement that passes only when SQLite
  raises an error).
- Reset isolation is preserved: grading replays the player's script on a fresh database inside
  the existing Mission Attempt sequencing (`mission-attempt.ts`), exactly as result grading
  already isolates itself from workbench exploration.
- Result-graded Missions are untouched; the three shipped Missions must not change shape.
- Do not disable Run or Submit on client-side validity, per the existing rule; a script whose
  statements error is graded by its Probes like any other submission.

## Acceptance

- Unit tests cover: a correct script passing all Probes; a wrong-but-valid script failing a
  query Probe; a must-fail Probe passing on constraint violation and failing when the statement
  succeeds; and grading isolation from prior workbench state.
- A demonstration Mission fixture (not shipped) exercises both Probe kinds end to end.
