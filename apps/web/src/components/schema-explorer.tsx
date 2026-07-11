import type { TableInfo } from "../sql/sql-runtime";

interface SchemaExplorerProps {
  tables: TableInfo[];
}

export function SchemaExplorer({ tables }: Readonly<SchemaExplorerProps>) {
  return (
    <aside className="panel schema-explorer">
      <h2>📜 Guild Ledger Schema</h2>
      {tables.length === 0 && (
        <p className="result-empty">Opening the ledger…</p>
      )}
      {tables.map((table) => (
        <div className="schema-table" key={table.name}>
          <div className="table-name">▦ {table.name}</div>
          <ul>
            {table.columns.map((col) => (
              <li key={col.name}>
                {col.name}
                <span className="col-type">{col.type.toLowerCase()}</span>
                {col.pk && <span className="col-pk">PK</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
