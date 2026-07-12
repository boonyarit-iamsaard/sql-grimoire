# SQL Grimoire — Vision

_Recorded 2026-07-11, verbatim from the founder:_

> My ambitious goal is to build a web-based RPG learning platform that helps working developers
> move from merely using SQL to truly mastering database reasoning. Instead of teaching syntax
> through isolated exercises, the platform would place learners in a persistent narrative world
> where they solve realistic business and production incidents involving querying, schema design,
> constraints, transactions, concurrency, indexing, query plans, migrations, and ORM behavior.
> The experience should combine structured progression, meaningful game mechanics, strong
> technical explanations, and increasingly complex scenarios, eventually becoming a commercially
> viable product for individual developers, engineering teams, bootcamps, and companies that
> want practical database training grounded in real-world systems.

_Note (2026-07-12): the market focus has narrowed since this was recorded. The plan of record
targets individual developers; team, bootcamp, and company sales are a possible later expansion.
See "Sequencing discipline."_

## Where the prototype fits

The one-mission prototype in this repository is the first step: an embedded database,
result-graded challenges, and a narrative wrapper, all delivered in the browser. The prototype is
complete but unvalidated — playtesting has not yet started, and the founder is so far the only
player. It exists to answer the following question: **do playtesters finish mission one wanting
mission two?**

## Relationship between curriculum and engine requirements

| Rung | Topics                               | Runs on                                                                                                                        |
| ---- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 1–3  | querying, schema design, constraints | sql.js (current engine), without modification                                                                                  |
| 4    | transactions                         | sql.js, single-session missions                                                                                                |
| 5    | concurrency                          | requires a new workbench mode with two interleaved sessions for deadlocks and lost updates; see the spike plan below the table |
| 6–7  | indexing, query plans                | needs a real planner and row volume: PGlite (Postgres-in-wasm) behind the existing `SqlRuntime` interface                      |
| 8    | migrations                           | long-running/locking semantics; PGlite                                                                                         |
| 9    | ORM behavior                         | "trace viewer" workbench panel showing generated SQL                                                                           |

The two-session concurrency workbench is the differentiator, and it carries real feasibility
risk: embedded engines are effectively single-connection, so interleaving two sessions may
require a simulated lock scheduler. Prototype it as a timeboxed, throwaway technical spike during
the missions-two-through-five arc, before pricing depends on the claim.

## Sequencing discipline

Each stage must validate the assumptions required by the next stage:

1. Playtest mission one with two or three working developers. Observe without providing explanations.
2. If the result is positive, create missions two through five as one narrative arc covering querying,
   constraints, and transactions.

3. Establish pricing for individual customers.
4. The plan of record remains a product for individual developers. Team, bootcamp, and company
   sales are a possible later expansion, considered only if individual traction proves out;
   content depth must precede any such sales because business buyers will require evidence of a
   substantial curriculum.
5. Add platform infrastructure, including accounts, payments, and dashboards, only after a
   validated product slice demonstrates the need.

_Amendment (2026-07-12): steps 1 and 2 are partially reordered. Two facts changed after this
plan was recorded. First, mission production was repriced: the entire prototype, engine included,
took one day, so a mission costs hours rather than weeks, and the gate's insurance no longer
justifies its delay. Second, the founder's own first play produced the "one mission, that's it?"
reaction — the success signal firing on player zero. The playtest gate therefore moves from one
mission to a three-mission Arc ("The Guild Ledger Arc"): mission two teaches aggregation, mission
three teaches absence (LEFT JOIN and NULL reasoning), both SELECT-graded so the engine and
evaluator are untouched. The validation question becomes: **do playtesters finish the Arc wanting
more?** The still-locked map location remains the unmet-demand probe. Constraints and transactions
stay gated behind the playtest verdict, as does all platform infrastructure; the out-of-scope list
below is unchanged. Plan of record: `.scratch/guild-ledger-arc/spec.md`._

Until validation demands them, the following remain out of scope: authentication, payments, a
backend API, a cloud database, a game engine, AI-generated hints, user-generated missions, and a
mobile application.

Content is both the primary cost and the competitive advantage: every mission needs a scenario, realistic dataset,
grading, hints, and a technically rigorous explanation. Competitors can reproduce the game
mechanic, but reproducing fifty rigorous incident scenarios requires substantial effort. Once the
format is validated, mission-authoring efficiency becomes the operational bottleneck: the rate at
which rigorous missions can be produced determines how quickly the moat deepens.
