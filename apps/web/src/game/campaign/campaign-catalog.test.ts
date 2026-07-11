import { describe, expect, it } from "vitest";
import {
  CampaignCatalog,
  type CampaignLocation,
  campaignCatalog,
} from "./campaign-catalog";

describe("Campaign catalog", () => {
  it("resolves Missions while retaining Locations that have no Mission yet", () => {
    expect(campaignCatalog.getMission("missing-shipment")?.title).toBe(
      "The Missing Shipment",
    );
    expect(campaignCatalog.getMission("unknown")).toBeUndefined();

    const locations = campaignCatalog.getLocations();
    expect(
      locations.map(({ id, missionIds, availability, state }) => ({
        id,
        missionIds,
        availability,
        state,
      })),
    ).toEqual([
      {
        id: "merchant-guild",
        missionIds: ["missing-shipment"],
        availability: "available",
        state: "available",
      },
      {
        id: "future-location",
        missionIds: [],
        availability: "locked",
        state: "locked",
      },
    ]);

    expect(
      campaignCatalog.getLocations(
        (missionId) => missionId === "missing-shipment",
      )[0].state,
    ).toBe("completed");
  });

  it("adds a second Mission as catalog data and selects its Location path", () => {
    const firstMission = campaignCatalog.getMission("missing-shipment");
    if (!firstMission) {
      throw new Error("Expected fixture Mission");
    }
    const secondMission = {
      ...firstMission,
      id: "second-mission",
      title: "Second Mission",
    };
    const location: CampaignLocation = {
      id: "merchant-guild",
      name: "Merchant Guild",
      mapImage: "merchant.svg",
      position: { left: "0", top: "0" },
      missionIds: [firstMission.id, secondMission.id],
      availability: "available",
    };
    const catalog = new CampaignCatalog(
      [firstMission, secondMission],
      [location],
    );

    expect(catalog.getMission("second-mission")?.title).toBe("Second Mission");
    expect(
      catalog.getLocations((id) => id === firstMission.id)[0],
    ).toMatchObject({ state: "available", nextMissionId: "second-mission" });
    expect(catalog.getLocations(() => true)[0]).toMatchObject({
      state: "completed",
      nextMissionId: "missing-shipment",
    });
  });

  it("rejects duplicate and dangling catalog definitions", () => {
    const mission = campaignCatalog.getMission("missing-shipment");
    if (!mission) {
      throw new Error("Expected fixture Mission");
    }
    const location: CampaignLocation = {
      id: mission.locationId,
      name: "Merchant Guild",
      mapImage: "merchant.svg",
      position: { left: "0", top: "0" },
      missionIds: [mission.id],
      availability: "available",
    };

    expect(() => new CampaignCatalog([mission, mission], [location])).toThrow(
      "Mission IDs must be unique",
    );
    expect(
      () =>
        new CampaignCatalog(
          [mission],
          [{ ...location, missionIds: [mission.id, "unknown-mission"] }],
        ),
    ).toThrow("references unknown Mission unknown-mission");
  });
});
