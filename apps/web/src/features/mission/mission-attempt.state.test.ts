import { describe, expect, it } from "vitest";
import { delayedOrders } from "../../missions/harborline/01-delayed-orders/mission";
import { InMemorySqliteRuntime } from "../../test/in-memory-sqlite-runtime";
import { caseCatalog } from "../cases/case-catalog";
import { PlayerProgress } from "../progress/progress-store";
import { MissionAttempt } from "./mission-attempt";
import { isStateGrading } from "./mission-types";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe("Mission Attempt state", () => {
  it("owns investigation sequencing and durable completion", async () => {
    if (isStateGrading(delayedOrders.challenge)) {
      throw new Error("Expected a result-graded Mission");
    }
    const progress = new PlayerProgress(new MemoryStorage());
    const attempt = new MissionAttempt({
      mission: delayedOrders,
      runtime: new InMemorySqliteRuntime(),
      progress,
      catalog: caseCatalog,
    });

    expect(attempt.getSnapshot()).toMatchObject({
      phase: "idle",
      query: "",
      tables: [],
      lastRun: null,
      notice: null,
      evaluation: null,
      evaluatedQuery: null,
      hintIndex: -1,
      completionOutcome: null,
      nextMission: null,
    });

    const opening = attempt.open();
    expect(attempt.getSnapshot().phase).toBe("opening");
    await opening;

    expect(attempt.getSnapshot()).toMatchObject({
      phase: "ready",
      tables: [
        { name: "customers" },
        { name: "orders" },
        { name: "shipments" },
      ],
    });
    expect(progress.currentMissionId).toBe(delayedOrders.id);

    attempt.setQuery(delayedOrders.challenge.referenceQuery);
    const running = attempt.run();
    expect(attempt.getSnapshot().phase).toBe("running");
    await running;

    expect(attempt.getSnapshot()).toMatchObject({
      phase: "ready",
      lastRun: {
        query: delayedOrders.challenge.referenceQuery,
        data: { columns: delayedOrders.challenge.expectedColumns },
      },
    });
    expect(progress.lastQueryFor(delayedOrders.id)).toBe(
      delayedOrders.challenge.referenceQuery,
    );

    const submitting = attempt.submit();
    expect(attempt.getSnapshot().phase).toBe("submitting");
    await submitting;

    expect(attempt.getSnapshot()).toMatchObject({
      phase: "ready",
      evaluation: { passed: true, earnedXp: delayedOrders.reward.xp },
      completionOutcome: {
        firstCompletion: true,
        awardedXp: delayedOrders.reward.xp,
      },
      nextMission: { id: "council-tally" },
    });
    expect(progress.xp).toBe(delayedOrders.reward.xp);

    attempt.dispose();
  });
});
