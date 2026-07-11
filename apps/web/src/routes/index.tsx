import { createFileRoute } from "@tanstack/react-router";
import { LandingScreen } from "../features/landing/landing-screen";

export const Route = createFileRoute("/")({
  component: LandingRoute,
});

function LandingRoute() {
  const navigate = Route.useNavigate();

  return <LandingScreen onOpenMap={() => navigate({ to: "/map" })} />;
}
