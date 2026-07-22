import {
  type EvaluationResult,
  evaluate,
  evaluateProbes,
  type ProbeEvaluationInput,
} from "../../sql/evaluator";
import type {
  QueryResult,
  RunResult,
  SqlRuntime,
  TableInfo,
} from "../../sql/sql-runtime";
import {
  isStateGrading,
  type Mission,
  type Probe,
  type StateGrading,
} from "./mission-types";

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
      if (!result.ok) {
        return { ok: false, error: result.error };
      }
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
    if (isStateGrading(this.mission.challenge)) {
      return this.submitStateGraded(playerQuery, this.mission.challenge);
    }

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
      return failedSubmission(errorMessage(error));
    }
    const evaluation = evaluate(
      playerRun,
      referenceRun,
      this.mission.challenge.expectedColumns,
      this.mission.reward.xp,
    );

    return this.submissionWithCompletion(
      playerQuery,
      this.mission.challenge.referenceQuery,
      evaluation,
    );
  }

  private async submitStateGraded(
    playerQuery: string,
    challenge: StateGrading,
  ): Promise<MissionSubmission> {
    let playerProbeRuns: RunResult[];
    let referenceProbeRuns: RunResult[];
    try {
      await this.runtime.reset();
      await this.runtime.run(playerQuery);
      playerProbeRuns = await runProbes(this.runtime, challenge.probes);

      await this.runtime.reset();
      const referenceScriptRun = await this.runtime.run(
        challenge.referenceScript,
      );
      if (!referenceScriptRun.ok) {
        return failedSubmission(
          `Mission bug — reference script failed: ${referenceScriptRun.error}`,
        );
      }
      referenceProbeRuns = await runProbes(this.runtime, challenge.probes);
    } catch (error) {
      return failedSubmission(errorMessage(error));
    }

    const probeEvaluations: ProbeEvaluationInput[] = challenge.probes.map(
      (probe, index) => ({
        type: probe.type,
        playerRun: playerProbeRuns[index],
        referenceRun: referenceProbeRuns[index],
      }),
    );
    const evaluation = evaluateProbes(probeEvaluations, this.mission.reward.xp);
    return this.submissionWithCompletion(
      playerQuery,
      challenge.referenceScript,
      evaluation,
    );
  }

  private submissionWithCompletion(
    playerQuery: string,
    referenceQuery: string,
    evaluation: EvaluationResult,
  ): MissionSubmission {
    return {
      evaluation,
      completion: evaluation.passed
        ? {
            missionId: this.mission.id,
            missionTitle: this.mission.title,
            concepts: this.mission.explanation.concepts,
            playerQuery,
            referenceQuery,
            explanation: this.mission.explanation.summary,
            xp: evaluation.earnedXp,
          }
        : null,
    };
  }
}

async function runProbes(
  runtime: SqlRuntime,
  probes: Probe[],
): Promise<RunResult[]> {
  const runs: RunResult[] = [];
  for (const probe of probes) {
    runs.push(await runtime.run(probe.sql));
  }
  return runs;
}

function failedSubmission(message: string): MissionSubmission {
  return {
    evaluation: { passed: false, reason: "SQL_ERROR", message },
    completion: null,
  };
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return JSON.stringify(error);
}
