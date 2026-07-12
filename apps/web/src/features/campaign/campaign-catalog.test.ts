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
        id: "inner-archives",
        missionIds: ["council-tally"],
        availability: "locked",
        state: "locked",
      },
      {
        id: "future-location",
        missionIds: [],
        availability: "locked",
        state: "locked",
      },
    ]);

    const afterFirstMission = campaignCatalog.getLocations(
      (missionId) => missionId === "missing-shipment",
    );
    expect(afterFirstMission[0].state).toBe("completed");
    expect(afterFirstMission[1].state).toBe("available");
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

  it("unlocks a Location when its prerequisite Location is completed", () => {
    const firstMission = campaignCatalog.getMission("missing-shipment");
    if (!firstMission) {
      throw new Error("Expected fixture Mission");
    }
    const archiveMission = {
      ...firstMission,
      id: "archive-mission",
      locationId: "inner-archives",
    };
    const guild: CampaignLocation = {
      id: "merchant-guild",
      name: "Merchant Guild",
      mapImage: "merchant.svg",
      position: { left: "0", top: "0" },
      missionIds: [firstMission.id],
      availability: "available",
    };
    const archives: CampaignLocation = {
      id: "inner-archives",
      name: "Inner Archives",
      mapImage: "archives.svg",
      position: { left: "0", top: "0" },
      missionIds: [archiveMission.id],
      availability: "locked",
      prerequisiteLocationId: "merchant-guild",
    };
    const probe: CampaignLocation = {
      id: "future-location",
      name: "???",
      mapImage: "locked.svg",
      position: { left: "0", top: "0" },
      missionIds: [],
      availability: "locked",
    };
    const catalog = new CampaignCatalog(
      [firstMission, archiveMission],
      [guild, archives, probe],
    );

    const before = catalog.getLocations();
    expect(before.map(({ id, state }) => ({ id, state }))).toEqual([
      { id: "merchant-guild", state: "available" },
      { id: "inner-archives", state: "locked" },
      { id: "future-location", state: "locked" },
    ]);
    expect(before[1].nextMissionId).toBeNull();

    const after = catalog.getLocations((id) => id === firstMission.id);
    expect(after.map(({ id, state }) => ({ id, state }))).toEqual([
      { id: "merchant-guild", state: "completed" },
      { id: "inner-archives", state: "available" },
      { id: "future-location", state: "locked" },
    ]);
    expect(after[1].nextMissionId).toBe("archive-mission");

    const arcComplete = catalog.getLocations(() => true);
    expect(arcComplete.map(({ id, state }) => ({ id, state }))).toEqual([
      { id: "merchant-guild", state: "completed" },
      { id: "inner-archives", state: "completed" },
      { id: "future-location", state: "locked" },
    ]);
  });

  it("rejects unknown and cyclic Location prerequisites", () => {
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

    expect(
      () =>
        new CampaignCatalog(
          [mission],
          [{ ...location, prerequisiteLocationId: "nowhere" }],
        ),
    ).toThrow("prerequisite references unknown Location nowhere");
    expect(
      () =>
        new CampaignCatalog(
          [mission],
          [{ ...location, prerequisiteLocationId: location.id }],
        ),
    ).toThrow("must not form a cycle");
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
