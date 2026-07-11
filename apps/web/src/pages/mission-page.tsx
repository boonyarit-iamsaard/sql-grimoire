import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "sql-formatter";
import { DialogueBox } from "../components/dialogue-box";
import { MissionFeedback } from "../components/mission-feedback";
import { QueryResultTable } from "../components/query-result-table";
import { SchemaExplorer } from "../components/schema-explorer";
import { SqlEditor } from "../components/sql-editor";
import { campaignCatalog } from "../game/campaign/campaign-catalog";
import { MissionAttempt } from "../game/missions/mission-attempt";
import type { Mission } from "../game/missions/mission-types";
import { playerProgress } from "../game/progress/progress-store";
import { playClick, playMissionComplete } from "../game/sound";
import type { EvaluationResult } from "../sql/evaluator";
import type { QueryResult, TableInfo } from "../sql/sql-runtime";
import { SqliteRuntime } from "../sql/sqlite-runtime";

type Phase = "briefing" | "workbench";

export function MissionPage() {
  const navigate = useNavigate();
  const { missionId } = useParams();
  const mission = campaignCatalog.getMission(missionId ?? "");

  if (!mission) {
    return (
      <div className="briefing">
        <h1>Unknown mission</h1>
        <button type="button" className="btn" onClick={() => navigate("/map")}>
          Back to Map
        </button>
      </div>
    );
  }

  return <MissionAttemptPage key={mission.id} mission={mission} />;
}

interface MissionAttemptPageProps {
  mission: Mission;
}

function MissionAttemptPage({ mission }: Readonly<MissionAttemptPageProps>) {
  const navigate = useNavigate();

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
      <div className="briefing">
        <h1>{mission.title}</h1>
        <DialogueBox
          lines={mission.dialogue}
          finishLabel="Begin Investigation"
          onFinished={() => setPhase("workbench")}
        />
        <div className="panel objective-card">
          <strong>Objective:</strong> {mission.objective}
        </div>
      </div>
    );
  }

  return (
    <div className="workbench">
      <header className="wb-header">
        <div>
          <h1>{mission.title} — Ledger Desk</h1>
          <p className="wb-objective">
            <strong>Objective:</strong> {mission.objective}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            playClick();
            navigate("/map");
          }}
        >
          ← Map
        </button>
      </header>

      <div className="wb-grid">
        <SchemaExplorer tables={tables} />

        <div className="wb-main">
          <div className="panel editor-panel">
            <SqlEditor value={query} onChange={setQuery} />
            <div className="editor-toolbar">
              <button
                type="button"
                className="btn btn-primary"
                onClick={runQuery}
                disabled={busy || !dbReady}
              >
                ▶ Run Query
              </button>
              <button
                type="button"
                className="btn"
                onClick={submitAnswer}
                disabled={busy || !dbReady || query.trim() === ""}
              >
                ⚑ Submit Answer
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={formatQuery}
                disabled={query.trim() === ""}
              >
                ✎ Format
              </button>
              <span className="spacer" />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  playClick();
                  setHintIndex((i) =>
                    Math.min(i + 1, mission.challenge.hints.length - 1),
                  );
                }}
                disabled={hintIndex >= mission.challenge.hints.length - 1}
              >
                💡 Hint
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={resetDatabase}
                disabled={busy || !dbReady}
              >
                ⟲ Reset Database
              </button>
            </div>
          </div>

          {initError && (
            <div className="sql-error">
              ⚠ The guild database failed to open: {initError}
            </div>
          )}

          {hintIndex >= 0 && (
            <div className="panel hint-box">
              <span className="hint-tag">
                Hint {hintIndex + 1}/{mission.challenge.hints.length}
              </span>
              {mission.challenge.hints[hintIndex]}
            </div>
          )}

          {sqlError && <div className="sql-error">⚠ {sqlError}</div>}

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
          onReturnToMap={() => navigate("/map")}
        />
      )}
    </div>
  );
}
