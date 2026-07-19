import { playClick } from "../../shared/audio/sound";
import { Button } from "../../shared/ui/button";
import { SqlCodeBlock } from "../../shared/ui/sql-code-block";
import { usePlayerProgress } from "../progress/progress-store";

interface GrimoireScreenProps {
  onBack: () => void;
}

export function GrimoireScreen({ onBack }: Readonly<GrimoireScreenProps>) {
  const progress = usePlayerProgress();

  return (
    <div className="mx-auto max-w-215 p-6">
      <div className="mb-4.5 flex items-center justify-between">
        <h1>Your Grimoire</h1>
        <Button
          variant="ghost"
          onClick={() => {
            playClick();
            onBack();
          }}
        >
          ← Back to the Casebook
        </Button>
      </div>

      {progress.grimoireEntries.length === 0 && (
        <p className="py-15 text-center text-ctp-subtext0 italic">
          The pages are blank. Solve a mission and its record will be inscribed
          here.
        </p>
      )}

      {progress.grimoireEntries.map((entry) => (
        <article
          className="mb-4.5 rounded-[14px] border-[3px] border-ctp-surface2 bg-linear-to-b from-ctp-surface0 to-ctp-base px-6.5 py-5.5 text-ctp-text shadow-paper"
          key={entry.missionId}
        >
          <h2 className="mb-0.5 text-ctp-peach">{entry.missionTitle}</h2>
          <div className="mb-3 text-[0.85rem] text-ctp-overlay2">
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
