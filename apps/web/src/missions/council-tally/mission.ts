import archivistNeutral from "../../assets/characters/archivist/neutral.svg";
import archivistStern from "../../assets/characters/archivist/stern.svg";
import type { Mission } from "../../features/mission/mission-types";
import referenceSql from "./reference.sql?raw";
import schemaSql from "./schema.sql?raw";
import seedSql from "./seed.sql?raw";

export const councilTally: Mission = {
  id: "council-tally",
  title: "The Council's Tally",
  locationId: "inner-archives",
  objective:
    "Count delayed orders per city and return only the cities with two or more, as columns city, delayed_orders.",

  dialogue: [
    {
      id: "briefing-1",
      speaker: "Archivist Hesper",
      portrait: archivistNeutral,
      text: "So the doorkeeper let you through. I am Hesper, keeper of the inner records — mind the dust, it outranks you. The council votes at dawn on which trade road receives this season's repair funds.",
    },
    {
      id: "briefing-2",
      speaker: "Archivist Hesper",
      portrait: archivistStern,
      text: "Every district representative swears their road is the ruin of them. Emberfall wails, Windmere mutters, Duskharbor floods — allegedly. Grievance is cheap. The ledger does not wail; it counts.",
    },
    {
      id: "briefing-3",
      speaker: "Archivist Hesper",
      portrait: archivistStern,
      text: "The council floor hears patterns, not misfortunes. One delayed order is bad luck. Two or more — that is a road failing its city, and the ledger can prove it.",
    },
    {
      id: "briefing-4",
      speaker: "Archivist Hesper",
      portrait: archivistNeutral,
      text: "Tally the delayed orders by city and bring me every city with two or more, along with its count. Odalia counts coins; I count consequences. The ledger desk is yours.",
    },
  ],

  database: { schemaSql, seedSql },

  challenge: {
    expectedColumns: ["city", "delayed_orders"],
    referenceQuery: referenceSql.trim(),
    hints: [
      "You want one row per city, not one per shipment — that is what GROUP BY does: it collapses rows into groups.",
      "Filter to delayed shipments with WHERE first, then GROUP BY the customer's city and COUNT(*) each group. A condition on the count itself cannot go in WHERE — that is what HAVING is for.",
      "The shape: SELECT c.city, COUNT(*) AS delayed_orders … GROUP BY c.city HAVING COUNT(*) >= 2.",
    ],
  },

  reward: {
    xp: 120,
    successMessage:
      'Hesper reads the tally twice — she trusts nothing read once. "Duskharbor, four. Thornfield, two. A pattern, twice over." At dawn the council votes the repair funds to the Duskharbor causeway, and riders carry warnings to Thornfield\'s wardens. As she files your tally, Hesper pauses at the shelf, frowning. "Odd. Some of these orders have no shipment scroll at all. Not delayed — simply… absent."',
  },

  explanation: {
    summary:
      "The query filters, groups, and then filters again — in that order. WHERE keeps only delayed shipments before any grouping happens; GROUP BY c.city collapses the surviving rows into one row per city; COUNT(*) counts the rows inside each group; and HAVING inspects each finished count, keeping only groups of two or more. WHERE decides which rows may enter a group, and HAVING decides which groups survive — a condition on the count can only live in HAVING, because the count does not exist until the group is complete.",
    concepts: [
      "GROUP BY",
      "COUNT",
      "HAVING",
      "WHERE versus HAVING",
      "Aggregating across joined tables",
    ],
  },
};
