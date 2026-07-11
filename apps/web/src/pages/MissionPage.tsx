import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "sql-formatter";
import { missionById } from "../game/missions/missing-shipment";
import {
  completeMission,
  getProgress,
  recordLastQuery,
  setCurrentMission,
} from "../game/progress/progress-store";
import { playClick, playMissionComplete } from "../game/sound";
import { SqliteRuntime } from "../sql/sqlite-runtime";
import type { QueryResult, TableInfo } from "../sql/sql-runtime";
import { evaluate, type EvaluationResult } from "../sql/evaluator";
import { DialogueBox } from "../components/DialogueBox";
import { SchemaExplorer } from "../components/SchemaExplorer";
import { SqlEditor } from "../components/SqlEditor";
import { QueryResultTable } from "../components/QueryResultTable";
import { MissionFeedback } from "../components/MissionFeedback";

type Phase = "briefing" | "workbench";

export function MissionPage() {
  const navigate = useNavigate();
  const { missionId } = useParams();
  const mission = missionById(missionId ?? "");

  const runtimeRef = useRef<SqliteRuntime | null>(null);
  const [phase, setPhase] = useState<Phase>("briefing");
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [query, setQuery] = useState(() => (mission ? getProgress().lastQueries[mission.id] ?? "" : ""));
  const [result, setResult] = useState<{ data: QueryResult; durationMs: number } | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (!mission) return;
    const runtime = new SqliteRuntime();
    runtimeRef.current = runtime;
    setCurrentMission(mission.id);
    let disposed = false;
    runtime
      .init(mission.database.schemaSql, mission.database.seedSql)
      .then(() => runtime.tables())
      .then((t) => {
        setTables(t);
        setDbReady(true);
      })
      .catch((error: Error) => {
        if (!disposed) setInitError(error.message);
      });
    return () => {
      disposed = true;
      runtime.dispose();
    };
  }, [mission]);

  if (!mission) {
    return (
      <div className="briefing">
        <h1>Unknown mission</h1>
        <button className="btn" onClick={() => navigate("/map")}>Back to Map</button>
      </div>
    );
  }

  const runQuery = async () => {
    const runtime = runtimeRef.current;
    if (!runtime || busy) return;
    playClick();
    setBusy(true);
    setSqlError(null);
    recordLastQuery(mission.id, query);
    const run = await runtime.run(query);
    if (!run.ok) {
      setSqlError(run.error);
      setResult(null);
    } else if (run.results.length === 0) {
      setSqlError(null);
      setResult({ data: { columns: [], rows: [] }, durationMs: run.durationMs });
    } else {
      setResult({ data: run.results[run.results.length - 1], durationMs: run.durationMs });
    }
    setBusy(false);
  };

  const submitAnswer = async () => {
    const runtime = runtimeRef.current;
    if (!runtime || busy) return;
    playClick();
    setBusy(true);
    setSqlError(null);
    recordLastQuery(mission.id, query);
    // Reset first so player-made data changes can't skew either result.
    await runtime.reset();
    const playerRun = await runtime.run(query);
    const referenceRun = await runtime.run(mission.challenge.referenceQuery);
    const verdict = evaluate(playerRun, referenceRun, mission.challenge.expectedColumns, mission.reward.xp);
    if (verdict.passed) {
      playMissionComplete();
      completeMission(
        {
          missionId: mission.id,
          missionTitle: mission.title,
          concepts: mission.explanation.concepts,
          playerQuery: query,
          referenceQuery: mission.explanation.referenceSolution,
          explanation: mission.explanation.summary,
          completedAt: new Date().toISOString(),
        },
        verdict.earnedXp,
      );
    }
    setEvaluation(verdict);
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
      setSqlError("Couldn't format — the SQL isn't parseable yet. Run it to see the exact error.");
    }
  };

  const resetDatabase = async () => {
    const runtime = runtimeRef.current;
    if (!runtime || busy) return;
    playClick();
    setBusy(true);
    await runtime.reset();
    setResult(null);
    setSqlError(null);
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
        <button className="btn btn-ghost" onClick={() => { playClick(); navigate("/map"); }}>
          ← Map
        </button>
      </header>

      <div className="wb-grid">
        <SchemaExplorer tables={tables} />

        <div className="wb-main">
          <div className="panel editor-panel">
            <SqlEditor value={query} onChange={setQuery} />
            <div className="editor-toolbar">
              <button className="btn btn-primary" onClick={runQuery} disabled={busy || !dbReady}>
                ▶ Run Query
              </button>
              <button className="btn" onClick={submitAnswer} disabled={busy || !dbReady || query.trim() === ""}>
                ⚑ Submit Answer
              </button>
              <button className="btn btn-ghost" onClick={formatQuery} disabled={query.trim() === ""}>
                ✎ Format
              </button>
              <span className="spacer" />
              <button
                className="btn btn-ghost"
                onClick={() => {
                  playClick();
                  setHintIndex((i) => Math.min(i + 1, mission.challenge.hints.length - 1));
                }}
                disabled={hintIndex >= mission.challenge.hints.length - 1}
              >
                💡 Hint
              </button>
              <button className="btn btn-danger" onClick={resetDatabase} disabled={busy || !dbReady}>
                ⟲ Reset Database
              </button>
            </div>
          </div>

          {initError && (
            <div className="sql-error">⚠ The guild database failed to open: {initError}</div>
          )}

          {hintIndex >= 0 && (
            <div className="panel hint-box">
              <span className="hint-tag">Hint {hintIndex + 1}/{mission.challenge.hints.length}</span>
              {mission.challenge.hints[hintIndex]}
            </div>
          )}

          {sqlError && <div className="sql-error">⚠ {sqlError}</div>}

          {result && <QueryResultTable result={result.data} durationMs={result.durationMs} />}
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
