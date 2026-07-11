// Pure result normalization — no I/O, portable into the real codebase.
// Turns a query result into a canonical form so two results can be compared
// independent of column order, row order, and value formatting quirks.
import type { QueryResult, SqlValue } from "./sql-runtime";

const NULL_SENTINEL = "␀NULL";

export function normalizeColumns(columns: string[]): string[] {
  return columns.map((c) => c.trim().toLowerCase());
}

function normalizeValue(value: SqlValue): string {
  if (value === null || value === undefined) return NULL_SENTINEL;
  if (typeof value === "number") {
    // 1 and 1.0 compare equal; avoid float noise.
    return Number.isInteger(value) ? String(value) : String(Math.round(value * 1e9) / 1e9);
  }
  if (value instanceof Uint8Array) return `blob:${Array.from(value).join(",")}`;
  return String(value);
}

/**
 * Canonical row multiset: each row's values are re-ordered to match
 * `columnOrder` (lowercased names), serialized, then the rows are sorted so
 * comparison ignores row order while preserving duplicate-row counts.
 */
export function normalizeRows(result: QueryResult, columnOrder: string[]): string[] {
  const cols = normalizeColumns(result.columns);
  const indices = columnOrder.map((c) => cols.indexOf(c));
  return result.rows
    .map((row) => indices.map((i) => (i === -1 ? NULL_SENTINEL : normalizeValue(row[i]))).join("␟"))
    .sort();
}
