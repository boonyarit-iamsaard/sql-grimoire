import { catppuccinMacchiato } from "@catppuccin/codemirror";
import { SQLite, sql } from "@codemirror/lang-sql";
import CodeMirror from "@uiw/react-codemirror";

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function SqlEditor({ value, onChange }: Readonly<SqlEditorProps>) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={catppuccinMacchiato}
      height="220px"
      extensions={[sql({ dialect: SQLite, upperCaseKeywords: true })]}
      basicSetup={{ autocompletion: true, foldGutter: false }}
      placeholder="-- Write your SQL here, then Run Query"
    />
  );
}
