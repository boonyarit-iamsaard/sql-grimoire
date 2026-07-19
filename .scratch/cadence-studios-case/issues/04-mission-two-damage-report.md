# 04 — Mission two: measure the damage

Status: ready-for-agent
Blocked by: 03

## Problem

Management needs the incident report: which customers were affected by the double-bookings, and
what is the refund exposure? Joins plus aggregation over the collision set from Mission one.
Result-graded; still no dependency on the Probe engine.

## Constraints

- Reference solution joins bookings and payments through the collision condition and aggregates
  refund amounts per customer (exact framing at authoring time; the founder tunes the business
  question).
- Primer: joining an aggregate back to detail rows — the one conceptual step above Mission one.
- Seed must make the numbers meaningful: multiple affected customers with distinct exposure
  amounts, and at least one red herring (a same-room adjacent slot that is not a collision).
