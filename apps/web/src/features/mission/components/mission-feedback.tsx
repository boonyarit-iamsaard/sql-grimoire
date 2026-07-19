import { type ReactNode, useEffect, useRef } from "react";
import xpIcon from "../../../assets/ui/xp-icon.svg";
import { playClick } from "../../../shared/audio/sound";
import { Button } from "../../../shared/ui/button";
import { SqlCodeBlock } from "../../../shared/ui/sql-code-block";
import type { EvaluationResult } from "../../../sql/evaluator";
import type { Mission } from "../mission-types";

interface MissionFeedbackProps {
  mission: Mission;
  evaluation: EvaluationResult;
  playerQuery: string;
  onReturnToEditor: () => void;
  onReturnToMap: () => void;
  nextMission: Mission | null;
  onOpenMission: (missionId: string) => void;
}

// A native modal <dialog>: the browser owns the top layer, focus trap, and
// Escape. We style the element itself as the full-viewport overlay and dim via
// its ::backdrop. A transparent full-size <button> sits behind the card as the
// interactive backdrop — clicking it (and only it) dismisses, while Escape is
// handled natively via onCancel.
const overlayClasses =
  "fixed inset-0 z-40 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-6 backdrop:bg-[rgba(12,12,22,0.78)] motion-safe:animate-page-fade";
const backdropClasses =
  "absolute inset-0 cursor-default bg-transparent outline-none";
const cardClasses =
  "relative max-h-[90vh] w-[min(680px,100%)] overflow-y-auto rounded-2xl border-[3px] border-ctp-surface2 bg-linear-to-b from-ctp-surface0 to-ctp-base px-[30px] py-[26px] text-ctp-text shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.6)] motion-safe:animate-card-rise";
const sectionHeadingClasses = "mt-[18px] text-[1.02rem] text-ctp-lavender";
const preClasses =
  "my-1.5 overflow-x-auto rounded-lg bg-ctp-mantle px-3.5 py-3 font-mono text-mono text-ctp-text";

const headingId = "mission-feedback-heading";

/** Native <dialog> shell shared by the pass and fail states. Escape and a
 *  backdrop click both return to the editor — the safe exit. */
function FeedbackShell({
  onDismiss,
  children,
}: Readonly<{ onDismiss: () => void; children: ReactNode }>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      className={overlayClasses}
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
    >
      <button
        type="button"
        aria-label="Close feedback"
        tabIndex={-1}
        className={backdropClasses}
        onClick={onDismiss}
      />
      <div className={cardClasses}>{children}</div>
    </dialog>
  );
}

export function MissionFeedback({
  mission,
  evaluation,
  playerQuery,
  onReturnToEditor,
  onReturnToMap,
  nextMission,
  onOpenMission,
}: Readonly<MissionFeedbackProps>) {
  // Focus the primary action without scrolling it into view — plain
  // autoFocus would yank the scrollable card down to the bottom button.
  const primaryRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    primaryRef.current?.focus({ preventScroll: true });
  }, []);

  if (!evaluation.passed) {
    return (
      <FeedbackShell onDismiss={onReturnToEditor}>
        <h2 id={headingId} className="text-[1.6rem] text-ctp-red">
          Not quite yet…
        </h2>
        <div className="font-mono text-ctp-maroon text-xs uppercase tracking-[0.08em]">
          {evaluation.reason.replaceAll("_", " ")}
        </div>
        <p>{evaluation.message}</p>
        <h3 className={sectionHeadingClasses}>
          The mission expects these columns
        </h3>
        <pre className={preClasses}>
          {mission.challenge.expectedColumns.join(", ")}
        </pre>
        <div className="mt-5.5 flex gap-3">
          <Button
            variant="primary"
            ref={primaryRef}
            onClick={() => {
              playClick();
              onReturnToEditor();
            }}
          >
            Back to the Workbench
          </Button>
        </div>
      </FeedbackShell>
    );
  }

  return (
    <FeedbackShell onDismiss={onReturnToEditor}>
      <h2 id={headingId} className="text-[1.6rem] text-ctp-green">
        Mission Complete — {mission.title}
      </h2>
      <div className="my-2.5 inline-flex items-center gap-2 rounded-[10px] border-2 border-ctp-yellow border-dashed bg-ctp-mantle px-4.5 py-1.5 font-display text-[1.3rem] text-ctp-yellow">
        <img className="h-6.5 w-6.5" src={xpIcon} alt="" /> +
        {evaluation.earnedXp} XP
      </div>
      <p className="text-[1.05rem] text-ctp-subtext1 italic">
        {mission.reward.successMessage}
      </p>

      <h3 className={sectionHeadingClasses}>Concepts learned</h3>
      <div className="my-1.5 flex flex-wrap gap-2">
        {mission.explanation.concepts.map((c) => (
          <span
            className="rounded-full border border-ctp-overlay0 bg-ctp-surface1 px-3 py-0.75 font-mono text-xs"
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

      <div className="mt-5.5 flex flex-wrap gap-3">
        {nextMission ? (
          <>
            <Button
              variant="primary"
              ref={primaryRef}
              onClick={() => {
                playClick();
                onOpenMission(nextMission.id);
              }}
            >
              Next Mission — {nextMission.title}
            </Button>
            <Button
              onClick={() => {
                playClick();
                onReturnToMap();
              }}
            >
              Back to the Casebook
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            ref={primaryRef}
            onClick={() => {
              playClick();
              onReturnToMap();
            }}
          >
            Back to the Casebook
          </Button>
        )}
      </div>
    </FeedbackShell>
  );
}
