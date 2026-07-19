import { createFileRoute } from "@tanstack/react-router";
import { GrimoireScreen } from "../features/grimoire/grimoire-screen";

export const Route = createFileRoute("/grimoire")({
  component: GrimoireRoute,
});

function GrimoireRoute() {
  const navigate = Route.useNavigate();

  return <GrimoireScreen onBack={() => navigate({ to: "/cases" })} />;
}
