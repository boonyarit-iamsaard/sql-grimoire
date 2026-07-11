import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { sql, SQLite } from "@codemirror/lang-sql";
import { catppuccinMacchiato } from "@catppuccin/codemirror";

/** Read-only, syntax-highlighted SQL block — same theme as the editor. */
export function SqlCodeBlock({ code }: { code: string }) {
  return (
    <div className="sql-code-block">
      <CodeMirror
        value={code.trim()}
        theme={catppuccinMacchiato}
        editable={false}
        basicSetup={false}
        extensions={[sql({ dialect: SQLite }), EditorView.lineWrapping]}
      />
    </div>
  );
}
