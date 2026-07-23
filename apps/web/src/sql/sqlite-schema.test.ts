import { describe, expect, it } from "vitest";
import { readSqliteTables } from "./sqlite-schema";

describe("SQLite schema introspection", () => {
  it("returns an empty list only when SQLite has no user tables", async () => {
    await expect(
      readSqliteTables(async () => ({
        ok: true,
        results: [{ columns: ["name"], rows: [] }],
        durationMs: 0,
      })),
    ).resolves.toEqual([]);
  });

  it("rejects runtime and SQL failures", async () => {
    await expect(
      readSqliteTables(async () => ({
        ok: false,
        error: "worker unavailable",
        errorKind: "runtime",
      })),
    ).rejects.toThrow("Could not read SQLite table names: worker unavailable");
  });

  it("rejects a missing introspection result set", async () => {
    await expect(
      readSqliteTables(async () => ({
        ok: true,
        results: [],
        durationMs: 0,
      })),
    ).rejects.toThrow(
      "Could not read SQLite table names: SQLite returned no result set.",
    );
  });
});
