// localStorage-backed progress store with a React subscription hook.
import { useSyncExternalStore } from "react";
import {
  emptyProgress,
  type JournalEntry,
  type Progress,
} from "./progress-types";

const STORAGE_KEY = "sql-rpg-progress-v1";

let cache: Progress = load();
const listeners = new Set<() => void>();

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress;
    return { ...emptyProgress, ...JSON.parse(raw) };
  } catch {
    return emptyProgress;
  }
}

function save(next: Progress) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full/blocked — progress just won't survive a refresh.
  }
  listeners.forEach((l) => {
    l();
  });
}

export function getProgress(): Progress {
  return cache;
}

export function hasSavedProgress(): boolean {
  return (
    cache.xp > 0 ||
    cache.completedMissionIds.length > 0 ||
    cache.currentMissionId !== null
  );
}

export function recordLastQuery(missionId: string, query: string) {
  save({ ...cache, lastQueries: { ...cache.lastQueries, [missionId]: query } });
}

export function setCurrentMission(missionId: string | null) {
  if (cache.currentMissionId === missionId) return;
  save({ ...cache, currentMissionId: missionId });
}

export function completeMission(entry: JournalEntry, xp: number) {
  const alreadyDone = cache.completedMissionIds.includes(entry.missionId);
  save({
    ...cache,
    xp: alreadyDone ? cache.xp : cache.xp + xp,
    completedMissionIds: alreadyDone
      ? cache.completedMissionIds
      : [...cache.completedMissionIds, entry.missionId],
    journal: [
      ...cache.journal.filter((j) => j.missionId !== entry.missionId),
      entry,
    ],
    currentMissionId: null,
  });
}

export function resetProgress() {
  save(emptyProgress);
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => cache,
  );
}
