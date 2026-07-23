import { describe, expect, it } from "vitest";
import { caseCatalog } from "../features/cases/case-catalog";
import { isStateGrading } from "../features/mission/mission-types";
import type { QueryResult, SqlValue } from "../sql/sql-runtime";
import { verifyMission } from "./mission-verification";

const expectedResults = {
  "missing-shipment": {
    columns: ["order_id", "customer_name", "shipment_status"],
    rows: [
      [102, "Tobin Reed", "delayed"],
      [105, "Petra Hale", "delayed"],
      [107, "Nyra Solace", "delayed"],
      [110, "Tobin Reed", "delayed"],
    ],
  },
  "council-tally": {
    columns: ["city", "delayed_orders"],
    rows: [
      ["Duskharbor", 4],
      ["Thornfield", 2],
    ],
  },
  "unwritten-scrolls": {
    columns: ["order_id", "customer_name", "city"],
    rows: [
      [123, "Corvin Ash", "Windmere"],
      [124, "Wren Padley", "Windmere"],
      [125, "Lise Amber", "Emberfall"],
    ],
  },
  "double-booked-slots": {
    columns: ["room_name", "booking_date", "slot_hour", "booking_count"],
    rows: [
      ["Drum Room", "2026-07-19", 14, 2],
      ["Live Room", "2026-07-18", 18, 2],
      ["Production Suite", "2026-07-21", 10, 2],
      ["Writing Room", "2026-07-20", 19, 2],
    ],
  },
  "refund-exposure": {
    columns: ["customer_name", "affected_bookings", "refund_exposure"],
    rows: [
      ["Avery Chen", 2, 125],
      ["Jordan Bell", 1, 80],
      ["Lena Ortiz", 1, 45],
      ["Marcus Webb", 1, 90],
      ["Mina Patel", 1, 60],
      ["Nadia Brooks", 1, 90],
      ["Theo Grant", 1, 60],
    ],
  },
} satisfies Record<string, QueryResult>;

describe("Mission Verification", () => {
  for (const mission of caseCatalog.getMissions()) {
    it(`${mission.id} opens, teaches runnable examples, and grades its reference solution`, async () => {
      const verification = await verifyMission(mission);

      expect(verification.tables.length).toBeGreaterThan(0);
      for (const example of verification.primerExamples) {
        expect(example.run, example.heading).toMatchObject({ ok: true });
      }

      if (isStateGrading(mission.challenge)) {
        expect(verification.referenceResult).toBeNull();
        return;
      }

      const expected =
        expectedResults[mission.id as keyof typeof expectedResults];
      expect(
        expected,
        `${mission.id} needs independently authored expected results`,
      ).toBeDefined();
      expect(verification.referenceResult?.columns).toEqual(expected.columns);
      expect(canonicalRows(verification.referenceResult?.rows ?? [])).toEqual(
        canonicalRows(expected.rows),
      );
    });
  }
});

function canonicalRows(rows: SqlValue[][]): string[] {
  return rows.map((row) => JSON.stringify(row)).sort();
}
