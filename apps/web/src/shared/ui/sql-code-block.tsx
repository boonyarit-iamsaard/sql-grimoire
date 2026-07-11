import { catppuccinMacchiato } from "@catppuccin/codemirror";
import { SQLite, sql } from "@codemirror/lang-sql";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";

/** Read-only, syntax-highlighted SQL block — same theme as the editor. */
interface SqlCodeBlockProps {
  code: string;
}

export function SqlCodeBlock({ code }: Readonly<SqlCodeBlockProps>) {
  return (
    <div className="my-1.5 overflow-hidden rounded-lg border border-ctp-surface1 [&_.cm-content]:px-1 [&_.cm-content]:py-2.5">
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
