import { useEffect, useRef } from "react";
import xpIcon from "../assets/ui/xp-icon.svg";
import type { Mission } from "../game/missions/mission-types";
import { playClick } from "../game/sound";
import type { EvaluationResult } from "../sql/evaluator";
import { Button } from "./button";
import { SqlCodeBlock } from "./sql-code-block";

interface MissionFeedbackProps {
  mission: Mission;
  evaluation: EvaluationResult;
  playerQuery: string;
  onReturnToEditor: () => void;
  onReturnToMap: () => void;
}

const overlayClasses =
  "fixed inset-0 z-40 flex items-center justify-center bg-[rgba(12,12,22,0.78)] p-6 motion-safe:animate-page-fade";
const cardClasses =
  "max-h-[90vh] w-[min(680px,100%)] overflow-y-auto rounded-2xl border-[3px] border-ctp-surface2 bg-linear-to-b from-ctp-surface0 to-ctp-base px-[30px] py-[26px] text-ctp-text shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.6)] motion-safe:animate-card-rise";
const sectionHeadingClasses = "mt-[18px] text-[1.02rem] text-ctp-lavender";
const preClasses =
  "my-1.5 overflow-x-auto rounded-lg bg-ctp-mantle px-3.5 py-3 font-mono text-mono text-ctp-text";

export function MissionFeedback({
  mission,
  evaluation,
  playerQuery,
  onReturnToEditor,
  onReturnToMap,
}: Readonly<MissionFeedbackProps>) {
  // Focus the primary action without scrolling it into view — plain
  // autoFocus would yank the scrollable card down to the bottom button.
  const primaryRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    primaryRef.current?.focus({ preventScroll: true });
  }, []);

  if (!evaluation.passed) {
    return (
      <div className={overlayClasses}>
        <div className={cardClasses}>
          <h2 className="text-[1.6rem] text-ctp-red">
            Not quite, record-keeper…
          </h2>
          <div className="font-mono text-ctp-maroon text-xs uppercase tracking-[0.08em]">
            {evaluation.reason.replaceAll("_", " ")}
          </div>
          <p>{evaluation.message}</p>
          <h3 className={sectionHeadingClasses}>
            The guild expects these columns
          </h3>
          <pre className={preClasses}>
            {mission.challenge.expectedColumns.join(", ")}
          </pre>
          <div className="mt-[22px] flex gap-3">
            <Button
              variant="primary"
              ref={primaryRef}
              onClick={() => {
                playClick();
                onReturnToEditor();
              }}
            >
              Back to the Ledger Desk
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={overlayClasses}>
      <div className={cardClasses}>
        <h2 className="text-[1.6rem] text-ctp-green">
          Mission Complete — {mission.title}
        </h2>
        <div className="my-2.5 inline-flex items-center gap-2 rounded-[10px] border-2 border-ctp-yellow border-dashed bg-ctp-mantle px-[18px] py-1.5 font-display text-[1.3rem] text-ctp-yellow">
          <img className="h-[26px] w-[26px]" src={xpIcon} alt="" /> +
          {evaluation.earnedXp} XP
        </div>
        <p className="text-[1.05rem] text-ctp-subtext1 italic">
          {mission.reward.successMessage}
        </p>

        <h3 className={sectionHeadingClasses}>Concepts learned</h3>
        <div className="my-1.5 flex flex-wrap gap-2">
          {mission.explanation.concepts.map((c) => (
            <span
              className="rounded-full border border-ctp-overlay0 bg-ctp-surface1 px-3 py-[3px] font-mono text-xs"
              key={c}
            >
              {c}
            </span>
          ))}
        </div>

        <h3 className={sectionHeadingClasses}>Your query</h3>
        <SqlCodeBlock code={playerQuery} />

        <h3 className={sectionHeadingClasses}>Reference solution</h3>
        <SqlCodeBlock code={mission.challenge.referenceQuery} />

        <h3 className={sectionHeadingClasses}>How it works</h3>
        <p>{mission.explanation.summary}</p>

        <div className="mt-[22px] flex gap-3">
          <Button
            variant="primary"
            ref={primaryRef}
            onClick={() => {
              playClick();
              onReturnToMap();
            }}
          >
            Return to Map
          </Button>
        </div>
      </div>
    </div>
  );
}
