import lockedLocationImage from "../../assets/locations/locked-location.svg";
import merchantGuildImage from "../../assets/locations/merchant-guild.svg";
import { missingShipment } from "../missions/missing-shipment";
import type { Mission } from "../missions/mission-types";

export type CampaignLocation = {
  id: string;
  name: string;
  mapImage: string;
  position: { left: string; top: string };
  missionId: string | null;
  availability: "available" | "locked";
  lockedTitle?: string;
};

export type CampaignLocationView = CampaignLocation & {
  state: "available" | "completed" | "locked";
};

const missions: readonly Mission[] = [missingShipment];

const locations: readonly CampaignLocation[] = [
  {
    id: "merchant-guild",
    name: "Merchant Guild",
    mapImage: merchantGuildImage,
    position: { left: "37%", top: "68%" },
    missionId: missingShipment.id,
    availability: "available",
  },
  {
    id: "future-location",
    name: "???",
    mapImage: lockedLocationImage,
    position: { left: "74%", top: "43%" },
    missionId: null,
    availability: "locked",
    lockedTitle: "Locked — complete the Merchant Guild mission first",
  },
];

validateCatalog(missions, locations);

export function getMission(id: string): Mission | undefined {
  return missions.find((mission) => mission.id === id);
}

export function getCampaignLocations(
  isMissionCompleted: (missionId: string) => boolean = () => false,
): readonly CampaignLocationView[] {
  return locations.map((location) => ({
    ...location,
    state:
      location.availability === "locked" || location.missionId === null
        ? "locked"
        : isMissionCompleted(location.missionId)
          ? "completed"
          : "available",
  }));
}

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
  const missionIds = new Set(missionDefinitions.map(({ id }) => id));

  for (const mission of missionDefinitions) {
    if (!locationsById.has(mission.locationId)) {
      throw new Error(
        `Campaign catalog: Mission ${mission.id} references unknown Location ${mission.locationId}.`,
      );
    }
  }
  for (const location of locationDefinitions) {
    if (location.missionId && !missionIds.has(location.missionId)) {
      throw new Error(
        `Campaign catalog: Location ${location.id} references unknown Mission ${location.missionId}.`,
      );
    }
  }
}

function assertUnique(ids: string[], kind: "Mission" | "Location"): void {
  if (new Set(ids).size !== ids.length) {
    throw new Error(`Campaign catalog: ${kind} IDs must be unique.`);
  }
}
