import { roomCollisions } from "../../missions/cadence/01-collisions/mission";
import { refundExposure } from "../../missions/cadence/02-damage-report/mission";
import { bookingUniqueness } from "../../missions/cadence/03-booking-uniqueness/mission";
import { orphanedPayments } from "../../missions/cadence/04-orphaned-payments/mission";
import { delayedOrders } from "../../missions/harborline/01-delayed-orders/mission";
import { failingRoutes } from "../../missions/harborline/02-failing-routes/mission";
import { paidNeverShipped } from "../../missions/harborline/03-paid-never-shipped/mission";
import type { Mission } from "../mission/mission-types";

export interface Case {
  id: string;
  name: string;
  company: string;
  summary: string;
  /** Ordered: each Mission unlocks when every Mission before it is completed. */
  missionIds: readonly string[];
  /** Shown on the locked card of a Case that has no Missions yet — the
   *  unmet-demand probe. */
  comingSoonNote?: string;
}

export type CaseState = "available" | "completed" | "locked";
export type CaseMissionState = "completed" | "next" | "locked";

export interface CaseMissionView {
  mission: Mission;
  state: CaseMissionState;
}

export interface CaseView extends Case {
  state: CaseState;
  missions: readonly CaseMissionView[];
  completedCount: number;
  nextMissionId: string | null;
}

function missionState(
  index: number,
  completed: boolean,
  nextIndex: number,
): CaseMissionState {
  if (completed) {
    return "completed";
  }
  return index === nextIndex ? "next" : "locked";
}

export class CaseCatalog {
  private readonly missionsById: ReadonlyMap<string, Mission>;
  private readonly cases: readonly Case[];

  constructor(missions: readonly Mission[], cases: readonly Case[]) {
    validateCatalog(missions, cases);
    this.missionsById = new Map(
      missions.map((mission) => [mission.id, mission]),
    );
    this.cases = cases;
  }

  getMission(id: string): Mission | undefined {
    return this.missionsById.get(id);
  }

  /** Cases in catalog order. A Case is locked while the previous Case that
   *  has Missions is unfinished; a Case with no Missions is always locked. */
  getCases(
    isMissionCompleted: (missionId: string) => boolean = () => false,
  ): readonly CaseView[] {
    let previousUnfinished = false;

    return this.cases.map((caseDefinition) => {
      const missions = caseDefinition.missionIds.map(
        (missionId) => this.missionsById.get(missionId) as Mission,
      );
      const completedCount = missions.filter((mission) =>
        isMissionCompleted(mission.id),
      ).length;
      const finished =
        missions.length > 0 && completedCount === missions.length;
      const locked = missions.length === 0 || previousUnfinished;
      if (missions.length > 0) {
        previousUnfinished = previousUnfinished || !finished;
      }

      const nextIndex = missions.findIndex(
        (mission) => !isMissionCompleted(mission.id),
      );
      const missionViews = missions.map((mission, index) => ({
        mission,
        state: locked
          ? ("locked" as const)
          : missionState(index, isMissionCompleted(mission.id), nextIndex),
      }));

      let state: CaseState = "available";
      if (locked) {
        state = "locked";
      } else if (finished) {
        state = "completed";
      }

      let nextMissionId: string | null = null;
      if (!locked && missions.length > 0) {
        nextMissionId =
          nextIndex === -1 ? missions[0].id : missions[nextIndex].id;
      }

      return {
        ...caseDefinition,
        state,
        missions: missionViews,
        completedCount,
        nextMissionId,
      };
    });
  }
}

const missions: readonly Mission[] = [
  delayedOrders,
  failingRoutes,
  paidNeverShipped,
  roomCollisions,
  refundExposure,
  bookingUniqueness,
  orphanedPayments,
];

const cases: readonly Case[] = [
  {
    id: "harborline",
    name: "The Vanishing Orders",
    company: "Harborline Trading Co.",
    summary:
      "Customers have paid, but their orders are not arriving. Work Harborline's own database from the support queue down to the audit trail and find out why.",
    missionIds: [delayedOrders.id, failingRoutes.id, paidNeverShipped.id],
  },
  {
    id: "cadence",
    name: "The Double Booking",
    company: "Cadence Studios",
    summary:
      "Customers are arriving for rehearsal sessions only to find the same room sold twice. Trace the collisions from the calendar to the booking flow, then add the guarantees that keep them from returning.",
    missionIds: [
      roomCollisions.id,
      refundExposure.id,
      bookingUniqueness.id,
      orphanedPayments.id,
    ],
  },
];

export const caseCatalog = new CaseCatalog(missions, cases);

function validateCatalog(
  missionDefinitions: readonly Mission[],
  caseDefinitions: readonly Case[],
): void {
  assertUnique(
    missionDefinitions.map(({ id }) => id),
    "Mission",
  );
  assertUnique(
    caseDefinitions.map(({ id }) => id),
    "Case",
  );

  const casesById = new Map(
    caseDefinitions.map((caseDefinition) => [
      caseDefinition.id,
      caseDefinition,
    ]),
  );
  const missionsById = new Map(
    missionDefinitions.map((mission) => [mission.id, mission]),
  );

  assertMissionsBelongToCases(missionDefinitions, casesById);
  assertCasesReferenceKnownMissions(caseDefinitions, missionsById);
}

function assertMissionsBelongToCases(
  missionDefinitions: readonly Mission[],
  casesById: ReadonlyMap<string, Case>,
): void {
  for (const mission of missionDefinitions) {
    const caseDefinition = casesById.get(mission.caseId);
    if (!caseDefinition) {
      throw new Error(
        `Case catalog: Mission ${mission.id} references unknown Case ${mission.caseId}.`,
      );
    }
    if (!caseDefinition.missionIds.includes(mission.id)) {
      throw new Error(
        `Case catalog: Case ${caseDefinition.id} does not offer Mission ${mission.id}.`,
      );
    }
  }
}

function assertCasesReferenceKnownMissions(
  caseDefinitions: readonly Case[],
  missionsById: ReadonlyMap<string, Mission>,
): void {
  for (const caseDefinition of caseDefinitions) {
    for (const missionId of caseDefinition.missionIds) {
      const mission = missionsById.get(missionId);
      if (!mission) {
        throw new Error(
          `Case catalog: Case ${caseDefinition.id} references unknown Mission ${missionId}.`,
        );
      }
      if (mission.caseId !== caseDefinition.id) {
        throw new Error(
          `Case catalog: Mission ${mission.id} belongs to Case ${mission.caseId}, not ${caseDefinition.id}.`,
        );
      }
    }
  }
}

function assertUnique(ids: readonly string[], kind: "Mission" | "Case"): void {
  if (new Set(ids).size !== ids.length) {
    throw new Error(`Case catalog: ${kind} IDs must be unique.`);
  }
}
