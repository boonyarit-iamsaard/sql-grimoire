# SQL Grimoire

SQL Grimoire frames database-reasoning exercises as realistic business incidents, grouped into
Cases that a learner works through in order.

## Language

**Mission**:
A realistic database incident with its own objective, grading rules, guidance, reward, and
explanation, solved against its Case's schema.
_Avoid_: Challenge, exercise, level, quest

**Case**:
One business problem: a fictional company or system, one schema, and an ordered set of Missions
that unlock one by one. A Mission is the unit of play; a Case is the unit of progression.
_Replaces_: Arc, Location (the fantasy campaign map is retired)
_Avoid_: Campaign, chapter, arc, course, level pack

**Primer**:
The short authored lesson attached to a Mission that teaches the concept the Mission requires,
with examples runnable against the Case's schema. Read before or during the attempt; optional for
learners who already know the concept.
_Avoid_: Lesson, tutorial, theory section

**Mission Attempt**:
A player's transient investigation of one Mission, including their current query, results, hints,
and verdict. Only the current Mission and last query are durable across refreshes.
_Avoid_: Session, run, workbench state

**Player Progress**:
The durable record of a player's current Mission, earned XP, completed Missions, last queries, and
Grimoire entries. It is the authority for applying a Mission completion exactly once.
_Avoid_: Save state, profile

**State-graded Mission**:
A Mission graded by the database state the player's submitted script leaves behind, verified by
Probes, rather than by comparing one query's result set. Its submission is a script of one or
more statements. Missions that are not state-graded are result-graded.
_Avoid_: DDL mission, write mission

**Probe**:
One authored grading step for a State-graded Mission, run after the player's script replays on a
fresh database. A Probe is either a query whose result must match the same Probe run after the
reference script, or a statement that must fail. Probes judge what the database does, never the
text or shape of the player's SQL.
_Avoid_: Assertion, check, test case

**Grimoire Entry**:
The durable learning record produced by a completed Mission, containing the player's query, the
reference query, concepts, and explanation.
_Avoid_: Journal entry, completion record
