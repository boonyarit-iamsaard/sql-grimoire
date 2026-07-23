import xpIcon from "../../assets/ui/xp-icon.svg";
import { cn } from "../../lib/cn";
import { playClick } from "../../shared/audio/sound";
import { Button } from "../../shared/ui/button";
import { usePlayerProgress } from "../progress/progress-store";
import type { CaseView } from "./case-catalog";
import { caseCatalog } from "./case-catalog";

interface CaseDashboardScreenProps {
  onOpenGrimoire: () => void;
  onOpenMission: (missionId: string) => void;
  onOpenTitle: () => void;
}

const cardClasses =
  "rounded-[14px] border-[3px] border-ctp-surface2 bg-linear-to-b from-ctp-surface0 to-ctp-base text-ctp-text shadow-paper";

export function CaseDashboardScreen({
  onOpenGrimoire,
  onOpenMission,
  onOpenTitle,
}: Readonly<CaseDashboardScreenProps>) {
  const progress = usePlayerProgress();
  const cases = caseCatalog.getCases((missionId) =>
    progress.isMissionCompleted(missionId),
  );

  const totalMissions = cases.reduce(
    (sum, { missionIds }) => sum + missionIds.length,
    0,
  );
  const completedMissions = cases.reduce(
    (sum, { completedCount }) => sum + completedCount,
    0,
  );
  const activeCase = cases.find(({ state }) => state === "available");

  return (
    <div className="mx-auto w-full max-w-[1560px] px-5 pt-4 pb-10">
      <header className="mb-3 flex items-center justify-between gap-4">
        <h1 className="m-0 text-[1.9rem]">Casebook</h1>
        <nav className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            onClick={() => {
              playClick();
              onOpenGrimoire();
            }}
          >
            Grimoire
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              playClick();
              onOpenTitle();
            }}
          >
            Title
          </Button>
        </nav>
      </header>

      <div className="grid grid-cols-[minmax(280px,340px)_1fr] items-start gap-3.5 max-[900px]:grid-cols-1">
        <aside
          className={cn(
            cardClasses,
            "sticky top-4 px-5 py-4 max-[900px]:static",
          )}
        >
          <h2 className="mt-0 mb-2.5 text-[1.05rem] text-ctp-lavender">
            Your progress
          </h2>
          <div className="mb-3 inline-flex items-center gap-2 font-display text-[1.15rem] text-ctp-yellow">
            <img className="h-5.5 w-5.5" src={xpIcon} alt="" /> {progress.xp} XP
          </div>
          <div className="mb-1.5 text-[0.9rem] text-ctp-subtext1">
            Missions solved: {completedMissions} / {totalMissions}
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-ctp-surface1"
            role="progressbar"
            aria-valuenow={completedMissions}
            aria-valuemin={0}
            aria-valuemax={totalMissions}
            aria-label="Missions solved"
          >
            <div
              className="h-full rounded-full bg-ctp-yellow transition-[width] duration-300"
              style={{
                width: `${totalMissions === 0 ? 0 : (completedMissions / totalMissions) * 100}%`,
              }}
            />
          </div>
          {activeCase && (
            <div className="mt-3.5 text-[0.9rem] text-ctp-subtext0">
              Current case:{" "}
              <span className="text-ctp-peach">{activeCase.name}</span>
            </div>
          )}
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          {cases.map((caseView) => (
            <CaseCard
              key={caseView.id}
              caseView={caseView}
              onOpenMission={onOpenMission}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CaseCard({
  caseView,
  onOpenMission,
}: Readonly<{
  caseView: CaseView;
  onOpenMission: (missionId: string) => void;
}>) {
  if (caseView.state === "locked") {
    return (
      <section className={cn(cardClasses, "px-6 py-5 opacity-80")}>
        <div className="font-mono text-[0.75rem] text-ctp-overlay2 uppercase tracking-[0.08em]">
          {caseView.company} · locked
        </div>
        <h2 className="mt-1 mb-1.5 text-[1.35rem] text-ctp-overlay2">
          {caseView.name}
        </h2>
        {caseView.comingSoonNote && (
          <p className="m-0 text-ctp-subtext0 italic">
            {caseView.comingSoonNote}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className={cn(cardClasses, "px-6 py-5")}>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="font-mono text-[0.75rem] text-ctp-peach uppercase tracking-[0.08em]">
            {caseView.company}
          </div>
          <h2 className="mt-1 mb-1.5 text-[1.35rem]">{caseView.name}</h2>
        </div>
        <span className="shrink-0 rounded-full border border-ctp-surface2 bg-ctp-mantle px-3 py-0.75 font-mono text-ctp-subtext1 text-xs">
          {caseView.completedCount} / {caseView.missions.length} solved
        </span>
      </div>
      <p className="mt-0 mb-4 max-w-[64ch] text-ctp-subtext1">
        {caseView.summary}
      </p>

      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {caseView.missions.map(({ mission, state }, index) => (
          <li
            key={mission.id}
            className={cn(
              "flex items-center gap-3 rounded-[10px] border-2 border-ctp-surface1 bg-ctp-base px-4 py-2.5",
              state === "locked" && "opacity-60",
            )}
            data-testid="mission-row"
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border-2 font-display text-[0.9rem]",
                state === "completed"
                  ? "border-[#6f9a63] bg-ctp-green text-ctp-crust"
                  : "border-ctp-surface2 bg-ctp-mantle text-ctp-subtext1",
              )}
            >
              {state === "completed" ? "✓" : index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate">{mission.title}</span>
              <span className="block truncate font-mono text-[0.75rem] text-ctp-overlay2">
                {mission.primer.title}
              </span>
            </span>
            {state === "next" && (
              <Button
                variant="primary"
                onClick={() => {
                  playClick();
                  onOpenMission(mission.id);
                }}
              >
                {caseView.completedCount > 0 ? "Continue" : "Start"}
              </Button>
            )}
            {state === "completed" && (
              <Button
                variant="ghost"
                onClick={() => {
                  playClick();
                  onOpenMission(mission.id);
                }}
              >
                Replay
              </Button>
            )}
            {state === "locked" && (
              <span className="font-mono text-[0.75rem] text-ctp-overlay2 uppercase tracking-[0.08em]">
                Locked
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
