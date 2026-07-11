import { useNavigate } from "react-router-dom";
import { useProgress } from "../game/progress/progress-store";
import { playClick } from "../game/sound";
import { SqlCodeBlock } from "../components/SqlCodeBlock";

export function GrimoirePage() {
  const navigate = useNavigate();
  const progress = useProgress();

  return (
    <div className="grimoire-page">
      <div className="page-nav">
        <h1>Your Grimoire</h1>
        <button className="btn btn-ghost" onClick={() => { playClick(); navigate("/map"); }}>
          ← Back to Map
        </button>
      </div>

      {progress.journal.length === 0 && (
        <p className="grimoire-empty">
          The pages are blank. Complete a mission and its spell will be inscribed here.
        </p>
      )}

      {progress.journal.map((entry) => (
        <article className="grimoire-entry" key={entry.missionId}>
          <h2>{entry.missionTitle}</h2>
          <div className="completed-at">Inscribed {new Date(entry.completedAt).toLocaleString()}</div>

          <h3>SQL concepts learned</h3>
          <p>{entry.concepts.join(" · ")}</p>

          <h3>Your submitted query</h3>
          <SqlCodeBlock code={entry.playerQuery} />

          <h3>Reference query</h3>
          <SqlCodeBlock code={entry.referenceQuery} />

          <h3>What it taught</h3>
          <p>{entry.explanation}</p>
        </article>
      ))}
    </div>
  );
}
