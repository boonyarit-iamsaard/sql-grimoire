import { describe, expect, it } from "vitest";
import type { RunResult, SqlRuntime, TableInfo } from "../../sql/sql-runtime";
import { InMemorySqliteRuntime } from "../../test/in-memory-sqlite-runtime";
import { createTestMissionAttempt } from "../../test/mission-verification-support";
import type { Mission } from "./mission-types";

const mission = {
  id: "test-mission",
  title: "Test Mission",
  caseId: "test-case",
  objective: "Return the answer.",
  briefing: { reporter: "Test", role: "Tester", channel: "Note", body: [] },
  primer: { title: "Test primer", sections: [] },
  database: {
    schemaSql: "CREATE TABLE answers (value INTEGER);",
    seedSql: "",
  },
  challenge: {
    expectedColumns: ["answer"],
    referenceQuery: "SELECT 42 AS answer",
    hints: [],
  },
  reward: { xp: 25, successMessage: "Solved." },
  explanation: { summary: "The answer is 42.", concepts: ["SELECT"] },
} satisfies Mission;

const stateGradedMission = {
  ...mission,
  id: "state-graded-test-mission",
  objective: "Prevent duplicate room bookings.",
  database: {
    schemaSql: `
      CREATE TABLE bookings (
        id INTEGER PRIMARY KEY,
        room_id INTEGER NOT NULL,
        booking_date TEXT NOT NULL,
        slot TEXT NOT NULL
      );
    `,
    seedSql: `
      INSERT INTO bookings (id, room_id, booking_date, slot)
      VALUES
        (1, 7, '2026-08-01', '10:00'),
        (2, 7, '2026-08-01', '11:00');
    `,
  },
  challenge: {
    referenceScript:
      "CREATE UNIQUE INDEX bookings_room_slot ON bookings (room_id, booking_date, slot);",
    probes: [
      {
        type: "query",
        sql: "SELECT id, room_id, booking_date, slot FROM bookings",
      },
      {
        type: "must-fail",
        sql: `
          INSERT INTO bookings (id, room_id, booking_date, slot)
          VALUES (3, 7, '2026-08-01', '10:00');
        `,
      },
    ],
    hints: [],
  },
} satisfies Mission;

class RecordingRuntime implements SqlRuntime {
  readonly calls: string[] = [];
  readonly runResults: RunResult[] = [];
  runError: Error | null = null;
  resetError: Error | null = null;
  runGate: Promise<void> | null = null;
  runStarted: Promise<void> = Promise.resolve();
  throwOnceOnSql: string | null = null;
  private notifyRunStarted: (() => void) | null = null;
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
    this.notifyRunStarted?.();
    this.notifyRunStarted = null;
    await this.runGate;
    if (this.throwOnceOnSql === sql) {
      this.throwOnceOnSql = null;
      throw new Error("grading crashed");
    }
    if (this.runError) {
      throw this.runError;
    }
    return this.runResults.shift() ?? this.nextRun;
  }

  async reset() {
    this.calls.push("reset");
    if (this.resetError) {
      throw this.resetError;
    }
  }

  async tables(): Promise<TableInfo[]> {
    this.calls.push("tables");
    return [{ name: "answers", columns: [] }];
  }

  dispose() {
    this.calls.push("dispose");
  }

  gateRunsUntil(gate: Promise<void>): void {
    this.runGate = gate;
    this.runStarted = new Promise((resolve) => {
      this.notifyRunStarted = resolve;
    });
  }
}

