import type {
  EvaluationResult,
  ProbeEvaluationInput,
} from "../../sql/evaluator";
import { evaluate, evaluateProbes } from "../../sql/evaluator";
import type {
  QueryResult,
  RunResult,
  SqlRuntime,
  TableInfo,
} from "../../sql/sql-runtime";
import type { CaseCatalog } from "../cases/case-catalog";
import type { PlayerProgress } from "../progress/progress-store";
import type {
  MissionCompletion,
  MissionCompletionOutcome,
} from "../progress/progress-types";
import type { Mission, Probe, StateGrading } from "./mission-types";
import { isStateGrading } from "./mission-types";

export type MissionAttemptPhase =
  | "idle"
  | "opening"
  | "ready"
  | "running"
  | "submitting"
  | "resetting"
  | "failed"
  | "disposed";

export type AttemptNotice = {
  kind: "error" | "interrupted";
  message: string;
};

export interface MissionRun {
  query: string;
  data: QueryResult;
  durationMs: number;
}

export interface MissionAttemptSnapshot {
  mission: Mission;
  phase: MissionAttemptPhase;
  busy: boolean;
  databaseReady: boolean;
  readyToSeal: boolean;
  query: string;
  tables: TableInfo[];
  lastRun: MissionRun | null;
  notice: AttemptNotice | null;
  hintIndex: number;
  evaluation: EvaluationResult | null;
  evaluatedQuery: string | null;
  completionOutcome: MissionCompletionOutcome | null;
  nextMission: Mission | null;
  initError: string | null;
}

export interface MissionAttemptOptions {
  mission: Mission;
  runtime: SqlRuntime;
  progress: PlayerProgress;
  catalog: CaseCatalog;
}

export type AttemptActionResult =
  | { accepted: true }
  | {
      accepted: false;
      reason: "BUSY" | "NOT_READY" | "EMPTY_QUERY" | "DISPOSED";
    };

interface MissionSubmission {
  evaluation: EvaluationResult;
  completion: MissionCompletion | null;
}

export class MissionAttempt {
  private readonly mission: Mission;
  private readonly runtime: SqlRuntime;
  private readonly progress: PlayerProgress;
  private readonly catalog: CaseCatalog;
  private readonly listeners = new Set<() => void>();
  private openingDatabase: Promise<void> | null = null;
  private snapshot: MissionAttemptSnapshot;

  constructor(options: MissionAttemptOptions) {
    this.mission = options.mission;
    this.runtime = options.runtime;
    this.progress = options.progress;
    this.catalog = options.catalog;
    this.snapshot = {
      mission: this.mission,
      phase: "idle",
      busy: false,
      databaseReady: false,
      readyToSeal: false,
      query: this.progress.lastQueryFor(this.mission.id),
      tables: [],
      lastRun: null,
      notice: null,
      hintIndex: -1,
      evaluation: null,
      evaluatedQuery: null,
      completionOutcome: null,
      nextMission: null,
      initError: null,
    };
  }

  readonly getSnapshot = (): MissionAttemptSnapshot => this.snapshot;

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  async open(): Promise<AttemptActionResult> {
    const rejection = this.rejectUnless("idle");
    if (rejection) {
      return rejection;
    }

    this.update({ phase: "opening", initError: null });
    this.progress.enterMission(this.mission.id);
    const openingDatabase = this.initializeDatabase();
    this.openingDatabase = openingDatabase;
    try {
      await openingDatabase;
    } finally {
      if (this.openingDatabase === openingDatabase) {
        this.openingDatabase = null;
      }
    }
    return { accepted: true };
  }

  setQuery(query: string): void {
    if (this.snapshot.phase === "disposed") {
      return;
    }
    this.update({ query });
  }

  revealNextHint(): void {
    if (this.snapshot.phase === "disposed") {
      return;
    }
    const lastHintIndex = this.mission.challenge.hints.length - 1;
    this.update({
      hintIndex: Math.min(this.snapshot.hintIndex + 1, lastHintIndex),
    });
  }

