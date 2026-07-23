import { createBrowserSqliteRuntime } from "../../sql/sqlite-runtime";
import { caseCatalog } from "../cases/case-catalog";
import { playerProgress } from "../progress/progress-store";
import { MissionAttempt } from "./mission-attempt";
import type { Mission } from "./mission-types";

export function createBrowserMissionAttempt(mission: Mission): MissionAttempt {
  return new MissionAttempt({
    mission,
    runtime: createBrowserSqliteRuntime(),
    progress: playerProgress,
    catalog: caseCatalog,
  });
}
