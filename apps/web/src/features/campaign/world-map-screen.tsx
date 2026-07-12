import worldMap from "../../assets/maps/world-map.svg";
import xpIcon from "../../assets/ui/xp-icon.svg";
import { cn } from "../../lib/cn";
import { playClick } from "../../shared/audio/sound";
import { Button } from "../../shared/ui/button";
import { usePlayerProgress } from "../progress/progress-store";
import { campaignCatalog } from "./campaign-catalog";

const spotBaseClasses =
  "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 border-none bg-transparent p-1.5";
const spotImageClasses =
  "h-auto w-[clamp(56px,8vw,88px)] drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]";
const spotLabelClasses =
  "whitespace-nowrap rounded-full border border-ctp-surface2 bg-[rgba(24,25,38,0.88)] px-3 py-[3px] font-display text-[0.9rem] text-ctp-text";

interface WorldMapScreenProps {
  onOpenGrimoire: () => void;
  onOpenMission: (missionId: string) => void;
  onOpenTitle: () => void;
}

export function WorldMapScreen({
  onOpenGrimoire,
  onOpenMission,
  onOpenTitle,
}: Readonly<WorldMapScreenProps>) {
  const progress = usePlayerProgress();
  const locations = campaignCatalog.getLocations((missionId) =>
    progress.isMissionCompleted(missionId),
  );
  const featuredMissionId = locations.find(
    ({ availability, nextMissionId }) =>
      availability === "available" && nextMissionId !== null,
  )?.nextMissionId;
  const featuredMissionDone = locations.some(
    ({ missionIds, state }) =>
      missionIds.includes(featuredMissionId ?? "") && state === "completed",
  );

  return (
    <div className="mx-auto max-w-275 px-6 pt-5 pb-10">
      <header className="mb-3.5 flex items-center justify-between gap-4">
        <div>
          <h1 className="m-0 text-[1.9rem]">The Duskharbor Coast</h1>
        </div>
        <nav className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-ctp-surface1 bg-ctp-base py-1.5 pr-4 pl-2.5 font-display text-[1.05rem] text-ctp-yellow">
            <img className="h-5.5 w-5.5" src={xpIcon} alt="XP" /> {progress.xp}{" "}
            XP
          </span>
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

      <div className="relative overflow-hidden rounded-xl border-[3px] border-ctp-surface1 shadow-paper">
        <img className="block h-auto w-full" src={worldMap} alt="World map" />

        {locations.map((location) => {
          const completed = location.state === "completed";
          const style = location.position;

          if (location.state === "locked" || !location.nextMissionId) {
            return (
              <div
                key={location.id}
                className={cn(spotBaseClasses, "cursor-not-allowed opacity-90")}
                style={style}
                title={location.lockedTitle}
              >
                <img
                  className={spotImageClasses}
                  src={location.mapImage}
                  alt=""
                />
                <span
                  className={cn(spotLabelClasses, "text-ctp-overlay2 italic")}
                >
                  {location.name} · locked
                </span>
              </div>
            );
          }

          const nextMissionId = location.nextMissionId;

          return (
            <button
              key={location.id}
              type="button"
              data-testid="map-spot"
              className={cn(spotBaseClasses, "group cursor-pointer")}
              style={style}
              onClick={() => {
                playClick();
                onOpenMission(nextMissionId);
              }}
            >
              <span className="relative">
                <img
                  className={cn(
                    spotImageClasses,
                    "transition-transform duration-150 motion-safe:group-hover:-rotate-2 motion-safe:group-hover:scale-110",
                  )}
                  src={location.mapImage}
                  alt=""
                />
                {completed && (
                  <span className="absolute -top-0.5 -right-1 rotate-[8deg] rounded-full border-2 border-[#6f9a63] bg-ctp-green px-2.25 py-0.5 font-bold text-ctp-crust text-xs">
                    ✓ Done
                  </span>
                )}
              </span>
              <span className={spotLabelClasses}>
                {location.name}
                {completed ? " · replay" : ""}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-ctp-subtext0 italic">
        {featuredMissionDone
          ? "The guild's ledgers are in order. New roads will open soon…"
          : "The Merchant Guild has posted a notice: shipments are going missing. Click the guild hall to investigate."}
      </p>
    </div>
  );
}