describe("Mission Attempt", () => {
  it("owns lifecycle, workbench projection, and reset semantics", async () => {
    const runtime = new RecordingRuntime();
    const attempt = createTestMissionAttempt(mission, runtime);

    const opening = attempt.open();
    expect(attempt.getSnapshot()).toMatchObject({
      phase: "opening",
      busy: true,
      databaseReady: false,
    });
    expect(await attempt.run()).toEqual({ accepted: false, reason: "BUSY" });
    await opening;

    runtime.nextRun = {
      ok: true,
      results: [
        { columns: ["ignored"], rows: [[1]] },
        { columns: ["answer"], rows: [[42]] },
      ],
      durationMs: 3,
    };
    attempt.setQuery("SELECT 1; SELECT 42 AS answer");
    await attempt.run();
    expect(attempt.getSnapshot()).toMatchObject({
      phase: "ready",
      readyToSeal: true,
      lastRun: {
        query: "SELECT 1; SELECT 42 AS answer",
        data: { columns: ["answer"], rows: [[42]] },
        durationMs: 3,
      },
    });

    attempt.revealNextHint();
    await attempt.reset();
    expect(attempt.getSnapshot()).toMatchObject({
      query: "SELECT 1; SELECT 42 AS answer",
      hintIndex: -1,
      lastRun: null,
      readyToSeal: false,
    });
    attempt.dispose();

    expect(runtime.calls).toEqual([
      `init:${mission.database.schemaSql}:${mission.database.seedSql}`,
      "tables",
      "run:SELECT 1; SELECT 42 AS answer",
      "reset",
      "tables",
      "dispose",
    ]);
  });

  it("applies first completion once and refreshes later solutions without XP", async () => {
    const attempt = createTestMissionAttempt(
      mission,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();
    attempt.setQuery(mission.challenge.referenceQuery);

    await attempt.submit();
    expect(attempt.getSnapshot()).toMatchObject({
      evaluation: { passed: true, earnedXp: 25 },
      completionOutcome: { firstCompletion: true, awardedXp: 25 },
    });

    attempt.clearVerdict();
    attempt.setQuery("SELECT 6 * 7 AS answer");
    await attempt.submit();
    expect(attempt.getSnapshot()).toMatchObject({
      evaluation: { passed: true, earnedXp: 0 },
      completionOutcome: { firstCompletion: false, awardedXp: 0 },
    });
    attempt.dispose();
  });

  it("keeps a verdict attached to the query that was submitted", async () => {
    const attempt = createTestMissionAttempt(
      mission,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();
    attempt.setQuery(mission.challenge.referenceQuery);

    const submission = attempt.submit();
    attempt.setQuery("SELECT 41 AS answer");
    await submission;

    expect(attempt.getSnapshot()).toMatchObject({
      query: "SELECT 41 AS answer",
      evaluatedQuery: mission.challenge.referenceQuery,
      evaluation: { passed: true },
    });
    attempt.dispose();
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
    const attempt = createTestMissionAttempt(gradingMission, runtime);
    await attempt.open();
    attempt.setQuery("SELECT answer, label FROM answers");
    await attempt.submit();

    expect(attempt.getSnapshot().evaluation).toEqual({
      passed: true,
      earnedXp: 25,
    });
  });

  it("projects runtime failures without leaking runtime exceptions", async () => {
    const runtime = new RecordingRuntime();
    const attempt = createTestMissionAttempt(mission, runtime);
    await attempt.open();
    attempt.setQuery("SELECT 42");
    runtime.runError = new Error("worker crashed");

    await attempt.run();
    expect(attempt.getSnapshot()).toMatchObject({
      phase: "ready",
      notice: { kind: "error", message: "worker crashed" },
      lastRun: null,
    });

    runtime.runError = null;
    runtime.resetError = new Error("reset failed");
    await attempt.reset();
    expect(attempt.getSnapshot().notice).toEqual({
      kind: "error",
      message: "reset failed",
    });
  });

  it("keeps disposal terminal while an accepted operation settles", async () => {
    const runtime = new RecordingRuntime();
    let releaseRun = () => {};
    const runGate = new Promise<void>((resolve) => {
      releaseRun = resolve;
    });
    runtime.gateRunsUntil(runGate);
    const attempt = createTestMissionAttempt(mission, runtime);
    await attempt.open();
    attempt.setQuery(mission.challenge.referenceQuery);

    const submission = attempt.submit();
    await runtime.runStarted;
    attempt.dispose();
    releaseRun();
    await submission;

    expect(attempt.getSnapshot()).toMatchObject({
      phase: "disposed",
      evaluation: null,
      completionOutcome: null,
    });
  });

  it("runs State-grading Probes in their authored order", async () => {
    const runtime = new RecordingRuntime();
    const bookingsResult: RunResult = {
      ok: true,
      results: [
        {
          columns: ["id", "room_id", "booking_date", "slot"],
          rows: [
            [1, 7, "2026-08-01", "10:00"],
            [2, 7, "2026-08-01", "11:00"],
          ],
        },
      ],
      durationMs: 1,
    };
    const constraintError: RunResult = {
      ok: false,
      error: "UNIQUE constraint failed",
      errorKind: "sql",
    };
    const scriptOk: RunResult = {
      ok: true,
      results: [],
      durationMs: 1,
    };
    const pragmaOk: RunResult = {
      ok: true,
      results: [],
      durationMs: 1,
    };
    runtime.runResults.push(
      scriptOk,
      pragmaOk,
      bookingsResult,
      pragmaOk,
      constraintError,
      scriptOk,
      pragmaOk,
      bookingsResult,
      pragmaOk,
      constraintError,
    );
    const attempt = createTestMissionAttempt(stateGradedMission, runtime);
    await attempt.open();
    const playerScript =
      "CREATE UNIQUE INDEX player_guardrail ON bookings (room_id, booking_date, slot);";
    attempt.setQuery(playerScript);
    await attempt.submit();

    expect(attempt.getSnapshot().evaluation).toEqual({
      passed: true,
      earnedXp: 25,
    });
    expect(runtime.calls.slice(2)).toEqual([
      "reset",
      `run:${playerScript}`,
      "run:PRAGMA foreign_keys = ON;",
      `run:${stateGradedMission.challenge.probes[0].sql}`,
      "run:PRAGMA foreign_keys = ON;",
      `run:${stateGradedMission.challenge.probes[1].sql}`,
      "reset",
      `run:${stateGradedMission.challenge.referenceScript}`,
      "run:PRAGMA foreign_keys = ON;",
      `run:${stateGradedMission.challenge.probes[0].sql}`,
      "run:PRAGMA foreign_keys = ON;",
      `run:${stateGradedMission.challenge.probes[1].sql}`,
      // Grading ends on the reference state; the workbench restores the
      // player's submitted state.
      "reset",
      `run:${playerScript}`,
    ]);
  });

  it("rejects a State-graded script that changes legitimate state", async () => {
    const attempt = createTestMissionAttempt(stateGradedMission);
    await attempt.open();
    attempt.setQuery(`
      DELETE FROM bookings WHERE id = 2;
      CREATE UNIQUE INDEX player_guardrail
      ON bookings (room_id, booking_date, slot);
    `);
    await attempt.submit();

    expect(attempt.getSnapshot().evaluation).toMatchObject({
      passed: false,
      reason: "INCORRECT_ROWS",
    });
    expect(attempt.getSnapshot().completionOutcome).toBeNull();
    attempt.dispose();
  });

  it("restores player state when State grading throws", async () => {
    const runtime = new RecordingRuntime();
    runtime.throwOnceOnSql = stateGradedMission.challenge.referenceScript;
    const attempt = createTestMissionAttempt(stateGradedMission, runtime);
    await attempt.open();
    const playerScript =
      "CREATE UNIQUE INDEX player_guardrail ON bookings (room_id, booking_date, slot);";
    attempt.setQuery(playerScript);

    await attempt.submit();

    expect(attempt.getSnapshot().evaluation).toEqual({
      passed: false,
      reason: "SQL_ERROR",
      message: "grading crashed",
    });
    expect(runtime.calls.slice(-3)).toEqual([
      `run:${stateGradedMission.challenge.referenceScript}`,
      "reset",
      `run:${playerScript}`,
    ]);
  });

  it("rejects a State-graded script when player execution fails", async () => {
    const attempt = createTestMissionAttempt(stateGradedMission);
    await attempt.open();
    attempt.setQuery(`
      CREATE UNIQUE INDEX player_guardrail
      ON bookings (room_id, booking_date, slot);
      SELECT missing_column FROM bookings;
    `);
    await attempt.submit();

    expect(attempt.getSnapshot().evaluation).toMatchObject({
      passed: false,
      reason: "SQL_ERROR",
      message: expect.stringContaining("missing_column"),
    });
    attempt.dispose();
  });
});
