# The Guild Ledger Arc

Status: ready-for-agent

## Goal

Extend the prototype from one Mission to a three-Mission Arc, deploy it, and playtest it with
two or three working developers. This is the amended validation gate recorded in `VISION.md`
(amendment dated 2026-07-12): the question is **do playtesters finish the Arc wanting more?**

## Decisions of record

These were settled in a grilling session on 2026-07-12:

1. **Arc scope: three Missions total.** The existing "The Missing Shipment" plus two new
   Missions. Three is the minimum that demonstrates progression (two difficulty steps, one
   story with a middle) while fitting a single 30–45 minute playtest sitting.
2. **Curriculum: aggregation, then absence.** Mission two teaches `GROUP BY`/`HAVING`;
   mission three teaches `LEFT JOIN`/`NULL` reasoning (finding what is not there). Both are
   SELECT-graded, so the evaluator, Mission type, and SQL runtime are untouched. Constraints
   and transactions stay gated behind the playtest verdict.
3. **Map shape: Guild unlocks Archives.** Merchant Guild keeps mission one. A new Inner
   Archives Location holds missions two and three and unlocks when the Merchant Guild is
   completed. This requires the one engine addition of the Arc: a Location-prerequisite
   unlock mechanic. The `???` Location stays locked at the end of the Arc as the
   unmet-demand probe. Mission one's reward text ("the doorkeeper waves you through to the
   inner archives") is the narrative transition.
4. **Data: one schema, richer seeds.** All three Missions use the guild-ledger schema
   (customers, orders, shipments). Each Mission's seed data grows to serve its question. The
   schema gains a table only if the archives story demands one.
5. **Deploy, then playtest.** Static hosting (Cloudflare Pages is the standing
   recommendation; final call deferred to issue 04). The playtest protocol, including
   pass/fail criteria, is written down before the first session (issue 05). No telemetry,
   feedback forms, accounts, or backend — observation is live, per `VISION.md`.

## Build order

Issues are numbered in dependency order: unlock mechanic → mission two → mission three →
deploy → playtest protocol.

## Out of scope

Everything in the `VISION.md` out-of-scope list, plus: constraints and transactions missions,
a JSON mission serialization format, telemetry of any kind, and new Location art beyond the
Inner Archives.
