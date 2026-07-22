import type { Mission } from "../../../features/mission/mission-types";
import referenceSql from "./reference.sql?raw";
import schemaSql from "./schema.sql?raw";
import seedSql from "./seed.sql?raw";

export const refundExposure: Mission = {
  id: "refund-exposure",
  title: "The Refund List",
  caseId: "cadence",
  objective:
    "List every customer whose booking belongs to a double-booked room slot. Return the customer name, number of affected bookings, and total refund exposure as columns `customer_name`, `affected_bookings`, and `refund_exposure`.",

  briefing: {
    reporter: "Noor Shah",
    role: "Finance Manager, Cadence Studios",
    channel: "Incident finance thread #284",
    body: [
      "Rina's collision report confirms that four room slots were sold twice. Every booking in those slots has a valid payment, and Finance is preparing to refund the affected customers before they call us first.",
      "I need one line per customer, not one line per booking. Some customers may appear in more than one collided slot, so combine all of their affected bookings and payment amounts into a single exposure total.",
      "Use the same complete slot key as the collision report: room, date, and hour together. Adjacent hours and the same hour on another date are legitimate bookings and must stay out of the refund list.",
    ],
  },

  primer: {
    title: "Joining a summary back to detail rows",
    sections: [
      {
        heading: "A grouped query can identify keys, not just final answers",
        body: "Mission one grouped bookings to find the room, date, and hour keys that repeat. That summary can become an intermediate result: a compact list of the collided slot keys that later joins can use like a table.",
      },
      {
        heading: "Use a CTE to name the intermediate result",
        body: "A common table expression starts with `WITH name AS (...)` and gives a query result a temporary name for the statement that follows. This separates the first question — which keys qualify? — from the next question — which detail rows belong to those keys?",
        exampleSql:
          "WITH repeat_customers AS (\n    SELECT customer_id, COUNT(*) AS booking_count\n    FROM bookings\n    GROUP BY customer_id\n    HAVING COUNT(*) > 1\n)\nSELECT c.name, rc.booking_count, b.booking_date, b.slot_hour\nFROM repeat_customers AS rc\nINNER JOIN customers AS c ON rc.customer_id = c.id\nINNER JOIN bookings AS b ON rc.customer_id = b.customer_id;",
      },
      {
        heading: "Join on the complete key, then summarize again",
        body: "Join every column that defines the slot so unrelated bookings cannot enter the result. Once the matching booking rows are restored, follow their customer and payment relationships, then group by customer identity and aggregate the rows into the incident report Finance requested.",
      },
    ],
  },

  database: { schemaSql, seedSql },

  challenge: {
    expectedColumns: ["customer_name", "affected_bookings", "refund_exposure"],
    referenceQuery: referenceSql.trim(),
    hints: [
      "First build the same collision set as Mission one: group `bookings` by `room_id`, `booking_date`, and `slot_hour`, then keep groups with `HAVING COUNT(*) > 1`.",
      "Put that collision query in a CTE. Join it back to `bookings` on all three slot columns, then join the matching bookings to `customers` and `payments`.",
      "Group the restored detail rows by `c.id` and `c.name`. Return `COUNT(*) AS affected_bookings` and `SUM(p.amount) AS refund_exposure` beside `c.name AS customer_name`.",
    ],
  },

  reward: {
    xp: 140,
    successMessage:
      "Noor checks all seven names against the payment ledger: eight affected bookings and 550 in refund exposure. Avery Chen appears twice, exactly as Finance feared. With the customers and amounts settled, Rina asks the question behind the incident: why did the database accept two bookings for the same slot at all?",
  },

  explanation: {
    summary:
      "The CTE first reduces the booking ledger to the composite keys that occur more than once. Joining those keys back to `bookings` restores every affected detail row while excluding adjacent hours and matching hours on other dates. The customer and payment joins attach the business identity and refund amount to each affected booking. Finally, grouping by both customer ID and name combines repeated appearances safely, `COUNT(*)` measures each customer's affected bookings, and `SUM(p.amount)` calculates the total refund exposure.",
    concepts: [
      "Common table expressions",
      "Joining aggregates to detail rows",
      "Composite join conditions",
      "COUNT",
      "SUM",
      "Multi-stage aggregation",
    ],
  },
};
