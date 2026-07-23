// Web Worker that owns the sql.js database. Running SQL off the main thread
// lets the app terminate this worker to interrupt a runaway query.

import type { Database } from "sql.js";
import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import type {
  SqliteWorkerRequest,
  SqliteWorkerResponse,
} from "./sqlite-worker-protocol";

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

self.onmessage = async (event: MessageEvent<SqliteWorkerRequest>) => {
  const msg = event.data;
  const SQL = await sqlJs;
  try {
    if (msg.kind === "init") {
      schemaSql = msg.schemaSql;
      seedSql = msg.seedSql;
      createDb(SQL);
      post({ id: msg.id, ok: true, results: [], durationMs: 0 });
    } else if (msg.kind === "reset") {
      createDb(SQL);
      post({ id: msg.id, ok: true, results: [], durationMs: 0 });
    } else {
      if (!db) {
        throw new Error("Database not initialized");
      }
      const started = performance.now();
      const results = db
        .exec(msg.sql)
        .map((r) => ({ columns: r.columns, rows: r.values }));
      post({
        id: msg.id,
        ok: true,
        results,
        durationMs: performance.now() - started,
      });
    }
  } catch (error) {
    post({
      id: msg.id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      errorKind: msg.kind === "run" && db ? "sql" : "runtime",
    });
  }
};

function post(response: SqliteWorkerResponse): void {
  self.postMessage(response);
}
