import { type EvaluationResult, evaluate } from "../../sql/evaluator";
import type {
  QueryResult,
  RunResult,
  SqlRuntime,
  TableInfo,
} from "../../sql/sql-runtime";
import type { Mission } from "./mission-types";

export interface MissionCompletion {
  missionId: string;
  missionTitle: string;
  concepts: string[];
  playerQuery: string;
  referenceQuery: string;
  explanation: string;
  xp: number;
}

export interface MissionSubmission {
  evaluation: EvaluationResult;
  completion: MissionCompletion | null;
}

export type QueryExecution =
  | { ok: true; data: QueryResult; durationMs: number }
  | { ok: false; error: string };

export type AttemptOperation = { ok: true } | { ok: false; error: string };

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
    try {
      const result = await this.runtime.run(query);
      if (!result.ok) return result;
      return {
        ok: true,
        data: result.results.at(-1) ?? { columns: [], rows: [] },
        durationMs: result.durationMs,
      };
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }
  }

  async reset(): Promise<AttemptOperation> {
    try {
      await this.runtime.reset();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorMessage(error) };
    }
  }

  dispose(): void {
    this.runtime.dispose();
  }

  async submit(playerQuery: string): Promise<MissionSubmission> {
    let playerRun: RunResult;
    let referenceRun: RunResult;
    try {
      await this.runtime.reset();
      playerRun = await this.runtime.run(playerQuery);
      await this.runtime.reset();
      referenceRun = await this.runtime.run(
        this.mission.challenge.referenceQuery,
      );
    } catch (error) {
      return {
        evaluation: {
          passed: false,
          reason: "SQL_ERROR",
          message: errorMessage(error),
        },
        completion: null,
      };
    }
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

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return JSON.stringify(error);
}
