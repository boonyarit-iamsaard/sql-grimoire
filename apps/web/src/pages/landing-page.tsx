import { useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import { usePlayerProgress } from "../game/progress/progress-store";
import { playClick } from "../game/sound";

export function LandingPage() {
  const navigate = useNavigate();
  const progress = usePlayerProgress();
  const saved = progress.hasSavedProgress();

  const go = (path: string) => {
    playClick();
    navigate(path);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-[18px] p-6 text-center">
      <h1 className="text-[clamp(2.6rem,6vw,4.2rem)] tracking-[0.06em] [text-shadow:0_3px_0_rgba(12,12,22,0.55)]">
        SQL Grimoire
      </h1>
      <p className="max-w-[46ch] text-[1.15rem] text-ctp-subtext0 italic">
        A merchant guild's shipments are going missing — open your grimoire,
        sharpen your query-craft, and find out why.
      </p>
      <div className="mt-2.5 flex gap-3.5">
        <Button variant="primary" onClick={() => go("/map")}>
          {saved ? "New Game" : "Start Game"}
        </Button>
        {saved && <Button onClick={() => go("/map")}>Continue</Button>}
      </div>
      {saved && (
        <button
          type="button"
          className="mt-[26px] border-none bg-transparent text-[0.85rem] text-ctp-overlay1 underline hover:text-ctp-red"
          onClick={() => {
            if (
              window.confirm(
                "Erase all XP, journal entries, and mission progress?",
              )
            ) {
              progress.reset();
            }
          }}
        >
          Reset progress
        </button>
      )}
    </div>
  );
}