  clearVerdict(): void {
    if (this.snapshot.phase === "disposed") {
      return;
    }
    this.update({
      evaluation: null,
      evaluatedQuery: null,
      completionOutcome: null,
      nextMission: null,
    });
  }

  async run(): Promise<AttemptActionResult> {
    const rejection = this.rejectUnless("ready");
    if (rejection) {
      return rejection;
    }

    const query = this.snapshot.query;
    this.progress.recordLastQuery(this.mission.id, query);
    this.update({
      phase: "running",
      notice: null,
      evaluation: null,
      evaluatedQuery: null,
      completionOutcome: null,
      nextMission: null,
    });

    try {
      const result = await this.runtime.run(query);
      if (!result.ok) {
        this.update({
          phase: "ready",
          notice: {
            kind: result.errorKind === "interrupted" ? "interrupted" : "error",
            message: result.error,
          },
          lastRun: null,
        });
        return { accepted: true };
      }
      this.update({
        phase: "ready",
        lastRun: {
          query,
          data: result.results.at(-1) ?? { columns: [], rows: [] },
          durationMs: result.durationMs,
        },
      });
    } catch (error) {
      this.update({
        phase: "ready",
        notice: { kind: "error", message: errorMessage(error) },
        lastRun: null,
      });
    }
    return { accepted: true };
  }

