import archivistNeutral from "../../assets/characters/archivist/neutral.svg";
import archivistStern from "../../assets/characters/archivist/stern.svg";
import archivistTroubled from "../../assets/characters/archivist/troubled.svg";
import type { Mission } from "../../features/mission/mission-types";
import referenceSql from "./reference.sql?raw";
import schemaSql from "./schema.sql?raw";
import seedSql from "./seed.sql?raw";

export const unwrittenScrolls: Mission = {
  id: "unwritten-scrolls",
  title: "The Unwritten Scrolls",
  locationId: "inner-archives",
  objective:
    "Find every confirmed order with no shipment record at all and return columns order_id, customer_name, city.",

  dialogue: [
    {
      id: "briefing-1",
      speaker: "Archivist Hesper",
      portrait: archivistTroubled,
      text: "I have pulled the books since you left, record-keeper. Delayed scrolls complain loudly — they are easy to hear. What frightens me is the scroll that says nothing at all.",
    },
    {
      id: "briefing-2",
      speaker: "Archivist Hesper",
      portrait: archivistNeutral,
      text: "Understand the ledger's rules first. A pending order has not earned its shipment scroll yet. A cancelled order never will. Those absences are honest. I can forgive an honest absence.",
    },
    {
      id: "briefing-3",
      speaker: "Archivist Hesper",
      portrait: archivistStern,
      text: "But an order marked confirmed took a customer's coin. If no scroll follows it, the goods walked out of this guild and the ledger never saw them go. That is not absence. That is erasure.",
    },
    {
      id: "briefing-4",
      speaker: "Archivist Hesper",
      portrait: archivistStern,
      text: "Bring me every confirmed order with no shipment scroll — its number, whose coin, which city. Careful, record-keeper. The ledger only answers what you ask it precisely.",
    },
  ],

  database: { schemaSql, seedSql },

  challenge: {
    expectedColumns: ["order_id", "customer_name", "city"],
    referenceQuery: referenceSql.trim(),
    hints: [
      "Mission one's JOIN keeps only orders that HAVE a shipment — the rows you're hunting are exactly the ones it throws away. You need the join that keeps every order: LEFT JOIN.",
      "After LEFT JOIN, orders with no scroll carry NULL in every shipment column — catch them with s.id IS NULL (= NULL never matches; NULL isn't a value, it's an absence). And remember Hesper's rule: pending and cancelled orders are supposed to lack scrolls.",
      "The shape: FROM orders AS o INNER JOIN customers AS c … LEFT JOIN shipments AS s ON o.id = s.order_id WHERE o.status = 'confirmed' AND s.id IS NULL.",
    ],
  },

  reward: {
    xp: 150,
    successMessage:
      'Hesper reads the three names, checks the dates against her shelf, and goes very still. "One week. Three confirmed orders, and every scroll unwritten. This wasn\'t sloppiness — someone inside the guild lifted these from the record." She seals your findings with the archive\'s mark. "This goes beyond my shelves now, record-keeper. Whoever did this walks streets the guild map doesn\'t show — yet."',
  },

  explanation: {
    summary:
      'An INNER JOIN answers "what matches?" — a LEFT JOIN also answers "what doesn\'t?". It keeps every row from the left table and, where no shipment matches, fills the shipment columns with NULL; the filter s.id IS NULL therefore isolates exactly the orders no shipment ever referenced. IS NULL is required because NULL is not a value that = can match — it is the absence of one. The status filter does the other half of the work: pending and cancelled orders lack scrolls legitimately, so WHERE o.status = \'confirmed\' keeps only the absences that should not exist.',
    concepts: [
      "LEFT JOIN",
      "IS NULL",
      "NULL semantics",
      "Finding absent rows (anti-join)",
    ],
  },
};
