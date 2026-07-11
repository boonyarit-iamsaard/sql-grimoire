import { createHashRouter } from "react-router-dom";
import { GrimoirePage } from "../pages/grimoire-page";
import { LandingPage } from "../pages/landing-page";
import { MissionPage } from "../pages/mission-page";
import { WorldMapPage } from "../pages/world-map-page";
import { App } from "./app";

export const router = createHashRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/map", element: <WorldMapPage /> },
      { path: "/mission/:missionId", element: <MissionPage /> },
      { path: "/grimoire", element: <GrimoirePage /> },
    ],
  },
]);
