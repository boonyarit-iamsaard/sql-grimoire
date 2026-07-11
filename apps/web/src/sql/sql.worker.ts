// Web Worker that owns the sql.js database. Running SQL off the main thread
// lets the app terminate this worker to interrupt a runaway query.
import initSqlJs, { type Database } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

type Request =
  | { id: number; kind: "init"; schemaSql: string; seedSql: string }
  | { id: number; kind: "run"; sql: string }
  | { id: number; kind: "reset" };

let db: Database | null = null;
let schemaSql = "";
let seedSql = "";

const sqlJs = initSqlJs({ locateFile: () => wasmUrl });

function createDb(SQL: Awaited<typeof sqlJs>) {
  db?.close();
  db = new SQL.Database();
  db.run(schemaSql);
  db.run(seedSql);
}

self.onmessage = async (event: MessageEvent<Request>) => {
  const msg = event.data;
  const SQL = await sqlJs;
  try {
    if (msg.kind === "init") {
      schemaSql = msg.schemaSql;
      seedSql = msg.seedSql;
      createDb(SQL);
      self.postMessage({ id: msg.id, ok: true, results: [] });
    } else if (msg.kind === "reset") {
      createDb(SQL);
      self.postMessage({ id: msg.id, ok: true, results: [] });
    } else {
      if (!db) throw new Error("Database not initialized");
      const started = performance.now();
      const results = db.exec(msg.sql).map((r) => ({ columns: r.columns, rows: r.values }));
      self.postMessage({
        id: msg.id,
        ok: true,
        results,
        durationMs: performance.now() - started,
      });
    }
  } catch (error) {
    self.postMessage({ id: msg.id, ok: false, error: String((error as Error).message ?? error) });
  }
};
