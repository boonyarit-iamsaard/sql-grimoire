import { useEffect, useRef, useState } from "react";
import { format } from "sql-formatter";
import { playClick, playMissionComplete } from "../../shared/audio/sound";
import { Button } from "../../shared/ui/button";
import type { EvaluationResult } from "../../sql/evaluator";
import type { QueryResult, TableInfo } from "../../sql/sql-runtime";
import { SqliteRuntime } from "../../sql/sqlite-runtime";
import { campaignCatalog } from "../campaign/campaign-catalog";
import { playerProgress } from "../progress/progress-store";
import { DialogueBox } from "./components/dialogue-box";
import { MissionFeedback } from "./components/mission-feedback";
import { QueryResultTable } from "./components/query-result-table";
import { SchemaExplorer } from "./components/schema-explorer";
import { SqlEditor } from "./components/sql-editor";
import { MissionAttempt } from "./mission-attempt";
import type { Mission } from "./mission-types";

type Phase = "briefing" | "workbench";

const briefingClasses =
  "flex min-h-screen flex-col items-center justify-center gap-[22px] p-6";
const sqlErrorClasses =
  "rounded-[10px] border-2 border-ctp-red bg-ctp-base px-4 py-3 font-mono text-mono whitespace-pre-wrap text-ctp-red motion-safe:animate-shake";

interface MissionScreenProps {
  missionId: string;
  onBack: () => void;
}

export function MissionScreen({
  missionId,
  onBack,
}: Readonly<MissionScreenProps>) {
  const mission = campaignCatalog.getMission(missionId);

  if (!mission) {
    return (
      <div className={briefingClasses}>
        <h1>Unknown mission</h1>
        <Button onClick={onBack}>Back to Map</Button>
      </div>
    );
  }

  return (
    <MissionAttemptScreen key={mission.id} mission={mission} onBack={onBack} />
  );
}

interface MissionAttemptScreenProps {
  mission: Mission;
  onBack: () => void;
}

