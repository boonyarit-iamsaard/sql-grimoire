import lockedLocationImage from "../../assets/locations/locked-location.svg";
import merchantGuildImage from "../../assets/locations/merchant-guild.svg";
import { missingShipment } from "../missions/missing-shipment";
import type { Mission } from "../missions/mission-types";

export type CampaignLocation = {
  id: string;
  name: string;
  mapImage: string;
  position: { left: string; top: string };
  missionIds: readonly string[];
  availability: "available" | "locked";
  lockedTitle?: string;
};

export type CampaignLocationView = CampaignLocation & {
  state: "available" | "completed" | "locked";
  nextMissionId: string | null;
};

export class CampaignCatalog {
  private readonly missionsById: ReadonlyMap<string, Mission>;
  private readonly locations: readonly CampaignLocation[];

  constructor(
    missions: readonly Mission[],
    locations: readonly CampaignLocation[],
  ) {
    validateCatalog(missions, locations);
    this.missionsById = new Map(
      missions.map((mission) => [mission.id, mission]),
    );
    this.locations = locations;
  }

  getMission(id: string): Mission | undefined {
    return this.missionsById.get(id);
  }

  getLocations(
    isMissionCompleted: (missionId: string) => boolean = () => false,
  ): readonly CampaignLocationView[] {
    return this.locations.map((location) => {
      const locked =
        location.availability === "locked" || location.missionIds.length === 0;
      const nextMissionId = locked
        ? null
        : (location.missionIds.find(
            (missionId) => !isMissionCompleted(missionId),
          ) ?? location.missionIds[0]);
      const completed =
        !locked && location.missionIds.every(isMissionCompleted);

      return {
        ...location,
        state: locked ? "locked" : completed ? "completed" : "available",
        nextMissionId,
      };
    });
  }
}

const missions: readonly Mission[] = [missingShipment];

const locations: readonly CampaignLocation[] = [
  {
    id: "merchant-guild",
    name: "Merchant Guild",
    mapImage: merchantGuildImage,
    position: { left: "37%", top: "68%" },
    missionIds: [missingShipment.id],
    availability: "available",
  },
  {
    id: "future-location",
    name: "???",
    mapImage: lockedLocationImage,
    position: { left: "74%", top: "43%" },
    missionIds: [],
    availability: "locked",
    lockedTitle: "Locked — complete the Merchant Guild mission first",
  },
];

export const campaignCatalog = new CampaignCatalog(missions, locations);

function validateCatalog(
  missionDefinitions: readonly Mission[],
  locationDefinitions: readonly CampaignLocation[],
): void {
  assertUnique(
    missionDefinitions.map(({ id }) => id),
    "Mission",
  );
  assertUnique(
    locationDefinitions.map(({ id }) => id),
    "Location",
  );

  const locationsById = new Map(
    locationDefinitions.map((location) => [location.id, location]),
  );
  const missionsById = new Map(
    missionDefinitions.map((mission) => [mission.id, mission]),
  );

  for (const mission of missionDefinitions) {
    const location = locationsById.get(mission.locationId);
    if (!location) {
      throw new Error(
        `Campaign catalog: Mission ${mission.id} references unknown Location ${mission.locationId}.`,
      );
    }
    if (!location.missionIds.includes(mission.id)) {
      throw new Error(
        `Campaign catalog: Location ${location.id} does not offer Mission ${mission.id}.`,
      );
    }
  }
  for (const location of locationDefinitions) {
    for (const missionId of location.missionIds) {
      const mission = missionsById.get(missionId);
      if (!mission) {
        throw new Error(
          `Campaign catalog: Location ${location.id} references unknown Mission ${missionId}.`,
        );
      }
      if (mission.locationId !== location.id) {
        throw new Error(
          `Campaign catalog: Mission ${mission.id} belongs to Location ${mission.locationId}, not ${location.id}.`,
        );
      }
    }
  }
}

function assertUnique(ids: string[], kind: "Mission" | "Location"): void {
  if (new Set(ids).size !== ids.length) {
    throw new Error(`Campaign catalog: ${kind} IDs must be unique.`);
  }
}
