import { describe, expect, it } from "vitest";
import { PlayerProgress } from "./progress-store";
import type { MissionCompletion } from "./progress-types";

class MemoryStorage {
  readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const completion: MissionCompletion = {
  missionId: "missing-shipment",
  missionTitle: "The Missing Shipment",
  concepts: ["SELECT"],
  playerQuery: "SELECT 1",
  referenceQuery: "SELECT 1",
  explanation: "Selects one value.",
  xp: 100,
};

describe("Player Progress", () => {
  it("applies completion once and preserves the existing save schema", () => {
    const storage = new MemoryStorage();
    const progress = new PlayerProgress(
      storage,
      () => new Date("2026-07-11T10:00:00.000Z"),
    );

    const firstCompletion = progress.completeMission(completion);
    const repeatedCompletion = progress.completeMission({
      ...completion,
      playerQuery: "SELECT 1;",
    });

    expect(progress.xp).toBe(100);
    expect(firstCompletion).toEqual({
      firstCompletion: true,
      awardedXp: 100,
    });
    expect(repeatedCompletion).toEqual({
      firstCompletion: false,
      awardedXp: 0,
    });
    expect(progress.isMissionCompleted("missing-shipment")).toBe(true);
    expect(progress.grimoireEntries).toEqual([
      {
        missionId: "missing-shipment",
        missionTitle: "The Missing Shipment",
        concepts: ["SELECT"],
        playerQuery: "SELECT 1;",
        referenceQuery: "SELECT 1",
        explanation: "Selects one value.",
        completedAt: "2026-07-11T10:00:00.000Z",
      },
    ]);

    expect(
      JSON.parse(storage.values.get("sql-rpg-progress-v1") ?? "null"),
    ).toMatchObject({
      xp: 100,
      completedMissionIds: ["missing-shipment"],
      journal: [{ playerQuery: "SELECT 1;" }],
    });
  });

  it("normalizes malformed durable data to safe defaults", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      "sql-rpg-progress-v1",
      JSON.stringify({
        xp: "many",
        completedMissionIds: "missing-shipment",
        journal: null,
        lastQueries: [],
        currentMissionId: 42,
      }),
    );

    const progress = new PlayerProgress(storage);

    expect(progress.xp).toBe(0);
    expect(progress.grimoireEntries).toEqual([]);
    expect(progress.hasSavedProgress()).toBe(false);
    expect(progress.lastQueryFor("missing-shipment")).toBe("");
  });
});
