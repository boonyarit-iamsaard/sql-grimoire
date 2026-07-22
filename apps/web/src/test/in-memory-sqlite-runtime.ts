import type { Database, SqlJsStatic } from "sql.js";
import initSqlJs from "sql.js";
import type { RunResult, SqlRuntime, TableInfo } from "../sql/sql-runtime";

export class InMemorySqliteRuntime implements SqlRuntime {
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
