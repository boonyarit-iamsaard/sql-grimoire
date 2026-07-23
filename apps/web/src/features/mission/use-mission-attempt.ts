import { useEffect, useState, useSyncExternalStore } from "react";
import { createBrowserMissionAttempt } from "./mission-attempt-factory";
import type { Mission } from "./mission-types";

export function useMissionAttempt(mission: Mission) {
  const [attempt, setAttempt] = useState(() =>
    createBrowserMissionAttempt(mission),
  );
  const snapshot = useSyncExternalStore(
    attempt.subscribe,
    attempt.getSnapshot,
    attempt.getSnapshot,
  );

  useEffect(() => {
    // A remount — StrictMode's double-invoked effect, or navigating back to the
    // same mission — runs cleanup on the attempt that state still holds. Dispose
    // is terminal (the SQL worker is gone and cannot be reopened), so replace the
    // dead attempt instead of calling open() on it.
    if (attempt.getSnapshot().phase === "disposed") {
      setAttempt(createBrowserMissionAttempt(attempt.getSnapshot().mission));
      return;
    }
    void attempt.open();
    return () => attempt.dispose();
  }, [attempt]);

  return { attempt, snapshot };
}
