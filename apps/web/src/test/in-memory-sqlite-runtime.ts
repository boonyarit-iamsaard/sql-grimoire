import type { Database, SqlJsStatic } from "sql.js";
import initSqlJs from "sql.js";
import { SerializedOperations } from "../sql/serialized-operations";
import type { RunResult, SqlRuntime, TableInfo } from "../sql/sql-runtime";
import { readSqliteTables } from "../sql/sqlite-schema";

export class InMemorySqliteRuntime implements SqlRuntime {
  private sqlJs: SqlJsStatic | null = null;
  private database: Database | null = null;
  private readonly operations = new SerializedOperations();
  private schemaSql = "";
  private seedSql = "";
  private disposed = false;

  async init(schemaSql: string, seedSql: string): Promise<void> {
    return this.operations.run(async () => {
      this.ensureActive();
      const sqlJs = this.sqlJs ?? (await initSqlJs());
      this.ensureActive();
      this.sqlJs = sqlJs;
      this.recreateDatabase(schemaSql, seedSql);
      this.schemaSql = schemaSql;
      this.seedSql = seedSql;
    });
  }

  run(sql: string): Promise<RunResult> {
    return this.operations.run(() => this.runNow(sql));
  }

  async reset(): Promise<void> {
    return this.operations.run(async () => {
      this.ensureActive();
      this.recreateDatabase();
    });
  }

  tables(): Promise<TableInfo[]> {
    return this.operations.run(() =>
      readSqliteTables((sql) => this.runNow(sql)),
    );
  }

  dispose(): void {
    this.disposed = true;
    this.database?.close();
    this.database = null;
  }

  private async runNow(sql: string): Promise<RunResult> {
    // SqliteRuntime.sendNow resolves rather than throws on a dead runtime;
    // the shared contract test holds both adapters to that.
    if (this.disposed) {
      return { ok: false, error: "Runtime disposed", errorKind: "runtime" };
    }
    if (!this.database) {
      return {
        ok: false,
        error: "Database not initialized",
        errorKind: "runtime",
      };
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

  private ensureActive(): void {
    if (this.disposed) {
      throw new Error("Runtime disposed");
    }
  }

  private recreateDatabase(
    schemaSql: string = this.schemaSql,
    seedSql: string = this.seedSql,
  ): void {
    if (!this.sqlJs) {
      throw new Error("SQL.js not initialized");
    }
    const replacement = new this.sqlJs.Database();
    try {
      replacement.run(schemaSql);
      replacement.run(seedSql);
    } catch (error) {
      replacement.close();
      throw error;
    }
    this.database?.close();
    this.database = replacement;
  }
}
