/** The incident report that opens a Mission: who at the company is asking,
 *  where the request arrived, and what they say — in their own words. */
export interface IncidentBriefing {
  reporter: string;
  role: string;
  /** Where the report arrived, e.g. "Support ticket #4136". */
  channel: string;
  body: string[];
}

export interface PrimerSection {
  heading: string;
  body: string;
  /** A self-contained example the learner can copy and run against the
   *  Case's schema. Never the mission solution — the hint ladder owns that. */
  exampleSql?: string;
}

/** The short lesson attached to a Mission: the concept the Mission requires,
 *  taught beside the workbench so nobody has to leave the platform. */
export interface Primer {
  title: string;
  sections: PrimerSection[];
}

export interface Mission {
  id: string;
  title: string;
  caseId: string;
  objective: string;

  briefing: IncidentBriefing;
  primer: Primer;

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
}
