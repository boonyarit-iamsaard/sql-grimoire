import type { TableInfo } from "../sql/sql-runtime";

interface SchemaExplorerProps {
  tables: TableInfo[];
}

export function SchemaExplorer({ tables }: Readonly<SchemaExplorerProps>) {
  return (
    <aside className="rounded-xl border-2 border-ctp-surface1 bg-ctp-base p-3.5 shadow-paper">
      <h2 className="mb-2.5 text-[1.05rem]">📜 Guild Ledger Schema</h2>
      {tables.length === 0 && (
        <p className="px-1 py-2 text-ctp-subtext0 italic">
          Opening the ledger…
        </p>
      )}
      {tables.map((table) => (
        <div className="mb-3" key={table.name}>
          <div className="mb-1 flex items-center gap-1.5 font-mono text-ctp-yellow text-mono">
            ▦ {table.name}
          </div>
          <ul className="m-0 list-none border-ctp-surface2 border-l border-dotted p-0 pl-3">
            {table.columns.map((col) => (
              <li
                className="flex items-baseline gap-1.5 py-px font-mono text-ctp-subtext1 text-mono"
                key={col.name}
              >
                {col.name}
                <span className="text-[11px] text-ctp-overlay1">
                  {col.type.toLowerCase()}
                </span>
                {col.pk && (
                  <span className="text-[11px] text-ctp-yellow">PK</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
