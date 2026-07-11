import { useMemo } from "react";
import type { QueryResult, SqlValue } from "../sql/sql-runtime";

interface QueryResultTableProps {
  result: QueryResult;
  durationMs?: number;
}

function renderValue(value: SqlValue) {
  if (value === null) {
    return <span className="null-value">NULL</span>;
  }
  if (value instanceof Uint8Array) {
    return <span className="null-value">[blob]</span>;
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
    <div className="panel result-panel">
      <h2>
        Query Result{" "}
        <span className="result-meta">
          {result.rows.length} row{result.rows.length === 1 ? "" : "s"}
          {durationMs !== undefined && ` · ${durationMs.toFixed(1)}ms`}
        </span>
      </h2>
      {result.rows.length === 0 ? (
        <p className="result-empty">The query ran but returned no rows.</p>
      ) : (
        <div className="result-scroll">
          <table className="result-table">
            <thead>
              <tr>
                {result.columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, ri) => (
                <tr key={rowIds[ri]}>
                  {row.map((cell, ci) => (
                    <td key={colIds[ci]}>{renderValue(cell)}</td>
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
