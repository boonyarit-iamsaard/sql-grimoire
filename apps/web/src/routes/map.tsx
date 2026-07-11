import { createFileRoute } from "@tanstack/react-router";
import { WorldMapScreen } from "../features/campaign/world-map-screen";

export const Route = createFileRoute("/map")({
  component: MapRoute,
});

function MapRoute() {
  const navigate = Route.useNavigate();

  return (
    <WorldMapScreen
      onOpenGrimoire={() => navigate({ to: "/grimoire" })}
      onOpenMission={(missionId) =>
        navigate({ to: "/mission/$missionId", params: { missionId } })
      }
      onOpenTitle={() => navigate({ to: "/" })}
    />
  );
}
