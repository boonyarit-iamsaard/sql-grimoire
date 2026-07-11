// Shared types for the browser SQL runtime. Pure types only — no I/O here.

export type SqlValue = number | string | Uint8Array | null;

export type QueryResult = {
  columns: string[];
  rows: SqlValue[][];
};

export type RunResult =
  | { ok: true; results: QueryResult[]; durationMs: number }
  | { ok: false; error: string };

export type TableInfo = {
  name: string;
  columns: Array<{ name: string; type: string; pk: boolean; notNull: boolean }>;
};

export interface SqlRuntime {
  /** (Re)creates the database from schema + seed SQL. */
  init(schemaSql: string, seedSql: string): Promise<void>;
  /** Runs arbitrary SQL. Rejected/interrupted if it exceeds the time budget. */
  run(sql: string): Promise<RunResult>;
  /** Restores the database to its post-seed state without a page reload. */
  reset(): Promise<void>;
  /** Introspects tables for the schema explorer. */
  tables(): Promise<TableInfo[]>;
  /** Releases runtime resources and settles pending work. */
  dispose(): void;
}
