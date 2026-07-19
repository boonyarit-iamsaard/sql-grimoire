import { useEffect, useRef, useState } from "react";
import { format } from "sql-formatter";
import { cn } from "../../lib/cn";
import { playClick, playMissionComplete } from "../../shared/audio/sound";
import { Button } from "../../shared/ui/button";
import {
  FlagIcon,
  HourglassIcon,
  LampIcon,
  PenIcon,
  PlayIcon,
  ResetIcon,
  WarningIcon,
} from "../../shared/ui/icons";
import { TextWithCode } from "../../shared/ui/text-with-code";
import type { EvaluationResult } from "../../sql/evaluator";
import type { QueryResult, TableInfo } from "../../sql/sql-runtime";
import { SqliteRuntime } from "../../sql/sqlite-runtime";
import { caseCatalog } from "../cases/case-catalog";
import { playerProgress } from "../progress/progress-store";
import { IncidentReport } from "./components/incident-report";
import { MissionFeedback } from "./components/mission-feedback";
import { PrimerPanel } from "./components/primer-panel";
import { QueryResultTable } from "./components/query-result-table";
import { SchemaExplorer } from "./components/schema-explorer";
import { SqlEditor } from "./components/sql-editor";
import { MissionAttempt } from "./mission-attempt";
import type { Mission } from "./mission-types";

const centeredScreenClasses =
  "flex min-h-screen flex-col items-center justify-center gap-[22px] p-6";
// A genuine failure: red, with a warning shake.
const errorCardClasses =
  "flex items-start gap-2 rounded-[10px] border-2 border-ctp-red bg-ctp-base px-4 py-3 font-mono text-mono whitespace-pre-wrap text-ctp-red motion-safe:animate-shake";
// The 2s runaway guard fired: a calm scholar's note, not an alarm.
const interruptCardClasses =
  "flex items-start gap-2 rounded-[10px] border-2 border-ctp-peach bg-ctp-base px-4 py-3 font-mono text-mono whitespace-pre-wrap text-ctp-peach motion-safe:animate-page-fade";

type RunNotice = { kind: "error" | "interrupted"; message: string };

function classifyRunError(message: string): RunNotice {
  const interrupted = /^(query )?interrupted/i.test(message);
  return { kind: interrupted ? "interrupted" : "error", message };
}

interface MissionScreenProps {
  missionId: string;
  onBack: () => void;
  onOpenMission: (missionId: string) => void;
}

/** The next uncompleted Mission in the same Case, if any — computed after
 *  completion has been applied to Player Progress, so a just-finished Mission
 *  never nominates itself. */
function nextMissionIn(caseId: string): Mission | null {
  const caseView = caseCatalog
    .getCases((missionId) => playerProgress.isMissionCompleted(missionId))
    .find((candidate) => candidate.id === caseId);
  if (caseView?.state !== "available" || !caseView.nextMissionId) {
    return null;
  }
  return caseCatalog.getMission(caseView.nextMissionId) ?? null;
}

export function MissionScreen({
  missionId,
  onBack,
  onOpenMission,
}: Readonly<MissionScreenProps>) {
  const mission = caseCatalog.getMission(missionId);

  if (!mission) {
    return (
      <div className={centeredScreenClasses}>
        <h1>Unknown mission</h1>
        <Button onClick={onBack}>Back to the Casebook</Button>
      </div>
    );
  }

  return (
    <MissionAttemptScreen
      key={mission.id}
      mission={mission}
      onBack={onBack}
      onOpenMission={onOpenMission}
    />
  );
}

interface MissionAttemptScreenProps {
  mission: Mission;
  onBack: () => void;
  onOpenMission: (missionId: string) => void;
}

