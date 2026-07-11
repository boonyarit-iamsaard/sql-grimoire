import { describe, expect, it } from "vitest";
import type { RunResult, SqlRuntime, TableInfo } from "../../sql/sql-runtime";
import { MissionAttempt } from "./mission-attempt";
import type { Mission } from "./mission-types";

const mission: Mission = {
  id: "test-mission",
  title: "Test Mission",
  locationId: "test-location",
  objective: "Return the answer.",
  dialogue: [],
  database: { schemaSql: "CREATE TABLE answers (value INTEGER);", seedSql: "" },
  challenge: {
    expectedColumns: ["answer"],
    referenceQuery: "SELECT 42 AS answer",
    hints: [],
  },
  reward: { xp: 25, successMessage: "Solved." },
  explanation: { summary: "The answer is 42.", concepts: ["SELECT"] },
};

class RecordingRuntime implements SqlRuntime {
  readonly calls: string[] = [];
  readonly runResults: RunResult[] = [];
  nextRun: RunResult = {
    ok: true,
    results: [{ columns: ["answer"], rows: [[42]] }],
    durationMs: 1,
  };

  async init(schemaSql: string, seedSql: string) {
    this.calls.push(`init:${schemaSql}:${seedSql}`);
  }

  async run(sql: string): Promise<RunResult> {
    this.calls.push(`run:${sql}`);
    return this.runResults.shift() ?? this.nextRun;
  }

  async reset() {
    this.calls.push("reset");
  }

  async tables(): Promise<TableInfo[]> {
    this.calls.push("tables");
    return [{ name: "answers", columns: [] }];
  }

  dispose() {
    this.calls.push("dispose");
  }
}

describe("Mission Attempt", () => {
  it("owns database lifecycle and projects the last query result", async () => {
    const runtime = new RecordingRuntime();
    const attempt = new MissionAttempt(mission, runtime);

    await expect(attempt.open()).resolves.toEqual([
      { name: "answers", columns: [] },
    ]);
    runtime.nextRun = {
      ok: true,
      results: [
        { columns: ["ignored"], rows: [[1]] },
        { columns: ["answer"], rows: [[42]] },
      ],
      durationMs: 3,
    };
    await expect(attempt.run("SELECT 1; SELECT 42 AS answer")).resolves.toEqual(
      {
        ok: true,
        data: { columns: ["answer"], rows: [[42]] },
        durationMs: 3,
      },
    );
    await attempt.reset();
    attempt.dispose();

    expect(runtime.calls).toEqual([
      `init:${mission.database.schemaSql}:${mission.database.seedSql}`,
      "tables",
      "run:SELECT 1; SELECT 42 AS answer",
      "reset",
      "dispose",
    ]);
  });

  it("isolates grading and returns completion facts for a correct query", async () => {
    const runtime = new RecordingRuntime();
    const attempt = new MissionAttempt(mission, runtime);

    const submission = await attempt.submit("SELECT 42 AS answer");

    expect(runtime.calls).toEqual([
      "reset",
      "run:SELECT 42 AS answer",
      "reset",
      "run:SELECT 42 AS answer",
    ]);
    expect(submission).toEqual({
      evaluation: { passed: true, earnedXp: 25 },
      completion: {
        missionId: "test-mission",
        missionTitle: "Test Mission",
        concepts: ["SELECT"],
        playerQuery: "SELECT 42 AS answer",
        referenceQuery: "SELECT 42 AS answer",
        explanation: "The answer is 42.",
        xp: 25,
      },
    });
  });

  it("grades through canonical columns and row multisets", async () => {
    const runtime = new RecordingRuntime();
    runtime.runResults.push(
      {
        ok: true,
        results: [
          {
            columns: ["LABEL", "ANSWER"],
            rows: [
              [null, 2],
              ["known", 1],
              ["known", 1],
            ],
          },
        ],
        durationMs: 1,
      },
      {
        ok: true,
        results: [
          {
            columns: ["answer", "label"],
            rows: [
              [1, "known"],
              [2, null],
              [1, "known"],
            ],
          },
        ],
        durationMs: 1,
      },
    );
    const gradingMission: Mission = {
      ...mission,
      challenge: {
        ...mission.challenge,
        expectedColumns: ["answer", "label"],
      },
    };

    const submission = await new MissionAttempt(gradingMission, runtime).submit(
      "SELECT answer, label FROM answers",
    );

    expect(submission.evaluation).toEqual({ passed: true, earnedXp: 25 });
  });
});
