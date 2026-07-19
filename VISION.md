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

_Note (2026-07-19): the first playtest (three developers) passed the validation gate — all
finished unassisted, clicked the locked content, and asked what comes next — while rejecting the
fantasy-RPG packaging. The persistent narrative world is retired in favor of realistic business
incidents grouped into Cases, with a Primer lesson beside each Mission's workbench. The "RPG"
in the original vision now means structured progression and earned rewards, not story dialogue.
See `docs/adr/0001-business-incident-framing.md`._

## Where the prototype fits

The three-Mission Case in this repository ("The Vanishing Orders" at the fictional Harborline
Trading Co., reframed from the original Guild Ledger Arc) is the first validation slice: an
embedded database, result-graded challenges, structured progression, and per-Mission Primer
lessons, all delivered in the browser. It teaches joins, aggregation, and absence reasoning.
The first playtest answered the original question — playtesters finished the Arc wanting
more — and reshaped the packaging (see the 2026-07-19 note above). The next question:
**do testers outside the founder's circle finish the Case without leaving the platform for
knowledge, and still ask what comes next?**

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

1. Playtest the Guild Ledger Arc with two or three working developers. Observe without providing
   explanations; hints are allowed, but intervention is not.
2. Use completion behavior and the reaction to the locked final Location to decide whether the
   incident-driven RPG format merits further curriculum investment.
3. If the result is positive, build the next Arc around constraints and transactions, then
   establish pricing for individual customers.
4. Keep individual developers as the plan-of-record market. Consider team, bootcamp, and company
   sales only if individual traction proves out and the curriculum has enough depth to support
   those buyers.
5. Add platform infrastructure, including accounts, payments, and dashboards, only after a
   validated product slice demonstrates the need.

This sequence amends the original one-Mission gate. Mission production proved inexpensive enough
to justify building a complete three-Mission progression before external testing, and the
founder's first play produced the desired demand for another Mission. Missions two and three remain
SELECT-graded, so they add curriculum without expanding the evaluator or SQL runtime. The
still-locked map Location is the unmet-demand probe. Plan of record:
`.scratch/guild-ledger-arc/spec.md`.

Until validation demands them, the following remain out of scope: authentication, payments, a
backend API, a cloud database, a game engine, AI-generated hints, user-generated missions, and a
mobile application.

Content is both the primary cost and the competitive advantage: every mission needs a scenario, realistic dataset,
grading, hints, and a technically rigorous explanation. Competitors can reproduce the game
mechanic, but reproducing fifty rigorous incident scenarios requires substantial effort. Once the
format is validated, mission-authoring efficiency becomes the operational bottleneck: the rate at
which rigorous missions can be produced determines how quickly the moat deepens.
