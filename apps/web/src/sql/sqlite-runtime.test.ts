import { describe, expect, it } from "vitest";
import type { QueryResult } from "./sql-runtime";
import type { RuntimeClock, SqlWorkerAdapter } from "./sqlite-runtime";
import { SqliteRuntime } from "./sqlite-runtime";
import type {
  SqliteWorkerRequest,
  SqliteWorkerResponse,
} from "./sqlite-worker-protocol";

class ManualClock implements RuntimeClock {
  private nextTimerId = 1;
  private readonly timers = new Map<number, () => void>();

  setTimeout(callback: () => void): number {
    const timerId = this.nextTimerId;
    this.nextTimerId += 1;
    this.timers.set(timerId, callback);
    return timerId;
  }

  clearTimeout(timerId: number): void {
    this.timers.delete(timerId);
  }

  fireNext(): void {
    const timer = this.timers.entries().next().value;
    if (!timer) {
      throw new Error("Expected a pending timer.");
    }
    const [timerId, callback] = timer;
    this.timers.delete(timerId);
    callback();
  }
}

class ControlledWorker implements SqlWorkerAdapter {
  readonly requests: SqliteWorkerRequest[] = [];
  private messageListener: ((response: SqliteWorkerResponse) => void) | null =
    null;

  onMessage(listener: (response: SqliteWorkerResponse) => void): void {
    this.messageListener = listener;
  }

  onError(listener: (message: string) => void): void {
    void listener;
  }

  postMessage(request: SqliteWorkerRequest): void {
    this.requests.push(request);
  }

  terminate(): void {}

  succeedLastRequest(results: QueryResult[] = []): void {
    const request = this.requests.at(-1);
    if (!request || !this.messageListener) {
      throw new Error("Expected a worker request and message listener.");
    }
    this.messageListener({
      id: request.id,
      ok: true,
      results,
      durationMs: 0,
    });
  }

  failLastRequest(error: string): void {
    const request = this.requests.at(-1);
    if (!request || !this.messageListener) {
      throw new Error("Expected a worker request and message listener.");
    }
    this.messageListener({
      id: request.id,
      ok: false,
      error,
      errorKind: "runtime",
    });
  }
}

describe("Worker-backed SQLite runtime", () => {
  it("settles an interrupted query only after restoring the database", async () => {
    const clock = new ManualClock();
    const workers: ControlledWorker[] = [];
    const runtime = new SqliteRuntime({
      clock,
      createWorker: () => {
        const worker = new ControlledWorker();
        workers.push(worker);
        return worker;
      },
      queryTimeoutMs: 10,
      initTimeoutMs: 20,
    });

    const opening = runtime.init("CREATE TABLE answers (value INTEGER);", "");
    await Promise.resolve();
    workers[0].succeedLastRequest();
    await opening;

    let settled = false;
    const running = runtime.run("WITH RECURSIVE forever AS (...) SELECT 1;");
    void running.then(() => {
      settled = true;
    });
    await Promise.resolve();
    clock.fireNext();
    await Promise.resolve();

    expect(workers).toHaveLength(2);
    expect(workers[1].requests.at(-1)).toMatchObject({ kind: "init" });
    expect(settled).toBe(false);

    workers[1].succeedLastRequest();
    await expect(running).resolves.toEqual({
      ok: false,
      error:
        "Query interrupted after 10ms. The database has been restored — simplify the query and try again.",
      errorKind: "interrupted",
    });

    runtime.dispose();
  });

  it("serializes operations within one runtime", async () => {
    const clock = new ManualClock();
    const worker = new ControlledWorker();
    const runtime = new SqliteRuntime({
      clock,
      createWorker: () => worker,
    });

    const opening = runtime.init("CREATE TABLE answers (value INTEGER);", "");
    await Promise.resolve();
    worker.succeedLastRequest();
    await opening;

    const first = runtime.run("SELECT 1 AS value;");
    const second = runtime.run("SELECT 2 AS value;");
    await Promise.resolve();

    expect(worker.requests).toHaveLength(2);
    expect(worker.requests.at(-1)).toMatchObject({
      kind: "run",
      sql: "SELECT 1 AS value;",
    });

    worker.succeedLastRequest([{ columns: ["value"], rows: [[1]] }]);
    await expect(first).resolves.toMatchObject({ ok: true });
    await Promise.resolve();

    expect(worker.requests).toHaveLength(3);
    expect(worker.requests.at(-1)).toMatchObject({
      kind: "run",
      sql: "SELECT 2 AS value;",
    });

    worker.succeedLastRequest([{ columns: ["value"], rows: [[2]] }]);
    await expect(second).resolves.toMatchObject({ ok: true });

    runtime.dispose();
  });

  it("reports restoration failures as runtime errors", async () => {
    const clock = new ManualClock();
    const workers: ControlledWorker[] = [];
    const runtime = new SqliteRuntime({
      clock,
      createWorker: () => {
        const worker = new ControlledWorker();
        workers.push(worker);
        return worker;
      },
      queryTimeoutMs: 10,
      initTimeoutMs: 20,
    });

    const opening = runtime.init("CREATE TABLE answers (value INTEGER);", "");
    await Promise.resolve();
    workers[0].succeedLastRequest();
    await opening;

    const running = runtime.run("SELECT slow_operation();");
    await Promise.resolve();
    clock.fireNext();
    await Promise.resolve();
    workers[1].failLastRequest("seed replay failed");

    await expect(running).resolves.toEqual({
      ok: false,
      error:
        "Query interrupted after 10ms, and the database could not be restored: seed replay failed",
      errorKind: "runtime",
    });
    runtime.dispose();
  });
});
