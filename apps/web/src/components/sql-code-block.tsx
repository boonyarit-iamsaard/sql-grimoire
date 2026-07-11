import { catppuccinMacchiato } from "@catppuccin/codemirror";
import { SQLite, sql } from "@codemirror/lang-sql";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";

/** Read-only, syntax-highlighted SQL block — same theme as the editor. */
interface SqlCodeBlockProps {
  code: string;
}

export function SqlCodeBlock({ code }: Readonly<SqlCodeBlockProps>) {
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
