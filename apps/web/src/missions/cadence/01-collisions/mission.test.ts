import initSqlJs from "sql.js";
import { describe, expect, it } from "vitest";
import { isStateGrading } from "../../../features/mission/mission-types";
import { roomCollisions } from "./mission";

describe("The Same Room, Twice", () => {
  it("finds only the room slots with multiple bookings", async () => {
    const sql = await initSqlJs();
    const database = new sql.Database();
    database.run(roomCollisions.database.schemaSql);
    database.run(roomCollisions.database.seedSql);

    if (isStateGrading(roomCollisions.challenge)) {
      throw new Error("Expected a result-graded Mission");
    }

    const [result] = database.exec(roomCollisions.challenge.referenceQuery);
    const rows = [...result.values].sort((left, right) =>
      String(left[0]).localeCompare(String(right[0])),
    );

    expect(result.columns).toEqual([
      "room_name",
      "booking_date",
      "slot_hour",
      "booking_count",
    ]);
    expect(rows).toEqual([
      ["Drum Room", "2026-07-19", 14, 2],
      ["Live Room", "2026-07-18", 18, 2],
      ["Production Suite", "2026-07-21", 10, 2],
      ["Writing Room", "2026-07-20", 19, 2],
    ]);

    database.close();
  });
});
