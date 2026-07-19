# State-graded Missions are verified by behavioral Probes, not schema introspection

Case 2 ("The Double Booking" at Cadence Studios) introduces Missions whose answer is a schema
change or a transactional fix rather than a SELECT — the first expansion of the grading contract
since it shipped. We grade these by replaying the player's submitted script on a fresh database
and then running authored Probes: each Probe is either a query whose canonicalized result must
match the same Probe run after the reference script (reusing the existing evaluator unchanged),
or a statement annotated must-fail that passes only when the engine raises an error (for
example, a duplicate INSERT that a correct UNIQUE constraint must refuse).

## Considered options

- **Schema introspection** (querying `sqlite_master` or PRAGMA output for the expected
  constraint): rejected because it is text-shape grading in disguise. A UNIQUE constraint can be
  declared as a table constraint, a column constraint, or a unique index, under any name; an
  introspection probe fails correct answers. Behavioral Probes extend the existing principle —
  grading compares results, never SQL text — to database state.
- **Grading the player's script text**: rejected for the same principle, already recorded for
  result-graded Missions in `apps/web/src/sql/evaluator.ts`.

## Consequences

- State-graded Missions accept multi-statement scripts; result-graded Missions keep the
  single-query submission.
- Reset isolation is preserved: grading always replays the script on a fresh database, so
  exploratory workbench state can never leak into a verdict.
- Must-fail Probes make expected errors part of the contract, consistent with the existing rule
  that SQLite's error messages are part of the pedagogy.
