import { createHashRouter } from "react-router-dom";
import { GrimoirePage } from "../pages/GrimoirePage";
import { LandingPage } from "../pages/LandingPage";
import { MissionPage } from "../pages/MissionPage";
import { WorldMapPage } from "../pages/WorldMapPage";
import { App } from "./App";

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
