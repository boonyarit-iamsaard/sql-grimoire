import innerArchivesImage from "../../assets/locations/inner-archives.svg";
import lockedLocationImage from "../../assets/locations/locked-location.svg";
import merchantGuildImage from "../../assets/locations/merchant-guild.svg";
import { councilTally } from "../../missions/council-tally/mission";
import { missingShipment } from "../../missions/missing-shipment/mission";
import { unwrittenScrolls } from "../../missions/unwritten-scrolls/mission";
import type { Mission } from "../mission/mission-types";

export interface CampaignLocation {
  id: string;
  name: string;
  mapImage: string;
  position: { left: string; top: string };
  missionIds: readonly string[];
  availability: "available" | "locked";
  /** When set, the Location ignores `availability` and unlocks once every
   *  Mission of the referenced Location is completed. */
  prerequisiteLocationId?: string;
  lockedTitle?: string;
}

export type CampaignLocationState = "available" | "completed" | "locked";

export interface CampaignLocationView extends CampaignLocation {
  state: CampaignLocationState;
  nextMissionId: string | null;
}

function locationState(
  locked: boolean,
  completed: boolean,
): CampaignLocationState {
  if (locked) {
    return "locked";
  }
  if (completed) {
    return "completed";
  }
  return "available";
}

export class CampaignCatalog {
  private readonly missionsById: ReadonlyMap<string, Mission>;
  private readonly locations: readonly CampaignLocation[];
  private readonly locationsById: ReadonlyMap<string, CampaignLocation>;

  constructor(
    missions: readonly Mission[],
    locations: readonly CampaignLocation[],
  ) {
    validateCatalog(missions, locations);
    this.missionsById = new Map(
      missions.map((mission) => [mission.id, mission]),
    );
    this.locations = locations;
    this.locationsById = new Map(
      locations.map((location) => [location.id, location]),
    );
  }

  getMission(id: string): Mission | undefined {
    return this.missionsById.get(id);
  }

  getLocations(
    isMissionCompleted: (missionId: string) => boolean = () => false,
  ): readonly CampaignLocationView[] {
    const isLocationCompleted = (location: CampaignLocation): boolean =>
      location.missionIds.length > 0 &&
      location.missionIds.every(isMissionCompleted);

    return this.locations.map((location) => {
      const prerequisite = location.prerequisiteLocationId
        ? this.locationsById.get(location.prerequisiteLocationId)
        : undefined;
      const locked =
        location.missionIds.length === 0 ||
        (prerequisite
          ? !isLocationCompleted(prerequisite)
          : location.availability === "locked");
      const nextMissionId = locked
        ? null
        : (location.missionIds.find(
            (missionId) => !isMissionCompleted(missionId),
          ) ?? location.missionIds[0]);
      const completed = !locked && isLocationCompleted(location);

      return {
        ...location,
        state: locationState(locked, completed),
        nextMissionId,
      };
    });
  }
}

const missions: readonly Mission[] = [
  missingShipment,
  councilTally,
  unwrittenScrolls,
];

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
    id: "inner-archives",
    name: "Inner Archives",
    mapImage: innerArchivesImage,
    position: { left: "56%", top: "34%" },
    missionIds: [councilTally.id, unwrittenScrolls.id],
    availability: "locked",
    prerequisiteLocationId: "merchant-guild",
    lockedTitle: "Locked — complete the Merchant Guild mission first",
  },
  {
    id: "future-location",
    name: "???",
    mapImage: lockedLocationImage,
    position: { left: "74%", top: "43%" },
    missionIds: [],
    availability: "locked",
    lockedTitle: "Locked — the story continues beyond the archives",
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

  assertAcyclicPrerequisites(locationDefinitions, locationsById);

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
    if (
      location.prerequisiteLocationId !== undefined &&
      !locationsById.has(location.prerequisiteLocationId)
    ) {
      throw new Error(
        `Campaign catalog: Location ${location.id} prerequisite references unknown Location ${location.prerequisiteLocationId}.`,
      );
    }
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

function assertAcyclicPrerequisites(
  locationDefinitions: readonly CampaignLocation[],
  locationsById: ReadonlyMap<string, CampaignLocation>,
): void {
  for (const start of locationDefinitions) {
    const visited = new Set<string>();
    let current: CampaignLocation | undefined = start;
    while (current?.prerequisiteLocationId !== undefined) {
      visited.add(current.id);
      if (visited.has(current.prerequisiteLocationId)) {
        throw new Error(
          `Campaign catalog: Location prerequisites must not form a cycle (via ${start.id}).`,
        );
      }
      current = locationsById.get(current.prerequisiteLocationId);
    }
  }
}
