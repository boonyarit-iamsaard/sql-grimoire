import type { Mission } from "../../../features/mission/mission-types";
import referenceSql from "./reference.sql?raw";
import schemaSql from "./schema.sql?raw";
import seedSql from "./seed.sql?raw";

export const failingRoutes: Mission = {
  // Persisted in saves — keep stable (original release slug).
  id: "council-tally",
  title: "Which Routes Are Failing?",
  caseId: "harborline",
  objective:
    "Count delayed orders per city and return only the cities with two or more, as columns `city`, `delayed_orders`.",

  briefing: {
    reporter: "Marcus Vale",
    role: "Operations Manager, Harborline Trading Co.",
    channel: "Ops planning thread",
    body: [
      "Support cleared the backlog, but I need to know where the delays are coming from before I book more courier capacity. One delayed order is bad luck. Two or more going to the same city means the route to that city is failing.",
      "Budget review is Thursday. I can argue for rerouting, but only with counts — nobody funds a hunch.",
      "Count the delayed orders per delivery city, and send me only the cities with two or more, together with their counts. Anything below that threshold is noise I don't want in the deck.",
    ],
  },

  primer: {
    title: "Grouping and counting",
    sections: [
      {
        heading: "Collapsing rows into groups",
        body: "`GROUP BY` collapses rows that share a value into one row per group, and aggregate functions like `COUNT(*)` then summarize each group. Every column you `SELECT` must be either grouped or aggregated.",
        exampleSql:
          "SELECT status, COUNT(*) AS orders\nFROM orders\nGROUP BY status;",
      },
      {
        heading: "WHERE filters rows, HAVING filters groups",
        body: "`WHERE` runs before grouping and decides which rows may enter a group. `HAVING` runs after grouping and decides which finished groups survive. A condition on `COUNT(*)` can only live in `HAVING`, because the count does not exist until the group is complete.",
        exampleSql:
          "SELECT city, COUNT(*) AS customers\nFROM customers\nGROUP BY city\nHAVING COUNT(*) >= 2;",
      },
      {
        heading: "Grouping across a join",
        body: "The column you group by can come from a joined table. Join first, then `GROUP BY` — the grouping sees the stitched-together rows.",
        exampleSql:
          "SELECT c.city, COUNT(*) AS orders\nFROM orders AS o\nINNER JOIN customers AS c ON o.customer_id = c.id\nGROUP BY c.city;",
      },
    ],
  },

  database: { schemaSql, seedSql },

  challenge: {
    expectedColumns: ["city", "delayed_orders"],
    referenceQuery: referenceSql.trim(),
    hints: [
      "You want one row per city, not one per shipment — that is what `GROUP BY` does: it collapses rows into groups.",
      "Filter to delayed shipments with `WHERE` first, then `GROUP BY` the customer's city and `COUNT(*)` each group. A condition on the count itself cannot go in `WHERE` — that is what `HAVING` is for.",
      "The shape: `SELECT c.city, COUNT(*) AS delayed_orders … GROUP BY c.city HAVING COUNT(*) >= 2`.",
    ],
  },

  reward: {
    xp: 120,
    successMessage:
      "Marcus drops your two rows into the budget deck without editing them. Duskharbor: four delayed orders — the closed coastal road, proven by data instead of anecdote. Thornfield: two, enough to flag. Rerouting through the inland depot is approved Thursday morning. While checking your numbers against the order list, though, he notices something odd: a few confirmed orders seem to have no shipment record at all…",
  },

  explanation: {
    summary:
      "The query filters, groups, and then filters again — in that order. `WHERE` keeps only delayed shipments before any grouping happens; `GROUP BY c.city` collapses the surviving rows into one row per city; `COUNT(*)` counts the rows inside each group; and `HAVING` inspects each finished count, keeping only groups of two or more. `WHERE` decides which rows may enter a group, and `HAVING` decides which groups survive — a condition on the count can only live in `HAVING`, because the count does not exist until the group is complete.",
    concepts: [
      "GROUP BY",
      "COUNT",
      "HAVING",
      "WHERE versus HAVING",
      "Aggregating across joined tables",
    ],
  },
};
