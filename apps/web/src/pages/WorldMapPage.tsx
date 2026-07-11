import { useNavigate } from "react-router-dom";
import worldMap from "../assets/maps/world-map.svg";
import xpIcon from "../assets/ui/xp-icon.svg";
import { getCampaignLocations } from "../game/campaign/campaign-catalog";
import { usePlayerProgress } from "../game/progress/progress-store";
import { playClick } from "../game/sound";

export function WorldMapPage() {
  const navigate = useNavigate();
  const progress = usePlayerProgress();
  const locations = getCampaignLocations((missionId) =>
    progress.isMissionCompleted(missionId),
  );
  const featuredMissionId = locations.find(
    ({ availability, missionId }) =>
      availability === "available" && missionId !== null,
  )?.missionId;
  const featuredMissionDone = locations.some(
    ({ missionId, state }) =>
      missionId === featuredMissionId && state === "completed",
  );

  return (
    <div className="map-page">
      <header className="map-header">
        <div className="title-block">
          <h1>The Duskharbor Coast</h1>
        </div>
        <nav className="nav">
          <span className="xp-badge">
            <img src={xpIcon} alt="XP" /> {progress.xp} XP
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              playClick();
              navigate("/grimoire");
            }}
          >
            Grimoire
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              playClick();
              navigate("/");
            }}
          >
            Title
          </button>
        </nav>
      </header>

      <div className="map-frame">
        <img className="world" src={worldMap} alt="World map" />

        {locations.map((location) => {
          const completed = location.state === "completed";
          const style = location.position;

          if (location.state === "locked" || !location.missionId) {
            return (
              <div
                key={location.id}
                className="map-spot locked"
                style={style}
                title={location.lockedTitle}
              >
                <img src={location.mapImage} alt="" />
                <span className="spot-label">{location.name} · locked</span>
              </div>
            );
          }

          return (
            <button
              key={location.id}
              type="button"
              className="map-spot clickable"
              style={style}
              onClick={() => {
                playClick();
                navigate(`/mission/${location.missionId}`);
              }}
            >
              <span style={{ position: "relative" }}>
                <img src={location.mapImage} alt="" />
                {completed && <span className="spot-done">✓ Done</span>}
              </span>
              <span className="spot-label">
                {location.name}
                {completed ? " · replay" : ""}
              </span>
            </button>
          );
        })}
      </div>

      <p className="map-hint">
        {featuredMissionDone
          ? "The guild's ledgers are in order. New roads will open soon…"
          : "The Merchant Guild has posted a notice: shipments are going missing. Click the guild hall to investigate."}
      </p>
    </div>
  );
}