  async submit(): Promise<AttemptActionResult> {
    const query = this.snapshot.query;
    if (this.snapshot.phase === "opening" && this.openingDatabase) {
      await this.openingDatabase;
    }
    const rejection = this.rejectUnless("ready");
    if (rejection) {
      return rejection;
    }
    if (query.trim() === "") {
      return { accepted: false, reason: "EMPTY_QUERY" };
    }

    this.progress.recordLastQuery(this.mission.id, query);
    this.update({
      phase: "submitting",
      notice: null,
      evaluation: null,
      evaluatedQuery: null,
      completionOutcome: null,
      nextMission: null,
    });
    let submission: MissionSubmission;
    try {
      submission = await this.gradeSubmission(query);
    } finally {
      await this.restoreAfterGrading(
        isStateGrading(this.mission.challenge) ? query : null,
      );
    }
    if (this.snapshot.phase === "disposed") {
      return { accepted: true };
    }
    if (!submission.completion) {
      this.update({
        phase: "ready",
        evaluation: submission.evaluation,
        evaluatedQuery: query,
      });
      return { accepted: true };
    }

    const completionOutcome = this.progress.completeMission(
      submission.completion,
    );
    const evaluation = submission.evaluation.passed
      ? {
          ...submission.evaluation,
          earnedXp: completionOutcome.awardedXp,
        }
      : submission.evaluation;
    this.update({
      phase: "ready",
      evaluation,
      evaluatedQuery: query,
      completionOutcome,
      nextMission: this.nextMissionInCase(),
    });
    return { accepted: true };
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await this.runtime.init(
        this.mission.database.schemaSql,
        this.mission.database.seedSql,
      );
      const tables = await this.runtime.tables();
      this.update({ phase: "ready", tables });
    } catch (error) {
      this.update({ phase: "failed", initError: errorMessage(error) });
    }
  }

  async reset(): Promise<AttemptActionResult> {
    const rejection = this.rejectUnless("ready");
    if (rejection) {
      return rejection;
    }

    this.update({ phase: "resetting" });
    try {
      await this.runtime.reset();
      const tables = await this.runtime.tables();
      this.update({
        phase: "ready",
        tables,
        lastRun: null,
        notice: null,
        evaluation: null,
        evaluatedQuery: null,
        completionOutcome: null,
        nextMission: null,
      });
    } catch (error) {
      this.update({
        phase: "ready",
        notice: { kind: "error", message: errorMessage(error) },
      });
    }
    return { accepted: true };
  }

  dispose(): void {
    if (this.snapshot.phase === "disposed") {
      return;
    }
    this.runtime.dispose();
    this.update({ phase: "disposed" });
    this.listeners.clear();
  }

  private rejectUnless(
    requiredPhase: "idle" | "ready",
  ): AttemptActionResult | null {
    if (this.snapshot.phase === "disposed") {
      return { accepted: false, reason: "DISPOSED" };
    }
    if (isBusy(this.snapshot.phase)) {
      return { accepted: false, reason: "BUSY" };
    }
    if (this.snapshot.phase !== requiredPhase) {
      return { accepted: false, reason: "NOT_READY" };
    }
    return null;
  }

  private update(patch: Partial<MissionAttemptSnapshot>): void {
    if (this.snapshot.phase === "disposed" && patch.phase !== "disposed") {
      return;
    }
    const nextSnapshot = { ...this.snapshot, ...patch };
    this.snapshot = {
      ...nextSnapshot,
      busy: isBusy(nextSnapshot.phase),
      databaseReady:
        nextSnapshot.phase !== "idle" &&
        nextSnapshot.phase !== "opening" &&
        nextSnapshot.phase !== "failed" &&
        nextSnapshot.phase !== "disposed",
      readyToSeal:
        nextSnapshot.phase === "ready" &&
        nextSnapshot.lastRun?.query === nextSnapshot.query,
    };
    this.listeners.forEach((listener) => {
      listener();
    });
  }

  /**
   * Grading ends with the reference solution applied. Returning the workbench
   * in that state would leak the answer — the guardrail a constraint Mission
   * asks for would already exist — so the database goes back to its seeded
   * state and the player replays their own script from there.
   */
  private async restoreAfterGrading(playerQuery: string | null): Promise<void> {
    if (this.snapshot.phase === "disposed") {
      return;
    }
    try {
      await this.runtime.reset();
      if (playerQuery !== null) {
        await this.runtime.run(playerQuery);
      }
    } catch {
      // A failed restore is reported by the next Run, not by the verdict.
    }
  }

  private nextMissionInCase(): Mission | null {
    return this.catalog.nextMission(this.mission.caseId, (missionId) =>
      this.progress.isMissionCompleted(missionId),
    );
  }

  private async gradeSubmission(
    playerQuery: string,
  ): Promise<MissionSubmission> {
    if (isStateGrading(this.mission.challenge)) {
      return this.gradeStateSubmission(playerQuery, this.mission.challenge);
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

  private async gradeStateSubmission(
    playerQuery: string,
    challenge: StateGrading,
  ): Promise<MissionSubmission> {
    let playerProbeRuns: RunResult[];
    let referenceProbeRuns: RunResult[];
    try {
      await this.runtime.reset();
      const playerScriptRun = await this.runtime.run(playerQuery);
      if (!playerScriptRun.ok) {
        return failedSubmission(playerScriptRun.error);
      }
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
  probes: readonly Probe[],
): Promise<RunResult[]> {
  const runs: RunResult[] = [];
  for (const probe of probes) {
    await enableForeignKeys(runtime);
    runs.push(await runtime.run(probe.sql));
  }
  return runs;
}

async function enableForeignKeys(runtime: SqlRuntime): Promise<void> {
  const result = await runtime.run("PRAGMA foreign_keys = ON;");
  if (!result.ok) {
    throw new Error(
      `Could not enable foreign-key enforcement before grading: ${result.error}`,
    );
  }
}

function failedSubmission(message: string): MissionSubmission {
  return {
    evaluation: { passed: false, reason: "SQL_ERROR", message },
    completion: null,
  };
}

function isBusy(phase: MissionAttemptPhase): boolean {
  return (
    phase === "opening" ||
    phase === "running" ||
    phase === "submitting" ||
    phase === "resetting"
  );
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
