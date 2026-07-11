export type JournalEntry = {
  missionId: string;
  missionTitle: string;
  concepts: string[];
  playerQuery: string;
  referenceQuery: string;
  explanation: string;
  completedAt: string;
};

export type Progress = {
  xp: number;
  completedMissionIds: string[];
  journal: JournalEntry[];
  /** Last query the player submitted (or ran), per mission. */
  lastQueries: Record<string, string>;
  /** Mission the player is currently inside, for the Continue button. */
  currentMissionId: string | null;
};

export const emptyProgress: Progress = {
  xp: 0,
  completedMissionIds: [],
  journal: [],
  lastQueries: {},
  currentMissionId: null,
};
