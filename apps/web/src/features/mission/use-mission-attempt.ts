import { useEffect, useState, useSyncExternalStore } from "react";
import { createBrowserMissionAttempt } from "./mission-attempt-factory";
import type { Mission } from "./mission-types";

export function useMissionAttempt(mission: Mission) {
  const [attempt] = useState(() => createBrowserMissionAttempt(mission));
  const snapshot = useSyncExternalStore(
    attempt.subscribe,
    attempt.getSnapshot,
    attempt.getSnapshot,
  );

  useEffect(() => {
    void attempt.open();
    return () => attempt.dispose();
  }, [attempt]);

  return { attempt, snapshot };
}
