import type { Database, SqlJsStatic } from "sql.js";
import initSqlJs from "sql.js";
import { describe, expect, it } from "vitest";
import type { RunResult, SqlRuntime, TableInfo } from "../../sql/sql-runtime";
import { MissionAttempt } from "./mission-attempt";
import type { Mission } from "./mission-types";

const mission = {
  id: "test-mission",
  title: "Test Mission",
  caseId: "test-case",
  objective: "Return the answer.",
  briefing: { reporter: "Test", role: "Tester", channel: "Note", body: [] },
  primer: { title: "Test primer", sections: [] },
  database: { schemaSql: "CREATE TABLE answers (value INTEGER);", seedSql: "" },
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
}

class InMemorySqliteRuntime implements SqlRuntime {
  private sqlJs: SqlJsStatic | null = null;
  private database: Database | null = null;
  private schemaSql = "";
  private seedSql = "";

  async init(schemaSql: string, seedSql: string): Promise<void> {
    this.sqlJs ??= await initSqlJs();
    this.schemaSql = schemaSql;
    this.seedSql = seedSql;
    this.recreateDatabase();
  }

  async run(sql: string): Promise<RunResult> {
    if (!this.database) {
      throw new Error("Database not initialized");
    }
    try {
      const results = this.database
        .exec(sql)
        .map((result) => ({ columns: result.columns, rows: result.values }));
      return { ok: true, results, durationMs: 0 };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        errorKind: "sql",
      };
    }
  }

  async reset(): Promise<void> {
    this.recreateDatabase();
  }

  async tables(): Promise<TableInfo[]> {
    return [];
  }

  dispose(): void {
    this.database?.close();
    this.database = null;
  }

  private recreateDatabase(): void {
    if (!this.sqlJs) {
      throw new Error("SQL.js not initialized");
    }
    this.database?.close();
    this.database = new this.sqlJs.Database();
    this.database.run(this.schemaSql);
    this.database.run(this.seedSql);
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

  it("projects rejected runtime operations without leaking them", async () => {
    const runtime = new RecordingRuntime();
    const attempt = new MissionAttempt(mission, runtime);
    runtime.runError = new Error("worker crashed");

    await expect(attempt.run("SELECT 42")).resolves.toEqual({
      ok: false,
      error: "worker crashed",
    });

    runtime.runError = null;
    runtime.resetError = new Error("reset failed");
    await expect(attempt.reset()).resolves.toEqual({
      ok: false,
      error: "reset failed",
    });
    await expect(attempt.submit("SELECT 42")).resolves.toEqual({
      evaluation: {
        passed: false,
        reason: "SQL_ERROR",
        message: "reset failed",
      },
      completion: null,
    });
  });

  it("runs State-graded Probes in their authored order", async () => {
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
    runtime.runResults.push(
      { ok: true, results: [], durationMs: 1 },
      bookingsResult,
      constraintError,
      { ok: true, results: [], durationMs: 1 },
      bookingsResult,
      constraintError,
    );

    const playerScript =
      "CREATE UNIQUE INDEX player_guardrail ON bookings (room_id, booking_date, slot);";
    const submission = await new MissionAttempt(
      stateGradedMission,
      runtime,
    ).submit(playerScript);

    expect(submission.evaluation).toEqual({ passed: true, earnedXp: 25 });
    expect(runtime.calls).toEqual([
      "reset",
      `run:${playerScript}`,
      `run:${stateGradedMission.challenge.probes[0].sql}`,
      `run:${stateGradedMission.challenge.probes[1].sql}`,
      "reset",
      `run:${stateGradedMission.challenge.referenceScript}`,
      `run:${stateGradedMission.challenge.probes[0].sql}`,
      `run:${stateGradedMission.challenge.probes[1].sql}`,
    ]);
  });

  it("passes a State-graded script when every Probe passes", async () => {
    const runtime = new InMemorySqliteRuntime();
    const attempt = new MissionAttempt(stateGradedMission, runtime);
    await attempt.open();

    const submission = await attempt.submit(
      "CREATE UNIQUE INDEX player_guardrail ON bookings (room_id, booking_date, slot);",
    );

    expect(submission).toEqual({
      evaluation: { passed: true, earnedXp: 25 },
      completion: {
        missionId: "state-graded-test-mission",
        missionTitle: "Test Mission",
        concepts: ["SELECT"],
        playerQuery:
          "CREATE UNIQUE INDEX player_guardrail ON bookings (room_id, booking_date, slot);",
        referenceQuery:
          "CREATE UNIQUE INDEX bookings_room_slot ON bookings (room_id, booking_date, slot);",
        explanation: "The answer is 42.",
        xp: 25,
      },
    });

    attempt.dispose();
  });

  it("fails a valid State-graded script when a query Probe finds changed state", async () => {
    const runtime = new InMemorySqliteRuntime();
    const attempt = new MissionAttempt(stateGradedMission, runtime);
    await attempt.open();

    const submission = await attempt.submit(`
      DELETE FROM bookings WHERE id = 2;
      CREATE UNIQUE INDEX player_guardrail
      ON bookings (room_id, booking_date, slot);
    `);

    expect(submission).toEqual({
      evaluation: {
        passed: false,
        reason: "INCORRECT_ROWS",
        message:
          "The columns are right, but you returned 1 row(s) and the expected result has 2. Check your JOIN and WHERE conditions.",
      },
      completion: null,
    });

    attempt.dispose();
  });

  it("rejects infrastructure failures during must-fail Probes", async () => {
    const runtime = new RecordingRuntime();
    runtime.runResults.push(
      { ok: true, results: [], durationMs: 1 },
      {
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
      },
      { ok: false, error: "worker crashed", errorKind: "runtime" },
      { ok: true, results: [], durationMs: 1 },
      {
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
      },
      {
        ok: false,
        error: "UNIQUE constraint failed",
        errorKind: "sql",
      },
    );

    const submission = await new MissionAttempt(
      stateGradedMission,
      runtime,
    ).submit("CREATE UNIQUE INDEX player_guardrail ON bookings (room_id)");

    expect(submission).toEqual({
      evaluation: {
        passed: false,
        reason: "SQL_ERROR",
        message: "Probe 2 could not run: worker crashed",
      },
      completion: null,
    });
  });

  it("fails a must-fail Probe when SQLite accepts its statement", async () => {
    const runtime = new InMemorySqliteRuntime();
    const attempt = new MissionAttempt(stateGradedMission, runtime);
    await attempt.open();

    const submission = await attempt.submit(
      "CREATE INDEX player_non_guardrail ON bookings (room_id, booking_date, slot);",
    );

    expect(submission).toEqual({
      evaluation: {
        passed: false,
        reason: "PROBE_FAILED",
        message:
          "Probe 2 expected SQLite to reject the statement, but it succeeded.",
      },
      completion: null,
    });

    attempt.dispose();
  });

  it("isolates State-graded submission from prior workbench changes", async () => {
    const runtime = new InMemorySqliteRuntime();
    const attempt = new MissionAttempt(stateGradedMission, runtime);
    await attempt.open();
    await attempt.run("DELETE FROM bookings WHERE id = 2");

    const submission = await attempt.submit(
      "CREATE UNIQUE INDEX player_guardrail ON bookings (room_id, booking_date, slot);",
    );

    expect(submission.evaluation).toEqual({ passed: true, earnedXp: 25 });

    attempt.dispose();
  });

  it("grades the state left by a script even when a later statement errors", async () => {
    const runtime = new InMemorySqliteRuntime();
    const attempt = new MissionAttempt(stateGradedMission, runtime);
    await attempt.open();

    const submission = await attempt.submit(`
      CREATE UNIQUE INDEX player_guardrail
      ON bookings (room_id, booking_date, slot);
      SELECT missing_column FROM bookings;
    `);

    expect(submission.evaluation).toEqual({ passed: true, earnedXp: 25 });

    attempt.dispose();
  });
});
