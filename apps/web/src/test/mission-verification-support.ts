import { CaseCatalog } from "../features/cases/case-catalog";
import type { MissionAttemptSnapshot } from "../features/mission/mission-attempt";
import { MissionAttempt } from "../features/mission/mission-attempt";
import type { Mission } from "../features/mission/mission-types";
import { PlayerProgress } from "../features/progress/progress-store";
import type { SqlRuntime } from "../sql/sql-runtime";
import { InMemorySqliteRuntime } from "./in-memory-sqlite-runtime";

class VerificationStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

export function createTestMissionAttempt(
  mission: Mission,
  runtime: SqlRuntime = new InMemorySqliteRuntime(),
): MissionAttempt {
  return new MissionAttempt({
    mission,
    runtime,
    progress: new PlayerProgress(new VerificationStorage()),
    catalog: new CaseCatalog(
      [mission],
      [
        {
          id: mission.caseId,
          name: "Test Case",
          company: "Test Company",
          summary: "Test fixture.",
          missionIds: [mission.id],
        },
      ],
    ),
  });
}

export async function submitMission(
  mission: Mission,
  query: string,
): Promise<MissionAttemptSnapshot> {
  const attempt = createTestMissionAttempt(mission);
  try {
    await attempt.open();
    attempt.setQuery(query);
    await attempt.submit();
    return attempt.getSnapshot();
  } finally {
    attempt.dispose();
  }
}
