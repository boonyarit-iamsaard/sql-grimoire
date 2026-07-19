# Business-incident framing replaces the fantasy-RPG skin

The first external playtest (2026-07-19, three developer friends) passed the validation gate in
VISION.md: all three finished the Guild Ledger Arc unassisted, clicked the locked Location, asked
what comes next, and said the SQL problems helped them reason about real business questions. Their
criticism targeted the packaging, not the loop: the fantasy story competed with the SQL story and
was skipped on first contact, and one tester had to leave the platform to learn a concept a
Mission required.

We therefore reframe Missions as realistic production incidents at fictional companies and retire
the fantasy layer: guild characters, dialogue, portraits, fantasy titles, and the campaign map.
The narrative that remains is the business problem itself, so there is only one story. The
structural container becomes the Case (one fictional company, one schema, Missions unlocking in
order), replacing both Arc and Location; the entry screen becomes a dashboard of Cases with
visible progress. Each Mission gains a Primer, a short authored lesson beside the workbench, so
learners never leave the platform for foundations.

## Considered options

- Keep the fantasy world but make dialogue skippable: rejected because it leaves two competing
  stories in place, which was the core objection.
- Strip narrative entirely into a lesson-and-exercise platform: rejected because testers
  simultaneously praised the incident scenarios, and rigorous incident content is the stated moat.
- Monetize with paid avatar cosmetics as the testers suggested: rejected; when monetization
  arrives it sells Cases (content), because content is the moat and cosmetics are trivially
  copyable. Payments and accounts remain out of scope per the sequencing discipline.

## Consequences

- The product name and the Grimoire survive as the single remaining metaphor: the grimoire is the
  learner's notebook of solved incidents. Characters and lore do not return.
- Scope of the change is a reskin, not a rebuild: the three existing Missions already share one
  schema and become Case 1 with new titles, briefings, and Primers. Grading, evaluator, SQL
  runtime, and the progress store are untouched.
- The next playtest gate: testers who are not the founder's friends finish Case 1 without leaving
  the platform for knowledge, and still ask what comes next.
