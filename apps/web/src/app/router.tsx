import { createHashRouter } from "react-router-dom";
import { App } from "./App";
import { LandingPage } from "../pages/LandingPage";
import { WorldMapPage } from "../pages/WorldMapPage";
import { MissionPage } from "../pages/MissionPage";
import { GrimoirePage } from "../pages/GrimoirePage";

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
