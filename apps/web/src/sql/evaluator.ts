// Pure evaluation logic — compares the *results* of the player query and the
// reference query, never the SQL text. Portable: depends only on data types.
import type { QueryResult, RunResult, SqlValue } from "./sql-runtime";

const NULL_SENTINEL = "␀NULL";

export type EvaluationResult =
  | { passed: true; earnedXp: number }
  | {
      passed: false;
      reason: "SQL_ERROR" | "INCORRECT_COLUMNS" | "INCORRECT_ROWS";
      message: string;
    };

export function evaluate(
  playerRun: RunResult,
  referenceRun: RunResult,
  expectedColumns: string[],
  xp: number,
): EvaluationResult {
  if (!playerRun.ok) {
    return { passed: false, reason: "SQL_ERROR", message: playerRun.error };
  }
  if (!referenceRun.ok) {
    return {
      passed: false,
      reason: "SQL_ERROR",
      message: `Mission bug — reference query failed: ${referenceRun.error}`,
    };
  }

  const player = lastResult(playerRun.results);
  const reference = lastResult(referenceRun.results);
  if (!reference) {
    return {
      passed: false,
      reason: "SQL_ERROR",
      message: "Mission bug — reference query returned nothing.",
    };
  }
  if (!player) {
    return {
      passed: false,
      reason: "INCORRECT_ROWS",
      message:
        "Your query returned no result set. Run a SELECT that produces rows.",
    };
  }

  const expected = normalizeColumns(expectedColumns);
  const got = normalizeColumns(player.columns);
  const missing = expected.filter((c) => !got.includes(c));
  const extra = got.filter((c) => !expected.includes(c));
  if (missing.length > 0 || extra.length > 0) {
    const parts = [`Expected columns: ${expected.join(", ")}.`];
    if (missing.length > 0) parts.push(`Missing: ${missing.join(", ")}.`);
    if (extra.length > 0) parts.push(`Unexpected: ${extra.join(", ")}.`);
    parts.push("Use AS to alias columns to the expected names.");
    return {
      passed: false,
      reason: "INCORRECT_COLUMNS",
      message: parts.join(" "),
    };
  }

  const playerRows = normalizeRows(player, expected);
  const referenceRows = normalizeRows(reference, expected);
  if (playerRows.length !== referenceRows.length) {
    return {
      passed: false,
      reason: "INCORRECT_ROWS",
      message: `The columns are right, but you returned ${playerRows.length} row(s) and the ledger says there should be ${referenceRows.length}. Check your JOIN and WHERE conditions.`,
    };
  }
  for (let i = 0; i < playerRows.length; i++) {
    if (playerRows[i] !== referenceRows[i]) {
      return {
        passed: false,
        reason: "INCORRECT_ROWS",
        message:
          "Right columns and row count, but some values don't match the guild ledger. Check which table each column should come from.",
      };
    }
  }
  return { passed: true, earnedXp: xp };
}

/** Player scripts may contain several statements; the answer is the last result set. */
function lastResult(results: QueryResult[]): QueryResult | null {
  return results.length > 0 ? results[results.length - 1] : null;
}

function normalizeColumns(columns: string[]): string[] {
  return columns.map((column) => column.trim().toLowerCase());
}

function normalizeRows(result: QueryResult, columnOrder: string[]): string[] {
  const columns = normalizeColumns(result.columns);
  const indices = columnOrder.map((column) => columns.indexOf(column));
  return result.rows
    .map((row) =>
      indices
        .map((index) =>
          index === -1 ? NULL_SENTINEL : normalizeValue(row[index]),
        )
        .join("␟"),
    )
    .sort();
}

function normalizeValue(value: SqlValue): string {
  if (value === null || value === undefined) return NULL_SENTINEL;
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? String(value)
      : String(Math.round(value * 1e9) / 1e9);
  }
  if (value instanceof Uint8Array) return `blob:${Array.from(value).join(",")}`;
  return String(value);
}
