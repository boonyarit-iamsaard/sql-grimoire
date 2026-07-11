import { describe, expect, it } from "vitest";
import { getCampaignLocations, getMission } from "./campaign-catalog";

describe("Campaign catalog", () => {
  it("resolves Missions while retaining Locations that have no Mission yet", () => {
    expect(getMission("missing-shipment")?.title).toBe("The Missing Shipment");
    expect(getMission("unknown")).toBeUndefined();

    const locations = getCampaignLocations();
    expect(
      locations.map(({ id, missionId, availability, state }) => ({
        id,
        missionId,
        availability,
        state,
      })),
    ).toEqual([
      {
        id: "merchant-guild",
        missionId: "missing-shipment",
        availability: "available",
        state: "available",
      },
      {
        id: "future-location",
        missionId: null,
        availability: "locked",
        state: "locked",
      },
    ]);

    expect(
      getCampaignLocations((missionId) => missionId === "missing-shipment")[0]
        .state,
    ).toBe("completed");
  });
});
