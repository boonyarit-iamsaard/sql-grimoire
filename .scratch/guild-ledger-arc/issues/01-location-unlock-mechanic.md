# 01 — Location-prerequisite unlock mechanic

Status: resolved

## Problem

`CampaignLocation.availability` is static (`"available" | "locked"`); no Location can unlock
in response to Player Progress. The Arc needs the Inner Archives to unlock when the Merchant
Guild is completed.

## Proposed shape

- Add an optional `prerequisiteLocationId` field to `CampaignLocation`
  (`apps/web/src/features/campaign/campaign-catalog.ts`).
- Derive the locked state in `getLocations`: a Location is locked when its static
  `availability` is `"locked"` with no prerequisite, when it offers no Missions, or when its
  prerequisite Location is not yet completed by the `isMissionCompleted` predicate already
  passed in.
- Validate in `validateCatalog`: a prerequisite must reference an existing Location, and
  prerequisite chains must not form a cycle.
- The `???` probe Location keeps static `availability: "locked"` with no prerequisite — it
  must never unlock during the Arc.
- Extend `campaign-catalog.test.ts`: unlocks on prerequisite completion, stays locked before,
  probe never unlocks, validation failures throw.

## Acceptance

Completing all Merchant Guild Missions flips the Inner Archives from locked to available on
the map without a page refresh; the probe Location remains locked after the full Arc is
completed.

## Answer

Implemented as proposed. `CampaignLocation` gains an optional `prerequisiteLocationId`; when
set, `getLocations` ignores static `availability` and derives the locked state from whether
every Mission of the prerequisite Location satisfies the `isMissionCompleted` predicate. A
Location with no Missions stays locked regardless, which keeps the `???` probe inert.
`validateCatalog` rejects unknown prerequisite references and cycles (including
self-reference). Covered by two new tests in `campaign-catalog.test.ts` (unlock before/after,
probe invariance, both validation failures); 11 tests, typecheck, and build pass. The Inner
Archives Location itself ships with mission two (issue 02), which is now unblocked.
