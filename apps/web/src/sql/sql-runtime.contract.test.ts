import { describe, expect, it } from "vitest";
import { InMemorySqliteRuntime } from "../test/in-memory-sqlite-runtime";
import type { SqlRuntime } from "./sql-runtime";
import type { RuntimeClock, SqlWorkerAdapter } from "./sqlite-runtime";
import { SqliteRuntime } from "./sqlite-runtime";
import type {
  SqliteWorkerRequest,
  SqliteWorkerResponse,
} from "./sqlite-worker-protocol";

const schemaSql = `
  CREATE TABLE answers (
    id INTEGER PRIMARY KEY,
    label TEXT NOT NULL
  );
`;

async function expectSqliteRuntimeContract(runtime: SqlRuntime): Promise<void> {
  const opening = runtime.init(
    schemaSql,
    "INSERT INTO answers VALUES (1, 'known');",
  );
  const running = runtime.run("SELECT label FROM answers;");
  await opening;
  await expect(running).resolves.toEqual({
    ok: true,
    results: [{ columns: ["label"], rows: [["known"]] }],
    durationMs: 0,
  });

  await expect(
    runtime.run("SELECT label FROM missing;"),
  ).resolves.toMatchObject({ ok: false, errorKind: "sql" });

  await expect(runtime.tables()).resolves.toEqual([
    {
      name: "answers",
      columns: [
        { name: "id", type: "INTEGER", pk: true, notNull: false },
        { name: "label", type: "TEXT", pk: false, notNull: true },
      ],
    },
  ]);

  runtime.dispose();
}

class RealClock implements RuntimeClock {
  private nextTimerId = 1;
  private readonly timers = new Map<
    number,
    ReturnType<typeof globalThis.setTimeout>
  >();

  setTimeout(callback: () => void, timeoutMs: number): number {
    const timerId = this.nextTimerId;
    this.nextTimerId += 1;
    this.timers.set(timerId, globalThis.setTimeout(callback, timeoutMs));
    return timerId;
  }

  clearTimeout(timerId: number): void {
    const timer = this.timers.get(timerId);
    if (timer) {
      globalThis.clearTimeout(timer);
      this.timers.delete(timerId);
    }
  }
}

class LoopbackSqlWorker implements SqlWorkerAdapter {
  private readonly runtime = new InMemorySqliteRuntime();
  private messageListener: ((response: SqliteWorkerResponse) => void) | null =
    null;
  private errorListener: ((message: string) => void) | null = null;

  onMessage(listener: (response: SqliteWorkerResponse) => void): void {
    this.messageListener = listener;
  }

  onError(listener: (message: string) => void): void {
    this.errorListener = listener;
  }

  postMessage(request: SqliteWorkerRequest): void {
    void this.handle(request);
  }

  terminate(): void {
    this.runtime.dispose();
  }

  private async handle(request: SqliteWorkerRequest): Promise<void> {
    try {
      if (request.kind === "init") {
        await this.runtime.init(request.schemaSql, request.seedSql);
        this.respond({
          id: request.id,
          ok: true,
          results: [],
          durationMs: 0,
        });
        return;
      }
      if (request.kind === "reset") {
        await this.runtime.reset();
        this.respond({
          id: request.id,
          ok: true,
          results: [],
          durationMs: 0,
        });
        return;
      }

      const result = await this.runtime.run(request.sql);
      this.respond(
        result.ok
          ? { id: request.id, ...result }
          : {
              id: request.id,
              ok: false,
              error: result.error,
              errorKind: result.errorKind === "sql" ? "sql" : "runtime",
            },
      );
    } catch (error) {
      this.errorListener?.(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private respond(response: SqliteWorkerResponse): void {
    if (!this.messageListener) {
      throw new Error("Expected the worker message listener to be installed.");
    }
    this.messageListener(response);
  }
}

const runtimeFactories: Array<{
  name: string;
  create: () => SqlRuntime;
}> = [
  {
    name: "in-memory adapter",
    create: () => new InMemorySqliteRuntime(),
  },
  {
    name: "worker-backed adapter",
    create: () =>
      new SqliteRuntime({
        createWorker: () => new LoopbackSqlWorker(),
        clock: new RealClock(),
      }),
  },
];

describe.each(runtimeFactories)("$name", ({ create }) => {
  it("satisfies the SQLite runtime contract", async () => {
    await expectSqliteRuntimeContract(create());
  });
});
