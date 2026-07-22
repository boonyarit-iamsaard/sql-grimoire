import { describe, expect, it } from "vitest";
import { type Case, CaseCatalog, caseCatalog } from "./case-catalog";

describe("Case catalog", () => {
  it("resolves Missions and locks Cadence until Harborline is complete", () => {
    expect(caseCatalog.getMission("missing-shipment")?.title).toBe(
      "Delayed Orders Piling Up",
    );
    expect(caseCatalog.getMission("double-booked-slots")).toMatchObject({
      title: "The Same Room, Twice",
      caseId: "cadence",
    });
    expect(caseCatalog.getMission("unknown")).toBeUndefined();

    const cases = caseCatalog.getCases();
    expect(
      cases.map(({ id, state, completedCount, nextMissionId }) => ({
        id,
        state,
        completedCount,
        nextMissionId,
      })),
    ).toEqual([
      {
        id: "harborline",
        state: "available",
        completedCount: 0,
        nextMissionId: "missing-shipment",
      },
      {
        id: "cadence",
        state: "locked",
        completedCount: 0,
        nextMissionId: null,
      },
    ]);

    const afterHarborline = caseCatalog.getCases(
      (missionId) => missionId !== "double-booked-slots",
    );
    expect(afterHarborline[1]).toMatchObject({
      id: "cadence",
      state: "available",
      nextMissionId: "double-booked-slots",
    });
  });

  it("unlocks Missions one by one within a Case", () => {
    const fresh = caseCatalog.getCases()[0];
    expect(fresh.missions.map(({ state }) => state)).toEqual([
      "next",
      "locked",
      "locked",
    ]);

    const afterFirst = caseCatalog.getCases(
      (missionId) => missionId === "missing-shipment",
    )[0];
    expect(afterFirst.missions.map(({ state }) => state)).toEqual([
      "completed",
      "next",
      "locked",
    ]);
    expect(afterFirst.nextMissionId).toBe("council-tally");

    const finished = caseCatalog.getCases(() => true)[0];
    expect(finished.state).toBe("completed");
    expect(finished.missions.every(({ state }) => state === "completed")).toBe(
      true,
    );
    expect(finished.nextMissionId).toBe("missing-shipment");
  });

  it("locks a later Case until the previous Case is completed", () => {
    const firstMission = caseCatalog.getMission("missing-shipment");
    if (!firstMission) {
      throw new Error("Expected fixture Mission");
    }
    const secondMission = {
      ...firstMission,
      id: "second-mission",
      caseId: "second-case",
    };
    const first: Case = {
      id: "harborline",
      name: "First",
      company: "Co",
      summary: "",
      missionIds: [firstMission.id],
    };
    const second: Case = {
      id: "second-case",
      name: "Second",
      company: "Co",
      summary: "",
      missionIds: [secondMission.id],
    };
    const catalog = new CaseCatalog(
      [firstMission, secondMission],
      [first, second],
    );

    expect(catalog.getCases().map(({ state }) => state)).toEqual([
      "available",
      "locked",
    ]);
    expect(
      catalog
        .getCases((id) => id === firstMission.id)
        .map(({ state }) => state),
    ).toEqual(["completed", "available"]);
    expect(catalog.getCases(() => true).map(({ state }) => state)).toEqual([
      "completed",
      "completed",
    ]);
  });

  it("rejects duplicate and dangling catalog definitions", () => {
    const mission = caseCatalog.getMission("missing-shipment");
    if (!mission) {
      throw new Error("Expected fixture Mission");
    }
    const caseDefinition: Case = {
      id: mission.caseId,
      name: "The Vanishing Orders",
      company: "Harborline Trading Co.",
      summary: "",
      missionIds: [mission.id],
    };

    expect(() => new CaseCatalog([mission, mission], [caseDefinition])).toThrow(
      "Mission IDs must be unique",
    );
    expect(
      () =>
        new CaseCatalog(
          [mission],
          [{ ...caseDefinition, missionIds: [mission.id, "unknown-mission"] }],
        ),
    ).toThrow("references unknown Mission unknown-mission");
    expect(() => new CaseCatalog([mission], [])).toThrow(
      `references unknown Case ${mission.caseId}`,
    );
    expect(
      () => new CaseCatalog([mission], [{ ...caseDefinition, missionIds: [] }]),
    ).toThrow(`does not offer Mission ${mission.id}`);
  });
});
