import { describe, expect, it } from "vitest";
import { InMemorySqliteRuntime } from "./in-memory-sqlite-runtime";

describe("In-memory SQLite runtime", () => {
  it("preserves the initialized database when replacement setup fails", async () => {
    const runtime = new InMemorySqliteRuntime();
    await runtime.init(
      "CREATE TABLE answers (value INTEGER);",
      "INSERT INTO answers VALUES (42);",
    );

    await expect(
      runtime.init(
        "CREATE TABLE replacement (value INTEGER);",
        "INSERT INTO missing VALUES (1);",
      ),
    ).rejects.toThrow("no such table: missing");

    await expect(
      runtime.run("SELECT value FROM answers;"),
    ).resolves.toMatchObject({
      ok: true,
      results: [{ columns: ["value"], rows: [[42]] }],
    });

    await runtime.reset();
    await expect(
      runtime.run("SELECT value FROM answers;"),
    ).resolves.toMatchObject({
      ok: true,
      results: [{ columns: ["value"], rows: [[42]] }],
    });
    runtime.dispose();
  });
});
