# 05 — Playtest protocol (round two)

Status: ready-for-human
Blocked by: Case 2 (`.scratch/cadence-studios-case/`, issues 01–07)

Rewritten 2026-07-19 for the second playtest. The original draft described live observed
sessions of the fantasy-era Guild Ledger Arc; round one was in fact run asynchronously, and the
fantasy framing is retired (`docs/adr/0001-business-incident-framing.md`). This version records
the protocol as actually practiced, updated for the business-incident Cases and the round-two
gate in `VISION.md` (2026-07-19 second note).

## Problem

The app has no telemetry, no feedback channel, and no analytics — by design (`VISION.md`
out-of-scope list). All evidence therefore comes from tester self-report in a follow-up
conversation, and the protocol must exist in writing **before** the first invitation goes out so
the verdict cannot be renegotiated afterward.

## Cohort

Four to six testers: QA engineers and engineers from other teams — people the founder knows
professionally but not closely. Hard requirements, all three per tester:

1. Cold to the product: has never seen or heard of the project.
2. Matches the target user: uses SQL regularly in their work but is not a database specialist.
   QA engineers who meet this bar count toward the verdict on equal terms.
3. No power or favor dynamic: nobody the founder manages, and nobody who owes the founder a
   favor.

## Session format

Asynchronous, as in round one: send the URL, let each tester play whenever they are free and
willing, then hold a follow-up conversation. No live observation, no intervention, no
explanations before the follow-up.

## Follow-up conversation

Phrase lookup questions so that honesty is cheap. Ask "what did you have to look up elsewhere,
and where?" as if lookups are expected — never "did you manage without help?", which invites a
polite no. Also ask, for each Case:

1. Where they got stuck, and what got them unstuck.
2. Whether they read the Primers before, during, or never.
3. What they did when they finished — and specifically whether they clicked the locked Case 3
   card (unobservable asynchronously, so it must be asked).
4. Whether anything made them want to stop.

A tester who messages the founder asking for more **before** the follow-up is the strongest form
of the demand signal; note it separately.

## Scoring rules (fixed in advance)

- Every reported external lookup is logged as a content defect against the specific Primer or
  Mission text that failed to carry it.
- A **conceptual** lookup (the idea the Primer exists to teach — for example, how LEFT JOIN
  works) fails the stayed-on-platform observable for that tester.
- A **syntax-trivia** lookup (for example, an exact date-format string) does not fail the
  observable, but is still logged.

## Pass rule (fixed in advance)

Both Cases are measured with identical observables and **scored separately**. A Case passes
when:

1. Every tester who attempts the Case finishes it (a tester who never starts is a recruiting
   non-event, not a failure).
2. At most one tester needed a conceptual lookup.
3. A majority ask what comes next — an unprompted request for more, or a reported click on the
   locked Case 3 card.

Verdict meanings: Case 1's verdict answers whether the business-incident-plus-Primer format
works for cold testers. Case 2's verdict answers whether the constraints-and-transactions
curriculum is calibrated. Voluntary entry into Case 2 after finishing Case 1 doubles as Case 1's
strongest demand signal. A Case 2 failure sends the founder back to tuning Case 2, not back to
doubting the format; a Case 1 failure means the format needs work regardless of Case 2's result.

## Acceptance

This protocol exists in its final form before the first invitation is sent; every follow-up
conversation's observations are appended to this file afterward.