function MissionAttemptScreen({
  mission,
  onBack,
  onOpenMission,
}: Readonly<MissionAttemptScreenProps>) {
  const attemptRef = useRef<MissionAttempt | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [query, setQuery] = useState(() =>
    playerProgress.lastQueryFor(mission.id),
  );
  const [result, setResult] = useState<{
    data: QueryResult;
    durationMs: number;
  } | null>(null);
  const [runNotice, setRunNotice] = useState<RunNotice | null>(null);
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
    setRunNotice(null);
    playerProgress.recordLastQuery(mission.id, query);
    const run = await attempt.run(query);
    if (!run.ok) {
      setRunNotice(classifyRunError(run.error));
      setResult(null);
    } else {
      setRunNotice(null);
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
    setRunNotice(null);
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
      setRunNotice(null);
    } catch {
      // sql-formatter can't parse it — leave the text as typed; running the
      // query will surface the real SQLite error.
      setRunNotice({
        kind: "error",
        message:
          "Couldn't format — the SQL isn't parseable yet. Run it to see the exact error.",
      });
    }
  };

  const resetDatabase = async () => {
    const attempt = attemptRef.current;
    if (!attempt || busy) {
      return;
    }
    if (
      !window.confirm(
        "Reset the case database to its original seeded state? Anything you've changed will be undone.",
      )
    ) {
      return;
    }
    playClick();
    setBusy(true);
    const reset = await attempt.reset();
    if (reset.ok) {
      setResult(null);
      setRunNotice(null);
    } else {
      setRunNotice({ kind: "error", message: reset.error });
    }
    setBusy(false);
  };

  // Explore-Then-Seal: Run keeps the gold; Submit only lights up as the
  // earned terminal step once a result exists. See DESIGN.md.
  const readyToSeal = result !== null && !busy && dbReady;
  const outputEmpty =
    !initError && hintIndex < 0 && runNotice === null && result === null;

  return (
    <div className="mx-auto flex h-screen max-w-[1560px] flex-col px-5 pt-4 pb-4 max-[900px]:h-auto max-[900px]:pb-8">
      <header className="mb-3 flex shrink-0 items-start justify-between gap-4">
        <div>
          <h1 className="mb-0.5 text-2xl">{mission.title}</h1>
          <p className="m-0 max-w-[80ch] text-ctp-subtext1">
            <strong className="text-ctp-yellow">Objective:</strong>{" "}
            <TextWithCode text={mission.objective} />
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            playClick();
            onBack();
          }}
        >
          ← Casebook
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(340px,40%)_1fr] gap-3.5 max-[900px]:grid-cols-1">
        {/* Lesson pane: one framed panel whose sections — briefing, primer,
            schema — scroll together inside it, so scrolled content clips
            against the panel's own border instead of a bare page edge. */}
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border-2 border-ctp-surface1 bg-ctp-base shadow-paper">
          <div className="min-h-0 flex-1 divide-y divide-ctp-surface1 overflow-y-auto max-[900px]:overflow-visible">
            <IncidentReport briefing={mission.briefing} />
            <PrimerPanel primer={mission.primer} />
            <SchemaExplorer tables={tables} />
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col gap-3">
          <div className="flex min-h-[264px] shrink-0 flex-col overflow-hidden rounded-xl border-2 border-ctp-surface1 bg-ctp-base shadow-paper min-[901px]:h-[45%]">
            <div className="min-h-[180px] flex-1 [&>div]:h-full">
              <SqlEditor
                value={query}
                onChange={setQuery}
                onRun={runQuery}
                onSubmit={submitAnswer}
                height="100%"
              />
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 border-ctp-surface1 border-t bg-ctp-mantle px-3 py-2.5">
              <Button
                variant="primary"
                onClick={runQuery}
                disabled={busy || !dbReady}
              >
                <PlayIcon /> Run Query
              </Button>
              <Button
                onClick={submitAnswer}
                disabled={busy || !dbReady || query.trim() === ""}
                className={cn(
                  readyToSeal &&
                    "ring-2 ring-ctp-yellow/70 ring-offset-2 ring-offset-ctp-mantle",
                )}
                title={
                  readyToSeal
                    ? "Ready to submit — ⌘/Ctrl+Shift+Enter"
                    : undefined
                }
              >
                <FlagIcon /> Submit Answer
              </Button>
              <span className="flex-1" />
              <Button
                variant="ghost"
                onClick={formatQuery}
                disabled={query.trim() === ""}
              >
                <PenIcon /> Format
              </Button>
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
                <LampIcon /> Hint
              </Button>
              <Button
                variant="danger"
                onClick={resetDatabase}
                disabled={busy || !dbReady}
                title="Reset the case database to its seeded state"
              >
                <ResetIcon /> Reset
              </Button>
            </div>
          </div>

          {/* Output pane: everything a run or submission produces. */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-1">
            {outputEmpty && (
              <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-ctp-surface1 border-dashed py-10 font-mono text-ctp-overlay1 text-mono max-[900px]:hidden">
                Results appear here — press ⌘/Ctrl+Enter to run
              </div>
            )}

            {initError && (
              <div className={errorCardClasses}>
                <WarningIcon className="mt-0.5 shrink-0" />
                <span>The case database failed to open: {initError}</span>
              </div>
            )}

            {hintIndex >= 0 && (
              <div className="rounded-xl border-2 border-ctp-surface1 bg-ctp-base px-4 py-3 text-ctp-text italic shadow-paper motion-safe:animate-page-fade">
                <span className="mr-2 font-display text-ctp-peach not-italic">
                  Hint {hintIndex + 1}/{mission.challenge.hints.length}
                </span>
                <TextWithCode text={mission.challenge.hints[hintIndex]} />
              </div>
            )}

            {runNotice?.kind === "interrupted" && (
              <div className={interruptCardClasses}>
                <HourglassIcon className="mt-0.5 shrink-0" />
                <span>{runNotice.message}</span>
              </div>
            )}

            {runNotice?.kind === "error" && (
              <div className={errorCardClasses}>
                <WarningIcon className="mt-0.5 shrink-0" />
                <span>{runNotice.message}</span>
              </div>
            )}

            {result && (
              <QueryResultTable
                result={result.data}
                durationMs={result.durationMs}
              />
            )}
          </div>
        </div>
      </div>

      {evaluation && (
        <MissionFeedback
          mission={mission}
          evaluation={evaluation}
          playerQuery={query}
          onReturnToEditor={() => setEvaluation(null)}
          onReturnToMap={onBack}
          nextMission={evaluation.passed ? nextMissionIn(mission.caseId) : null}
          onOpenMission={onOpenMission}
        />
      )}
    </div>
  );
}
