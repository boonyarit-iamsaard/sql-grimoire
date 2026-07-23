import { SerializedOperations } from "./serialized-operations";
import type {
  QueryResult,
  RunResult,
  SqlRuntime,
  SqlValue,
  TableInfo,
} from "./sql-runtime";
import { readSqliteTables } from "./sqlite-schema";
import type {
  SqliteWorkerCommand,
  SqliteWorkerRequest,
  SqliteWorkerResponse,
} from "./sqlite-worker-protocol";
import { requestWithId } from "./sqlite-worker-protocol";

const DEFAULT_QUERY_TIMEOUT_MS = 2000;
const DEFAULT_INIT_TIMEOUT_MS = 15000;

export interface RuntimeClock {
  setTimeout(callback: () => void, timeoutMs: number): number;
  clearTimeout(timerId: number): void;
}

export interface SqlWorkerAdapter {
  onMessage(listener: (response: SqliteWorkerResponse) => void): void;
  onError(listener: (message: string) => void): void;
  postMessage(request: SqliteWorkerRequest): void;
  terminate(): void;
}

export interface SqliteRuntimeOptions {
  createWorker: () => SqlWorkerAdapter;
  clock: RuntimeClock;
  queryTimeoutMs?: number;
  initTimeoutMs?: number;
}

interface PendingOperation {
  resolve: (result: RunResult) => void;
  timerId: number;
}

export class SqliteRuntime implements SqlRuntime {
  private readonly createWorker: () => SqlWorkerAdapter;
  private readonly clock: RuntimeClock;
  private readonly queryTimeoutMs: number;
  private readonly initTimeoutMs: number;
  private worker: SqlWorkerAdapter | null = null;
  private nextId = 1;
  private readonly pending = new Map<number, PendingOperation>();
  private readonly operations = new SerializedOperations();
  private schemaSql = "";
  private seedSql = "";
  private disposed = false;

  constructor(options: SqliteRuntimeOptions) {
    this.createWorker = options.createWorker;
    this.clock = options.clock;
    this.queryTimeoutMs = options.queryTimeoutMs ?? DEFAULT_QUERY_TIMEOUT_MS;
    this.initTimeoutMs = options.initTimeoutMs ?? DEFAULT_INIT_TIMEOUT_MS;
  }

  async init(schemaSql: string, seedSql: string): Promise<void> {
    return this.operations.run(async () => {
      this.schemaSql = schemaSql;
      this.seedSql = seedSql;
      const result = await this.sendNow(
        { kind: "init", schemaSql, seedSql },
        this.initTimeoutMs,
        false,
      );
      if (!result.ok) {
        throw new Error(result.error);
      }
    });
  }

  run(sql: string): Promise<RunResult> {
    return this.operations.run(() =>
      this.sendNow({ kind: "run", sql }, this.queryTimeoutMs, true),
    );
  }

  async reset(): Promise<void> {
    return this.operations.run(async () => {
      const result = await this.sendNow(
        { kind: "reset" },
        this.queryTimeoutMs,
        true,
      );
      if (!result.ok) {
        throw new Error(result.error);
      }
    });
  }

  tables(): Promise<TableInfo[]> {
    return this.operations.run(() =>
      readSqliteTables((sql) =>
        this.sendNow({ kind: "run", sql }, this.queryTimeoutMs, true),
      ),
    );
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.terminateWorker();
    this.resolvePending({
      ok: false,
      error: "Runtime disposed",
      errorKind: "runtime",
    });
  }

  private sendNow(
    command: SqliteWorkerCommand,
    timeoutMs: number,
    recoverAfterTimeout: boolean,
  ): Promise<RunResult> {
    if (this.disposed) {
      return Promise.resolve({
        ok: false,
        error: "Runtime disposed",
        errorKind: "runtime",
      });
    }

    this.worker ??= this.spawnWorker();
    const id = this.nextId;
    this.nextId += 1;

    return new Promise((resolve) => {
      const timerId = this.clock.setTimeout(() => {
        if (recoverAfterTimeout) {
          void this.interruptAndRestore(id, timeoutMs, resolve);
          return;
        }
        this.pending.delete(id);
        this.terminateWorker();
        resolve({
          ok: false,
          error: `SQL runtime operation timed out after ${timeoutMs}ms.`,
          errorKind: "runtime",
        });
      }, timeoutMs);
      this.pending.set(id, { resolve, timerId });
      this.worker?.postMessage(requestWithId(id, command));
    });
  }

