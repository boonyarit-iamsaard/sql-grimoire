import { useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import { SqlCodeBlock } from "../components/sql-code-block";
import { usePlayerProgress } from "../game/progress/progress-store";
import { playClick } from "../game/sound";

export function GrimoirePage() {
  const navigate = useNavigate();
  const progress = usePlayerProgress();

  return (
    <div className="mx-auto max-w-[860px] p-6">
      <div className="mb-[18px] flex items-center justify-between">
        <h1>Your Grimoire</h1>
        <Button
          variant="ghost"
          onClick={() => {
            playClick();
            navigate("/map");
          }}
        >
          ← Back to Map
        </Button>
      </div>

      {progress.grimoireEntries.length === 0 && (
        <p className="py-[60px] text-center text-ctp-subtext0 italic">
          The pages are blank. Complete a mission and its spell will be
          inscribed here.
        </p>
      )}

      {progress.grimoireEntries.map((entry) => (
        <article
          className="mb-[18px] rounded-[14px] border-[3px] border-ctp-surface2 bg-linear-to-b from-ctp-surface0 to-ctp-base px-[26px] py-[22px] text-ctp-text shadow-paper"
          key={entry.missionId}
        >
          <h2 className="mb-0.5 text-ctp-peach">{entry.missionTitle}</h2>
          <div className="mb-3 text-[0.85rem] text-ctp-overlay1">
            Inscribed {new Date(entry.completedAt).toLocaleString()}
          </div>

          <h3 className="mt-4 text-base text-ctp-lavender">
            SQL concepts learned
          </h3>
          <p>{entry.concepts.join(" · ")}</p>

          <h3 className="mt-4 text-base text-ctp-lavender">
            Your submitted query
          </h3>
          <SqlCodeBlock code={entry.playerQuery} />

          <h3 className="mt-4 text-base text-ctp-lavender">Reference query</h3>
          <SqlCodeBlock code={entry.referenceQuery} />

          <h3 className="mt-4 text-base text-ctp-lavender">What it taught</h3>
          <p>{entry.explanation}</p>
        </article>
      ))}
    </div>
  );
}
