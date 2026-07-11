import { useEffect, useRef } from "react";
import xpIcon from "../assets/ui/xp-icon.svg";
import type { Mission } from "../game/missions/mission-types";
import { playClick } from "../game/sound";
import type { EvaluationResult } from "../sql/evaluator";
import { SqlCodeBlock } from "./SqlCodeBlock";

type Props = {
  mission: Mission;
  evaluation: EvaluationResult;
  playerQuery: string;
  onReturnToEditor: () => void;
  onReturnToMap: () => void;
};

export function MissionFeedback({
  mission,
  evaluation,
  playerQuery,
  onReturnToEditor,
  onReturnToMap,
}: Props) {
  // Focus the primary action without scrolling it into view — plain
  // autoFocus would yank the scrollable card down to the bottom button.
  const primaryRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    primaryRef.current?.focus({ preventScroll: true });
  }, []);

  if (!evaluation.passed) {
    return (
      <div className="feedback-overlay">
        <div className="feedback-card">
          <h2>Not quite, record-keeper…</h2>
          <div className="fail-reason">
            {evaluation.reason.replaceAll("_", " ")}
          </div>
          <p>{evaluation.message}</p>
          <h3>The guild expects these columns</h3>
          <pre>{mission.challenge.expectedColumns.join(", ")}</pre>
          <div className="card-actions">
            <button
              type="button"
              className="btn btn-primary"
              ref={primaryRef}
              onClick={() => {
                playClick();
                onReturnToEditor();
              }}
            >
              Back to the Ledger Desk
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-overlay">
      <div className="feedback-card success">
        <h2>Mission Complete — {mission.title}</h2>
        <div className="xp-earned">
          <img src={xpIcon} alt="" /> +{evaluation.earnedXp} XP
        </div>
        <p className="story">{mission.reward.successMessage}</p>

        <h3>Concepts learned</h3>
        <div className="concept-chips">
          {mission.explanation.concepts.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>

        <h3>Your query</h3>
        <SqlCodeBlock code={playerQuery} />

        <h3>Reference solution</h3>
        <SqlCodeBlock code={mission.explanation.referenceSolution} />

        <h3>How it works</h3>
        <p>{mission.explanation.summary}</p>

        <div className="card-actions">
          <button
            type="button"
            className="btn btn-primary"
            ref={primaryRef}
            onClick={() => {
              playClick();
              onReturnToMap();
            }}
          >
            Return to Map
          </button>
        </div>
      </div>
    </div>
  );
}
