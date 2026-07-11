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

## Where the prototype fits

The one-mission prototype in this repo is step one: it validates the _format_ — embedded
database, result-graded challenges, narrative wrapper, all in-browser. The open question it
exists to answer: **do playtesters finish mission one wanting mission two?**

## Curriculum ladder → engine requirements

| Rung | Topics                               | Runs on                                                                                                                            |
| ---- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1–3  | querying, schema design, constraints | sql.js (current engine), as-is                                                                                                     |
| 4    | transactions                         | sql.js, single-session missions                                                                                                    |
| 5    | concurrency                          | needs a new workbench mode: two interleaved sessions (deadlocks, lost updates) — the feature no competitor has; prototype it early |
| 6–7  | indexing, query plans                | needs a real planner + row volume: PGlite (Postgres-in-wasm) behind the existing `SqlRuntime` interface                            |
| 8    | migrations                           | long-running/locking semantics; PGlite                                                                                             |
| 9    | ORM behavior                         | "trace viewer" workbench panel showing generated SQL                                                                               |

## Sequencing discipline

Validation stacked on validation — don't front-run answers:

1. Playtest mission one (2–3 working developers; watch, don't explain).
2. If yes: missions 2–5 spanning one arc (querying → constraints → transactions).
3. Put a price on it for individuals.
4. Only then: teams/bootcamps (B2B is likely the revenue, but buyers will ask "show me the
   curriculum" — content depth precedes sales motion).
5. Platform infrastructure (accounts, payments, dashboards) last, once a slice has earned it.

Content is both the cost and the moat: every mission needs a scenario, realistic dataset,
grading, hints, and a technically rigorous explanation. The mechanic is copyable; fifty
rigorous incident scenarios are not.
