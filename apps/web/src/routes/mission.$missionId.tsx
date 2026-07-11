import { createFileRoute } from "@tanstack/react-router";
import { MissionScreen } from "../features/mission/mission-screen";

export const Route = createFileRoute("/mission/$missionId")({
  component: MissionRoute,
});

function MissionRoute() {
  const navigate = Route.useNavigate();
  const { missionId } = Route.useParams();

  return (
    <MissionScreen
      missionId={missionId}
      onBack={() => navigate({ to: "/map" })}
    />
  );
}
