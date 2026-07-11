// Main-thread wrapper around the sql.js worker. Enforces a query time budget:
// if the worker doesn't answer in time, it is terminated and respawned with a
// fresh copy of the database, so a runaway query can never freeze the app.
import type {
  QueryResult,
  RunResult,
  SqlRuntime,
  SqlValue,
  TableInfo,
} from "./sql-runtime";

const QUERY_TIMEOUT_MS = 2000;

interface Pending {
  resolve: (r: RunResult) => void;
  timer: number;
}

export class SqliteRuntime implements SqlRuntime {
  private worker: Worker | null = null;
  private nextId = 1;
  private readonly pending = new Map<number, Pending>();
  private schemaSql = "";
  private seedSql = "";

  private spawn(): Worker {
    const worker = new Worker(new URL("./sql.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (event) => {
      const { id, ok, results, error, durationMs } = event.data;
      const entry = this.pending.get(id);
      if (!entry) {
        return;
      }
      this.pending.delete(id);
      clearTimeout(entry.timer);
      entry.resolve(
        ok
          ? { ok: true, results, durationMs: durationMs ?? 0 }
          : { ok: false, error },
      );
    };
    // A worker that fails to even load (e.g. a broken import) never posts a
    // message — fail every pending call immediately instead of timing out.
    worker.onerror = (event) => {
      event.preventDefault();
      for (const [, p] of this.pending) {
        clearTimeout(p.timer);
        p.resolve({
          ok: false,
          error: `SQL worker failed to start: ${event.message || "unknown error"}`,
        });
      }
      this.pending.clear();
      this.worker?.terminate();
      this.worker = null;
    };
    return worker;
  }

  private send(
    msg: Record<string, unknown>,
    timeoutMs = QUERY_TIMEOUT_MS,
  ): Promise<RunResult> {
    this.worker ??= this.spawn();
    const id = this.nextId++;
    return new Promise((resolve) => {
      const timer = window.setTimeout(() => {
        this.pending.delete(id);
        // Kill the stuck worker and rebuild the database in a fresh one.
        this.worker?.terminate();
        this.worker = null;
        for (const [, p] of this.pending) {
          clearTimeout(p.timer);
          p.resolve({
            ok: false,
            error: "Interrupted: the database was restarted.",
          });
        }
        this.pending.clear();
        void this.init(this.schemaSql, this.seedSql);
        resolve({
          ok: false,
          error: `Query interrupted after ${timeoutMs}ms. The database has been restored — simplify the query and try again.`,
        });
      }, timeoutMs);
      this.pending.set(id, { resolve, timer });
      this.worker?.postMessage({ id, ...msg });
    });
  }

  async init(schemaSql: string, seedSql: string): Promise<void> {
    this.schemaSql = schemaSql;
    this.seedSql = seedSql;
    // First call also compiles the wasm — give it a generous budget.
    const result = await this.send({ kind: "init", schemaSql, seedSql }, 15000);
    if (!result.ok) {
      throw new Error(result.error);
    }
  }

  run(sql: string): Promise<RunResult> {
    return this.send({ kind: "run", sql });
  }

  async reset(): Promise<void> {
    const result = await this.send({ kind: "reset" });
    if (!result.ok) {
      throw new Error(result.error);
    }
  }

  dispose() {
    this.worker?.terminate();
    this.worker = null;
    for (const [, p] of this.pending) {
      clearTimeout(p.timer);
      p.resolve({ ok: false, error: "Runtime disposed" });
    }
    this.pending.clear();
  }

  async tables(): Promise<TableInfo[]> {
    const names = await this.run(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );
    if (!names.ok || names.results.length === 0) {
      return [];
    }
    const tables: TableInfo[] = [];
    for (const row of names.results[0].rows) {
      const name = String(row[0]);
      const info = await this.run(`PRAGMA table_info(${JSON.stringify(name)})`);
      if (!info.ok || info.results.length === 0) {
        continue;
      }
      const cols = asRecords(info.results[0]);
      tables.push({
        name,
        columns: cols.map((c) => ({
          name: String(c.name),
          type: String(c.type),
          pk: Number(c.pk) > 0,
          notNull: Number(c.notnull) > 0,
        })),
      });
    }
    return tables;
  }
}

function asRecords(result: QueryResult): Array<Record<string, SqlValue>> {
  return result.rows.map((row) =>
    Object.fromEntries(result.columns.map((col, i) => [col, row[i]])),
  );
}
