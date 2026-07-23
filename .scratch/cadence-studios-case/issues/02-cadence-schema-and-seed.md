# 02 — Cadence Studios schema and seed foundation

Status: ready-for-agent

## Problem

Case 2 needs a schema designed to be corruptible: double-booked slots must be possible, payment
rows must be able to orphan, and a two-step booking write must be able to half-fail. The
Harborline schema was built for querying, not for demonstrating missing guardrails.

## Proposed shape

- Small schema in the spirit of Case 1: rooms, customers, bookings (room, date, hour slot,
  customer), payments (booking, amount, paid_at). Deliberately absent: any UNIQUE on
  (room, date, slot); any FOREIGN KEY from payments to bookings.
- One canonical seed narrative shared by all five Missions, grown per Mission as Case 1's seeds
  were: several genuine double-bookings across different rooms and days (Mission one), enough
  affected customers and amounts to make the damage report interesting (Mission two), at least
  one orphaned payment left by a manual cleanup (Mission four), and one half-finished booking —
  a payment whose booking write never landed, or the reverse, matching the Mission five story.
- Per the mission-as-data seam, each Mission directory carries its own `schema.sql` and
  `seed.sql` copies under `apps/web/src/missions/<case>/<nn>-<slug>/`.
- sqlfluff-clean under the pinned SQLite dialect (`pnpm sql:check`).

## Acceptance

The schema and seed files exist for Mission one's directory and are documented well enough here
that Missions two through five can grow them without redesign.
