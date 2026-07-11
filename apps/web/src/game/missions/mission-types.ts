import type { DialogueLine } from "../dialogue/dialogue-types";

export type Mission = {
  id: string;
  title: string;
  locationId: string;
  objective: string;

  dialogue: DialogueLine[];

  database: {
    schemaSql: string;
    seedSql: string;
  };

  challenge: {
    expectedColumns: string[];
    referenceQuery: string;
    hints: string[];
  };

  reward: {
    xp: number;
    successMessage: string;
  };

  explanation: {
    summary: string;
    concepts: string[];
  };
};
