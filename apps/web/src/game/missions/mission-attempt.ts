import { type EvaluationResult, evaluate } from "../../sql/evaluator";
import type { QueryResult, SqlRuntime, TableInfo } from "../../sql/sql-runtime";
import type { Mission } from "./mission-types";

export type MissionCompletion = {
  missionId: string;
  missionTitle: string;
  concepts: string[];
  playerQuery: string;
  referenceQuery: string;
  explanation: string;
  xp: number;
};

export type MissionSubmission = {
  evaluation: EvaluationResult;
  completion: MissionCompletion | null;
};

export type QueryExecution =
  | { ok: true; data: QueryResult; durationMs: number }
  | { ok: false; error: string };

export class MissionAttempt {
  constructor(
    private readonly mission: Mission,
    private readonly runtime: SqlRuntime,
  ) {}

  async open(): Promise<TableInfo[]> {
    await this.runtime.init(
      this.mission.database.schemaSql,
      this.mission.database.seedSql,
    );
    return this.runtime.tables();
  }

  async run(query: string): Promise<QueryExecution> {
    const result = await this.runtime.run(query);
    if (!result.ok) return result;
    return {
      ok: true,
      data: result.results.at(-1) ?? { columns: [], rows: [] },
      durationMs: result.durationMs,
    };
  }

  reset(): Promise<void> {
    return this.runtime.reset();
  }

  dispose(): void {
    this.runtime.dispose();
  }

  async submit(playerQuery: string): Promise<MissionSubmission> {
    await this.runtime.reset();
    const playerRun = await this.runtime.run(playerQuery);
    await this.runtime.reset();
    const referenceRun = await this.runtime.run(
      this.mission.challenge.referenceQuery,
    );
    const evaluation = evaluate(
      playerRun,
      referenceRun,
      this.mission.challenge.expectedColumns,
      this.mission.reward.xp,
    );

    return {
      evaluation,
      completion: evaluation.passed
        ? {
            missionId: this.mission.id,
            missionTitle: this.mission.title,
            concepts: this.mission.explanation.concepts,
            playerQuery,
            referenceQuery: this.mission.challenge.referenceQuery,
            explanation: this.mission.explanation.summary,
            xp: evaluation.earnedXp,
          }
        : null,
    };
  }
}
