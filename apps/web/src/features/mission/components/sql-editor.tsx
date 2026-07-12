import { catppuccinMacchiato } from "@catppuccin/codemirror";
import { SQLite, sql } from "@codemirror/lang-sql";
import CodeMirror, { keymap, Prec } from "@uiw/react-codemirror";

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Cmd/Ctrl+Enter — the universal SQL-tool "run" accelerator. */
  onRun?: () => void;
  /** Cmd/Ctrl+Shift+Enter — submit the current answer. */
  onSubmit?: () => void;
}

export function SqlEditor({
  value,
  onChange,
  onRun,
  onSubmit,
}: Readonly<SqlEditorProps>) {
  // Prec.highest so the run/submit chords win over any default Enter binding.
  const runKeymap = Prec.highest(
    keymap.of([
      {
        key: "Mod-Enter",
        preventDefault: true,
        run: () => {
          onRun?.();
          return true;
        },
      },
      {
        key: "Mod-Shift-Enter",
        preventDefault: true,
        run: () => {
          onSubmit?.();
          return true;
        },
      },
    ]),
  );

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={catppuccinMacchiato}
      height="220px"
      extensions={[
        sql({ dialect: SQLite, upperCaseKeywords: true }),
        runKeymap,
      ]}
      basicSetup={{ autocompletion: true, foldGutter: false }}
      placeholder="-- Write your SQL here, then press ⌘/Ctrl+Enter to run"
    />
  );
}
