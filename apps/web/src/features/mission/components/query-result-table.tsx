import { useMemo } from "react";
import type { QueryResult, SqlValue } from "../../../sql/sql-runtime";

interface QueryResultTableProps {
  result: QueryResult;
  durationMs?: number;
}

function renderValue(value: SqlValue) {
  if (value === null) {
    return <span className="text-ctp-overlay2 italic">NULL</span>;
  }
  if (value instanceof Uint8Array) {
    return <span className="text-ctp-overlay2 italic">[blob]</span>;
  }
  return String(value);
}

export function QueryResultTable({
  result,
  durationMs,
}: Readonly<QueryResultTableProps>) {
  const rowIds = useMemo(
    () => result.rows.map(() => crypto.randomUUID()),
    [result],
  );
  const colIds = useMemo(
    () => result.columns.map(() => crypto.randomUUID()),
    [result],
  );

  return (
    <div className="rounded-xl border-2 border-ctp-surface1 bg-ctp-base px-3.5 py-3 shadow-paper motion-safe:animate-fade-in">
      <h2 className="mb-2 text-base">
        Query Result{" "}
        <span className="ml-2 font-mono text-ctp-overlay2 text-xs">
          {result.rows.length} row{result.rows.length === 1 ? "" : "s"}
          {durationMs !== undefined && ` · ${durationMs.toFixed(1)}ms`}
        </span>
      </h2>
      {result.rows.length === 0 ? (
        <p className="px-1 py-2 text-ctp-subtext0 italic">
          The query ran but returned no rows.
        </p>
      ) : (
        <div className="max-h-80 overflow-x-auto overflow-y-auto rounded-lg">
          <table className="w-full border-collapse font-mono text-mono">
            <thead>
              <tr>
                {result.columns.map((col) => (
                  <th
                    className="sticky top-0 whitespace-nowrap bg-ctp-surface0 px-3 py-1.75 text-left text-ctp-yellow"
                    key={col}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, ri) => (
                <tr
                  className="even:bg-[rgba(255,255,255,0.03)]"
                  key={rowIds[ri]}
                >
                  {row.map((cell, ci) => (
                    <td
                      className="whitespace-nowrap border-ctp-surface0 border-b px-3 py-1.5 text-ctp-text"
                      key={colIds[ci]}
                    >
                      {renderValue(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
