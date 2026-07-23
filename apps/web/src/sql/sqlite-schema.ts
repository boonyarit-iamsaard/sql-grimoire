import type {
  QueryResult,
  RunResult,
  SqlValue,
  TableInfo,
} from "./sql-runtime";

type RunSql = (sql: string) => Promise<RunResult>;

export async function readSqliteTables(runSql: RunSql): Promise<TableInfo[]> {
  const names = await requireResult(
    runSql(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    ),
    "read SQLite table names",
  );
  const tables: TableInfo[] = [];

  for (const row of names.rows) {
    const name = String(row[0]);
    const info = await requireResult(
      runSql(`PRAGMA table_info(${quoteIdentifier(name)})`),
      `read SQLite table ${name}`,
    );
    const columns = asRecords(info).map((column) => ({
      name: String(column.name),
      type: String(column.type),
      pk: Number(column.pk) > 0,
      notNull: Number(column.notnull) > 0,
    }));
    tables.push({ name, columns });
  }

  return tables;
}

// SQLite escapes a double quote inside a quoted identifier by doubling it,
// which is not the backslash escape JSON.stringify would produce.
function quoteIdentifier(name: string): string {
  return `"${name.replaceAll('"', '""')}"`;
}

async function requireResult(
  run: Promise<RunResult>,
  operation: string,
): Promise<QueryResult> {
  const result = await run;
  if (!result.ok) {
    throw new Error(`Could not ${operation}: ${result.error}`);
  }
  const queryResult = result.results.at(-1);
  if (!queryResult) {
    throw new Error(`Could not ${operation}: SQLite returned no result set.`);
  }
  return queryResult;
}

function asRecords(result: QueryResult): Array<Record<string, SqlValue>> {
  return result.rows.map((row) =>
    Object.fromEntries(
      result.columns.map((column, index) => [column, row[index]]),
    ),
  );
}
