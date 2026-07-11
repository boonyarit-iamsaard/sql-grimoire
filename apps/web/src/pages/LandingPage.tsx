import { useNavigate } from "react-router-dom";
import { hasSavedProgress, resetProgress, useProgress } from "../game/progress/progress-store";
import { playClick } from "../game/sound";

export function LandingPage() {
  const navigate = useNavigate();
  useProgress(); // re-render when progress changes (e.g. after reset)
  const saved = hasSavedProgress();

  const go = (path: string) => {
    playClick();
    navigate(path);
  };

  return (
    <div className="landing">
      <h1>SQL Grimoire</h1>
      <p className="premise">
        A merchant guild's shipments are going missing — open your grimoire, sharpen your
        query-craft, and find out why.
      </p>
      <div className="actions">
        <button className="btn btn-primary" onClick={() => go("/map")}>
          {saved ? "New Game" : "Start Game"}
        </button>
        {saved && (
          <button className="btn" onClick={() => go("/map")}>
            Continue
          </button>
        )}
      </div>
      {saved && (
        <button
          className="reset-link"
          onClick={() => {
            if (window.confirm("Erase all XP, journal entries, and mission progress?")) {
              resetProgress();
            }
          }}
        >
          Reset progress
        </button>
      )}
    </div>
  );
}
