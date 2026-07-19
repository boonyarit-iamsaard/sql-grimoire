import { createFileRoute } from "@tanstack/react-router";
import { CaseDashboardScreen } from "../features/cases/case-dashboard-screen";

export const Route = createFileRoute("/cases")({
  component: CasesRoute,
});

function CasesRoute() {
  const navigate = Route.useNavigate();

  return (
    <CaseDashboardScreen
      onOpenGrimoire={() => navigate({ to: "/grimoire" })}
      onOpenMission={(missionId) =>
        navigate({ to: "/mission/$missionId", params: { missionId } })
      }
      onOpenTitle={() => navigate({ to: "/" })}
    />
  );
}
