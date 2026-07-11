import { useNavigate } from "react-router-dom";
import lockedLocation from "../assets/locations/locked-location.svg";
import merchantGuild from "../assets/locations/merchant-guild.svg";
import worldMap from "../assets/maps/world-map.svg";
import xpIcon from "../assets/ui/xp-icon.svg";
import { missingShipment } from "../game/missions/missing-shipment";
import { useProgress } from "../game/progress/progress-store";
import { playClick } from "../game/sound";

export function WorldMapPage() {
  const navigate = useNavigate();
  const progress = useProgress();
  const guildDone = progress.completedMissionIds.includes(missingShipment.id);

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

        <button
          type="button"
          className="map-spot clickable"
          style={{ left: "37%", top: "68%" }}
          onClick={() => {
            playClick();
            navigate(`/mission/${missingShipment.id}`);
          }}
        >
          <span style={{ position: "relative" }}>
            <img src={merchantGuild} alt="" />
            {guildDone && <span className="spot-done">✓ Done</span>}
          </span>
          <span className="spot-label">
            Merchant Guild{guildDone ? " · replay" : ""}
          </span>
        </button>

        <div
          className="map-spot locked"
          style={{ left: "74%", top: "43%" }}
          title="Locked — complete the Merchant Guild mission first"
        >
          <img src={lockedLocation} alt="" />
          <span className="spot-label">??? · locked</span>
        </div>
      </div>

      <p className="map-hint">
        {guildDone
          ? "The guild's ledgers are in order. New roads will open soon…"
          : "The Merchant Guild has posted a notice: shipments are going missing. Click the guild hall to investigate."}
      </p>
    </div>
  );
}
