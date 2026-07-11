import CodeMirror from "@uiw/react-codemirror";
import { sql, SQLite } from "@codemirror/lang-sql";
import { catppuccinMacchiato } from "@catppuccin/codemirror";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SqlEditor({ value, onChange }: Props) {
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
