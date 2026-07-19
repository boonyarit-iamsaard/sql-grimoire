import { playClick } from "../../shared/audio/sound";
import { Button } from "../../shared/ui/button";
import { usePlayerProgress } from "../progress/progress-store";

interface LandingScreenProps {
  onOpenCasebook: () => void;
}

export function LandingScreen({
  onOpenCasebook,
}: Readonly<LandingScreenProps>) {
  const progress = usePlayerProgress();
  const saved = progress.hasSavedProgress();

  function openCasebook() {
    playClick();
    onOpenCasebook();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4.5 p-6 text-center">
      <h1 className="text-[clamp(2.6rem,6vw,4.2rem)] tracking-[0.06em] [text-shadow:0_3px_0_rgba(12,12,22,0.55)]">
        SQL Grimoire
      </h1>
      <p className="max-w-[46ch] text-[1.15rem] text-ctp-subtext0 italic">
        Customers have paid, but their orders never arrive. Open the casebook,
        work the company's own database, and find out why — one query at a time.
      </p>
      <div className="mt-2.5 flex gap-3.5">
        <Button variant="primary" onClick={openCasebook}>
          {saved ? "Continue" : "Open the Casebook"}
        </Button>
      </div>
      {saved && (
        <button
          type="button"
          className="mt-6.5 border-none bg-transparent text-[0.85rem] text-ctp-overlay2 underline hover:text-ctp-red"
          onClick={() => {
            if (
              window.confirm(
                "Erase all XP, grimoire entries, and mission progress?",
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
