import type { Mission } from "../../../features/mission/mission-types";
import referenceSql from "./reference.sql?raw";
import schemaSql from "./schema.sql?raw";
import seedSql from "./seed.sql?raw";

export const paidNeverShipped: Mission = {
  // Persisted in saves — keep stable (original release slug).
  id: "unwritten-scrolls",
  title: "Paid, Never Shipped",
  caseId: "harborline",
  objective:
    "Find every confirmed order with no shipment record at all and return columns order_id, customer_name, city.",

  briefing: {
    reporter: "June Okafor",
    role: "Finance Auditor, Harborline Trading Co.",
    channel: "Month-end audit note",
    body: [
      "Delayed shipments at least leave a trail. What worries me at month-end is the order with no shipment record at all.",
      "The rules first, so we count the right gaps: a pending order has not earned a shipment record yet, and a cancelled order never will. Those absences are legitimate.",
      "But a confirmed order means we took the customer's money. If no shipment record follows it, goods left the warehouse without the database seeing them go — or never left at all. Either way, I cannot close the books over it.",
      "Send me every confirmed order that has no shipment record: order number, customer name, and city. Be precise — the database answers exactly what you ask, and nothing else.",
    ],
  },

  primer: {
    title: "Finding what is missing",
    sections: [
      {
        heading: "LEFT JOIN keeps the unmatched",
        body: 'INNER JOIN answers "what matches?" — it drops any row without a partner. LEFT JOIN also answers "what doesn\'t?": it keeps every row from the left table, and where nothing matches on the right, it fills the right-hand columns with NULL.',
        exampleSql:
          "SELECT o.id AS order_id, s.id AS shipment_id\nFROM orders AS o\nLEFT JOIN shipments AS s ON s.order_id = o.id;",
      },
      {
        heading: "NULL is an absence, not a value",
        body: "NULL never equals anything — not even another NULL — so = NULL matches nothing. Testing for absence needs its own operators: IS NULL and IS NOT NULL.",
        exampleSql:
          "SELECT NULL = NULL AS equals_null, NULL IS NULL AS is_null;",
      },
      {
        heading: "The anti-join shape",
        body: "LEFT JOIN, then keep only the rows whose right-hand key IS NULL: that isolates exactly the left rows that have no partner. This filter-for-NULL pattern is called an anti-join, and it is the standard way to ask a database what is missing.",
        exampleSql:
          "SELECT o.id AS order_id\nFROM orders AS o\nLEFT JOIN shipments AS s ON s.order_id = o.id\nWHERE s.id IS NULL;",
      },
    ],
  },

  database: { schemaSql, seedSql },

  challenge: {
    expectedColumns: ["order_id", "customer_name", "city"],
    referenceQuery: referenceSql.trim(),
    hints: [
      "An INNER JOIN keeps only orders that HAVE a shipment — the rows you're hunting are exactly the ones it throws away. You need the join that keeps every order: LEFT JOIN.",
      "After the LEFT JOIN, orders with no shipment carry NULL in every shipment column — catch them with s.id IS NULL (= NULL never matches; NULL isn't a value, it's an absence). And remember the audit rule: pending and cancelled orders are supposed to lack shipments.",
      "The shape: FROM orders AS o INNER JOIN customers AS c … LEFT JOIN shipments AS s ON o.id = s.order_id WHERE o.status = 'confirmed' AND s.id IS NULL.",
    ],
  },

  reward: {
    xp: 150,
    successMessage:
      'June checks your rows against the warehouse log and goes very quiet. Every one of them was picked and packed in the same week, and none of them was ever scanned out. That is not a courier problem — that is a gap between the warehouse floor and the database, and as of this afternoon it is an internal investigation. She closes the month with your query attached as evidence, and adds a note to your file: "Whatever case lands next, start with the data."',
  },

  explanation: {
    summary:
      'An INNER JOIN answers "what matches?" — a LEFT JOIN also answers "what doesn\'t?". It keeps every row from the left table and, where no shipment matches, fills the shipment columns with NULL; the filter s.id IS NULL therefore isolates exactly the orders no shipment ever referenced. IS NULL is required because NULL is not a value that = can match — it is the absence of one. The status filter does the other half of the work: pending and cancelled orders lack shipments legitimately, so WHERE o.status = \'confirmed\' keeps only the absences that should not exist.',
    concepts: [
      "LEFT JOIN",
      "IS NULL",
      "NULL semantics",
      "Finding absent rows (anti-join)",
    ],
  },
};