  private spawnWorker(): SqlWorkerAdapter {
    const worker = this.createWorker();
    worker.onMessage((response) => {
      const operation = this.pending.get(response.id);
      if (!operation) {
        return;
      }
      this.pending.delete(response.id);
      this.clock.clearTimeout(operation.timerId);
      operation.resolve(
        response.ok
          ? {
              ok: true,
              results: response.results,
              durationMs: response.durationMs,
            }
          : {
              ok: false,
              error: response.error,
              errorKind: response.errorKind,
            },
      );
    });
    worker.onError((message) => {
      this.terminateWorker();
      this.resolvePending({
        ok: false,
        error: `SQL worker failed to start: ${message || "unknown error"}`,
        errorKind: "runtime",
      });
    });
    return worker;
  }

  private async interruptAndRestore(
    id: number,
    timeoutMs: number,
    resolve: (result: RunResult) => void,
  ): Promise<void> {
    const operation = this.pending.get(id);
    if (!operation) {
      return;
    }
    this.pending.delete(id);
    this.clock.clearTimeout(operation.timerId);
    this.terminateWorker();

    const restored = await this.sendNow(
      {
        kind: "init",
        schemaSql: this.schemaSql,
        seedSql: this.seedSql,
      },
      this.initTimeoutMs,
      false,
    );
    if (!restored.ok) {
      resolve({
        ok: false,
        error: `Query interrupted after ${timeoutMs}ms, and the database could not be restored: ${restored.error}`,
        errorKind: "runtime",
      });
      return;
    }

    resolve({
      ok: false,
      error: `Query interrupted after ${timeoutMs}ms. The database has been restored — simplify the query and try again.`,
      errorKind: "interrupted",
    });
  }

  private terminateWorker(): void {
    this.worker?.terminate();
    this.worker = null;
  }

  private resolvePending(result: RunResult): void {
    for (const operation of this.pending.values()) {
      this.clock.clearTimeout(operation.timerId);
      operation.resolve(result);
    }
    this.pending.clear();
  }
}

class BrowserSqlWorker implements SqlWorkerAdapter {
  private readonly worker = new Worker(
    new URL("./sql.worker.ts", import.meta.url),
    { type: "module" },
  );
  private messageListener: ((response: SqliteWorkerResponse) => void) | null =
    null;
  private errorListener: ((message: string) => void) | null = null;

  constructor() {
    this.worker.onmessage = (event: MessageEvent<unknown>) => {
      const response = parseWorkerResponse(event.data);
      if (!response) {
        this.errorListener?.("SQL worker returned an invalid response.");
        return;
      }
      this.messageListener?.(response);
    };
    this.worker.onerror = (event) => {
      event.preventDefault();
      this.errorListener?.(event.message);
    };
  }

  onMessage(listener: (response: SqliteWorkerResponse) => void): void {
    this.messageListener = listener;
  }

  onError(listener: (message: string) => void): void {
    this.errorListener = listener;
  }

  postMessage(request: SqliteWorkerRequest): void {
    this.worker.postMessage(request);
  }

  terminate(): void {
    this.worker.terminate();
  }
}

const browserClock: RuntimeClock = {
  setTimeout: (callback, timeoutMs) => window.setTimeout(callback, timeoutMs),
  clearTimeout: (timerId) => window.clearTimeout(timerId),
};

export function createBrowserSqliteRuntime(): SqliteRuntime {
  return new SqliteRuntime({
    createWorker: () => new BrowserSqlWorker(),
    clock: browserClock,
  });
}

function parseWorkerResponse(value: unknown): SqliteWorkerResponse | null {
  if (!isRecord(value) || typeof value.id !== "number") {
    return null;
  }
  if (value.ok === true) {
    const results = parseQueryResults(value.results);
    if (!results) {
      return null;
    }
    return {
      id: value.id,
      ok: true,
      results,
      durationMs: typeof value.durationMs === "number" ? value.durationMs : 0,
    };
  }
  if (
    value.ok === false &&
    typeof value.error === "string" &&
    (value.errorKind === "sql" || value.errorKind === "runtime")
  ) {
    return {
      id: value.id,
      ok: false,
      error: value.error,
      errorKind: value.errorKind,
    };
  }
  return null;
}

function parseQueryResults(value: unknown): QueryResult[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const results: QueryResult[] = [];
  for (const candidate of value) {
    const result = parseQueryResult(candidate);
    if (!result) {
      return null;
    }
    results.push(result);
  }
  return results;
}

function parseQueryResult(value: unknown): QueryResult | null {
  if (
    !isRecord(value) ||
    !Array.isArray(value.columns) ||
    !value.columns.every((column) => typeof column === "string") ||
    !Array.isArray(value.rows)
  ) {
    return null;
  }
  const rows: SqlValue[][] = [];
  for (const candidate of value.rows) {
    if (!Array.isArray(candidate) || !candidate.every(isSqlValue)) {
      return null;
    }
    rows.push(candidate);
  }
  return { columns: value.columns, rows };
}

function isSqlValue(value: unknown): value is SqlValue {
  return (
    value === null ||
    typeof value === "number" ||
    typeof value === "string" ||
    value instanceof Uint8Array
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
