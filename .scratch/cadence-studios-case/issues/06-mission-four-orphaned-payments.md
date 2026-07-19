# 06 — Mission four: the cleanup that made it worse

Status: ready-for-agent
Blocked by: 05

## Problem

A manual fix during the incident deleted a double-booked booking but left its payment row
behind. The player discovers the orphan — absence reasoning, echoing Case 1's finale — and adds
the FOREIGN KEY that would have refused the careless delete. State-graded.

## Constraints

- Two-beat Mission: the investigation (finding payments whose booking no longer exists — LEFT
  JOIN or NOT EXISTS) motivates the fix; the graded submission is the script that repairs the
  orphan and adds the FOREIGN KEY. Whether the investigation beat is a separate ungraded step
  or folded into the briefing is an authoring call.
- SQLite specifics are part of the lesson: foreign key enforcement requires
  `PRAGMA foreign_keys = ON`, and adding a FOREIGN KEY to an existing table requires the
  table-rebuild pattern. Decide at authoring time how much of that the Primer carries versus
  how much the runtime pre-arranges (for example, the runtime always enabling the pragma);
  keep whichever choice consistent with the Probe design.
- Probes: a must-fail Probe inserting a payment for a nonexistent booking; a query Probe
  confirming no orphaned payments remain; a query Probe confirming legitimate payments
  survived.
- Primer: referential integrity as a guarantee; why the orphan is the application's fault only
  until the schema makes it impossible.
