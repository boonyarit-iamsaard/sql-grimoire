import type { QueryResult, RunErrorKind } from "./sql-runtime";

export type SqliteWorkerCommand =
  | { kind: "init"; schemaSql: string; seedSql: string }
  | { kind: "run"; sql: string }
  | { kind: "reset" };

export type SqliteWorkerRequest = SqliteWorkerCommand & { id: number };

export type SqliteWorkerResponse =
  | {
      id: number;
      ok: true;
      results: QueryResult[];
      durationMs: number;
    }
  | {
      id: number;
      ok: false;
      error: string;
      errorKind: Exclude<RunErrorKind, "interrupted">;
    };

export function requestWithId(
  id: number,
  command: SqliteWorkerCommand,
): SqliteWorkerRequest {
  return { id, ...command };
}
