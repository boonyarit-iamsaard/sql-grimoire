import { useSyncExternalStore } from "react";
import type { MissionCompletion } from "../mission/mission-attempt";
import {
  emptyProgress,
  type GrimoireEntry,
  type Progress,
} from "./progress-types";

const STORAGE_KEY = "sql-rpg-progress-v1";

type ProgressStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export class PlayerProgress {
  private progress: Progress;
  private readonly listeners = new Set<() => void>();
  private version = 0;

  constructor(
    private readonly storage: ProgressStorage,
    private readonly now: () => Date = () => new Date(),
  ) {
    this.progress = load(storage);
  }

  get xp(): number {
    return this.progress.xp;
  }

  get grimoireEntries(): readonly GrimoireEntry[] {
    return this.progress.journal;
  }

  get currentMissionId(): string | null {
    return this.progress.currentMissionId;
  }

  hasSavedProgress(): boolean {
    return (
      this.progress.xp > 0 ||
      this.progress.completedMissionIds.length > 0 ||
      this.progress.currentMissionId !== null
    );
  }

  isMissionCompleted(missionId: string): boolean {
    return this.progress.completedMissionIds.includes(missionId);
  }

  lastQueryFor(missionId: string): string {
    return this.progress.lastQueries[missionId] ?? "";
  }

  recordLastQuery(missionId: string, query: string): void {
    this.save({
      ...this.progress,
      lastQueries: { ...this.progress.lastQueries, [missionId]: query },
    });
  }

  enterMission(missionId: string | null): void {
    if (this.progress.currentMissionId === missionId) {
      return;
    }
    this.save({ ...this.progress, currentMissionId: missionId });
  }

  completeMission(completion: MissionCompletion): void {
    const alreadyCompleted = this.isMissionCompleted(completion.missionId);
    const entry: GrimoireEntry = {
      missionId: completion.missionId,
      missionTitle: completion.missionTitle,
      concepts: completion.concepts,
      playerQuery: completion.playerQuery,
      referenceQuery: completion.referenceQuery,
      explanation: completion.explanation,
      completedAt: this.now().toISOString(),
    };

    this.save({
      ...this.progress,
      xp: alreadyCompleted
        ? this.progress.xp
        : this.progress.xp + completion.xp,
      completedMissionIds: alreadyCompleted
        ? this.progress.completedMissionIds
        : [...this.progress.completedMissionIds, completion.missionId],
      journal: [
        ...this.progress.journal.filter(
          ({ missionId }) => missionId !== completion.missionId,
        ),
        entry,
      ],
      currentMissionId: null,
    });
  }

  reset(): void {
    this.progress = freshProgress();
    try {
      this.storage.removeItem(STORAGE_KEY);
    } catch {
      // Progress still resets in memory when durable storage is unavailable.
    }
    this.publish();
  }

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly getVersion = (): number => this.version;

  private save(next: Progress): void {
    this.progress = next;
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Progress remains available for this page load when storage is blocked.
    }
    this.publish();
  }

  private publish(): void {
    this.version += 1;
    this.listeners.forEach((listener) => {
      listener();
    });
  }
}

function load(storage: ProgressStorage): Progress {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? normalizeProgress(JSON.parse(raw)) : freshProgress();
  } catch {
    return freshProgress();
  }
}

function normalizeProgress(value: unknown): Progress {
  if (!isRecord(value)) {
    return freshProgress();
  }

  return {
    xp:
      typeof value.xp === "number" && Number.isFinite(value.xp) ? value.xp : 0,
    completedMissionIds: stringArray(value.completedMissionIds),
    journal: Array.isArray(value.journal)
      ? value.journal.filter(isGrimoireEntry)
      : [],
    lastQueries: stringRecord(value.lastQueries),
    currentMissionId:
      typeof value.currentMissionId === "string"
        ? value.currentMissionId
        : null,
  };
}

function freshProgress(): Progress {
  return {
    ...emptyProgress,
    completedMissionIds: [],
    journal: [],
    lastQueries: {},
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function stringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function isGrimoireEntry(value: unknown): value is GrimoireEntry {
  return (
    isRecord(value) &&
    typeof value.missionId === "string" &&
    typeof value.missionTitle === "string" &&
    stringArray(value.concepts).length ===
      (Array.isArray(value.concepts) ? value.concepts.length : -1) &&
    typeof value.playerQuery === "string" &&
    typeof value.referenceQuery === "string" &&
    typeof value.explanation === "string" &&
    typeof value.completedAt === "string"
  );
}

const memoryStorage: ProgressStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function browserStorage(): ProgressStorage {
  try {
    return globalThis.localStorage ?? memoryStorage;
  } catch {
    return memoryStorage;
  }
}

export const playerProgress = new PlayerProgress(browserStorage());

export function usePlayerProgress(): PlayerProgress {
  useSyncExternalStore(playerProgress.subscribe, playerProgress.getVersion);
  return playerProgress;
}
