# 01 — Add Harborline Mission content tests

Status: completed

## What to build

Add focused content coverage for all three Harborline Missions. Each test should execute the
Mission's authored reference query against its own schema and seed, then compare the resulting
columns and rows with an independent worked example.

Keep the tests at the authored Mission data seam. Harborline Missions are result-graded, so they do
not need State-grading or Probe sequencing through a Mission Attempt. Do not alter Mission content
unless a test exposes a genuine defect.

## Acceptance criteria

- [x] Each Harborline Mission's reference query executes successfully against its own schema and
      seed.
- [x] Each test asserts exact result columns and independently authored literal rows.
- [x] Assertions do not depend on result row order.
- [x] Existing formatting, SQL lint, typechecking, build, and test checks pass.

## Blocked by

None - can start immediately.
