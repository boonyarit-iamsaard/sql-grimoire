import type { Mission } from "../features/mission/mission-types";
import { isStateGrading } from "../features/mission/mission-types";
import type { QueryResult, RunResult, TableInfo } from "../sql/sql-runtime";
import { InMemorySqliteRuntime } from "./in-memory-sqlite-runtime";
import { submitMission } from "./mission-verification-support";

export interface PrimerVerification {
  heading: string;
  run: RunResult;
}

export interface MissionVerification {
  mission: Mission;
  tables: TableInfo[];
  primerExamples: PrimerVerification[];
  referenceResult: QueryResult | null;
}

export async function verifyMission(
  mission: Mission,
): Promise<MissionVerification> {
  const tables = await openDatabase(mission);
  const primerExamples: PrimerVerification[] = [];

  for (const section of mission.primer.sections) {
    if (!section.exampleSql) {
      continue;
    }
    const run = await runFresh(mission, section.exampleSql);
    primerExamples.push({ heading: section.heading, run });
  }

  const referenceSql = isStateGrading(mission.challenge)
    ? mission.challenge.referenceScript
    : mission.challenge.referenceQuery;
  const submission = await submitMission(mission, referenceSql);
  if (!submission.evaluation?.passed) {
    const reason = submission.evaluation
      ? JSON.stringify(submission.evaluation)
      : "submission produced no evaluation";
    throw new Error(
      `Mission Verification: ${mission.id} reference solution failed real grading: ${reason}`,
    );
  }

  const referenceResult = isStateGrading(mission.challenge)
    ? null
    : lastResult(await runFresh(mission, mission.challenge.referenceQuery));

  return { mission, tables, primerExamples, referenceResult };
}

async function openDatabase(mission: Mission): Promise<TableInfo[]> {
  const runtime = new InMemorySqliteRuntime();
  try {
    await runtime.init(mission.database.schemaSql, mission.database.seedSql);
    return await runtime.tables();
  } finally {
    runtime.dispose();
  }
}

async function runFresh(mission: Mission, sql: string): Promise<RunResult> {
  const runtime = new InMemorySqliteRuntime();
  try {
    await runtime.init(mission.database.schemaSql, mission.database.seedSql);
    return await runtime.run(sql);
  } finally {
    runtime.dispose();
  }
}

function lastResult(run: RunResult): QueryResult | null {
  return run.ok ? (run.results.at(-1) ?? null) : null;
}