function MissionAttemptScreen({
  mission,
  onBack,
}: Readonly<MissionAttemptScreenProps>) {
  const attemptRef = useRef<MissionAttempt | null>(null);
  const [phase, setPhase] = useState<Phase>("briefing");
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [query, setQuery] = useState(() =>
    playerProgress.lastQueryFor(mission.id),
  );
  const [result, setResult] = useState<{
    data: QueryResult;
    durationMs: number;
  } | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const runtime = new SqliteRuntime();
    const attempt = new MissionAttempt(mission, runtime);
    attemptRef.current = attempt;
    playerProgress.enterMission(mission.id);
    let disposed = false;
    attempt
      .open()
      .then((t) => {
        setTables(t);
        setDbReady(true);
      })
      .catch((error: Error) => {
        if (!disposed) {
          setInitError(error.message);
        }
      });
    return () => {
      disposed = true;
      attempt.dispose();
    };
  }, [mission]);

  const runQuery = async () => {
    const attempt = attemptRef.current;
    if (!attempt || busy) {
      return;
    }
    playClick();
    setBusy(true);
    setSqlError(null);
    playerProgress.recordLastQuery(mission.id, query);
    const run = await attempt.run(query);
    if (!run.ok) {
      setSqlError(run.error);
      setResult(null);
    } else {
      setSqlError(null);
      setResult({ data: run.data, durationMs: run.durationMs });
    }
    setBusy(false);
  };

  const submitAnswer = async () => {
    const attempt = attemptRef.current;
    if (!attempt || busy) {
      return;
    }
    playClick();
    setBusy(true);
    setSqlError(null);
    playerProgress.recordLastQuery(mission.id, query);
    const submission = await attempt.submit(query);
    if (submission.completion) {
      playMissionComplete();
      playerProgress.completeMission(submission.completion);
    }
    setEvaluation(submission.evaluation);
    setBusy(false);
  };

  const formatQuery = () => {
    playClick();
    try {
      setQuery(format(query, { language: "sqlite", keywordCase: "upper" }));
      setSqlError(null);
    } catch {
      // sql-formatter can't parse it — leave the text as typed; running the
      // query will surface the real SQLite error.
      setSqlError(
        "Couldn't format — the SQL isn't parseable yet. Run it to see the exact error.",
      );
    }
  };

  const resetDatabase = async () => {
    const attempt = attemptRef.current;
    if (!attempt || busy) {
      return;
    }
    playClick();
    setBusy(true);
    const reset = await attempt.reset();
    if (reset.ok) {
      setResult(null);
      setSqlError(null);
    } else {
      setSqlError(reset.error);
    }
    setBusy(false);
  };

  if (phase === "briefing") {
    return (
      <div className={briefingClasses}>
        <h1 className="m-0 text-[2rem]">{mission.title}</h1>
        <DialogueBox
          lines={mission.dialogue}
          finishLabel="Begin Investigation"
          onFinished={() => setPhase("workbench")}
        />
        <div className="w-[min(720px,100%)] rounded-xl border-2 border-ctp-surface1 bg-ctp-base px-5 py-3.5 text-base text-ctp-text shadow-paper">
          <strong className="font-display text-ctp-yellow">Objective:</strong>{" "}
          {mission.objective}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-5 pt-4 pb-8">
      <header className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-0.5 text-2xl">{mission.title} — Ledger Desk</h1>
          <p className="m-0 max-w-[72ch] text-ctp-subtext1">
            <strong className="text-ctp-yellow">Objective:</strong>{" "}
            {mission.objective}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            playClick();
            onBack();
          }}
        >
          ← Map
        </Button>
      </header>

      <div className="grid grid-cols-[250px_1fr] items-start gap-3.5 max-[1100px]:grid-cols-[210px_1fr]">
        <SchemaExplorer tables={tables} />

        <div className="flex min-w-0 flex-col gap-3">
          <div className="overflow-hidden rounded-xl border-2 border-ctp-surface1 bg-ctp-base shadow-paper">
            <SqlEditor value={query} onChange={setQuery} />
            <div className="flex flex-wrap gap-2.5 border-ctp-surface1 border-t bg-ctp-mantle px-3 py-2.5">
              <Button
                variant="primary"
                onClick={runQuery}
                disabled={busy || !dbReady}
              >
                ▶ Run Query
              </Button>
              <Button
                onClick={submitAnswer}
                disabled={busy || !dbReady || query.trim() === ""}
              >
                ⚑ Submit Answer
              </Button>
              <Button
                variant="ghost"
                onClick={formatQuery}
                disabled={query.trim() === ""}
              >
                ✎ Format
              </Button>
              <span className="flex-1" />
              <Button
                variant="ghost"
                onClick={() => {
                  playClick();
                  setHintIndex((i) =>
                    Math.min(i + 1, mission.challenge.hints.length - 1),
                  );
                }}
                disabled={hintIndex >= mission.challenge.hints.length - 1}
              >
                💡 Hint
              </Button>
              <Button
                variant="danger"
                onClick={resetDatabase}
                disabled={busy || !dbReady}
              >
                ⟲ Reset Database
              </Button>
            </div>
          </div>

          {initError && (
            <div className={sqlErrorClasses}>
              ⚠ The guild database failed to open: {initError}
            </div>
          )}

          {hintIndex >= 0 && (
            <div className="rounded-xl border-2 border-ctp-surface1 bg-ctp-base px-4 py-3 text-ctp-text italic shadow-paper motion-safe:animate-page-fade">
              <span className="mr-2 font-display text-ctp-peach not-italic">
                Hint {hintIndex + 1}/{mission.challenge.hints.length}
              </span>
              {mission.challenge.hints[hintIndex]}
            </div>
          )}

          {sqlError && <div className={sqlErrorClasses}>⚠ {sqlError}</div>}

          {result && (
            <QueryResultTable
              result={result.data}
              durationMs={result.durationMs}
            />
          )}
        </div>
      </div>

      {evaluation && (
        <MissionFeedback
          mission={mission}
          evaluation={evaluation}
          playerQuery={query}
          onReturnToEditor={() => setEvaluation(null)}
          onReturnToMap={onBack}
        />
      )}
    </div>
  );
}
