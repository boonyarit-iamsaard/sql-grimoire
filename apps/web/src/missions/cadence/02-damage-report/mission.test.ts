import initSqlJs from "sql.js";
import { describe, expect, it } from "vitest";
import { isStateGrading } from "../../../features/mission/mission-types";
import { refundExposure } from "./mission";

describe("The Refund List", () => {
  it("totals refund exposure for every customer in a collided slot", async () => {
    const sql = await initSqlJs();
    const database = new sql.Database();
    database.run(refundExposure.database.schemaSql);
    database.run(refundExposure.database.seedSql);

    if (isStateGrading(refundExposure.challenge)) {
      throw new Error("Expected a result-graded Mission");
    }

    const [result] = database.exec(refundExposure.challenge.referenceQuery);
    const rows = [...result.values].sort((left, right) =>
      String(left[0]).localeCompare(String(right[0])),
    );

    expect(result.columns).toEqual([
      "customer_name",
      "affected_bookings",
      "refund_exposure",
    ]);
    expect(rows).toEqual([
      ["Avery Chen", 2, 125],
      ["Jordan Bell", 1, 80],
      ["Lena Ortiz", 1, 45],
      ["Marcus Webb", 1, 90],
      ["Mina Patel", 1, 60],
      ["Nadia Brooks", 1, 90],
      ["Theo Grant", 1, 60],
    ]);

    database.close();
  });
});
