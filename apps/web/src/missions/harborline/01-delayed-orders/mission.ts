import type { Mission } from "../../../features/mission/mission-types";
import referenceSql from "./reference.sql?raw";
import schemaSql from "./schema.sql?raw";
import seedSql from "./seed.sql?raw";

export const delayedOrders: Mission = {
  // Persisted in saves — keep stable (original release slug).
  id: "missing-shipment",
  title: "Delayed Orders Piling Up",
  caseId: "harborline",
  objective:
    "Find all delayed orders and return the order ID, customer name, and shipment status as columns order_id, customer_name, shipment_status.",

  briefing: {
    reporter: "Priya Sharma",
    role: "Customer Support Lead, Harborline Trading Co.",
    channel: "Support ticket #4136 (escalated)",
    body: [
      "We've had eleven tickets this week from customers asking where their orders are. I can look orders up in the admin panel one at a time, but I can't get a single list of everything that's stuck.",
      "Our database tracks every customer, every order, and every shipment. Somewhere in there is the list of shipments marked 'delayed' — I just don't have the SQL to pull it.",
      "I need the order IDs and the customer names so the team can send apologies and revised delivery dates before this turns into a refund queue.",
      "Can you pull each delayed order's ID, the customer's name, and the shipment status? The workbench is connected to a copy of our database.",
    ],
  },

  primer: {
    title: "Reading across tables with JOIN",
    sections: [
      {
        heading: "Reading one table",
        body: "SELECT picks the columns, FROM names the table, and WHERE keeps only the rows that pass a condition. Strings are compared in single quotes.",
        exampleSql:
          "SELECT name, city\nFROM customers\nWHERE city = 'Duskharbor';",
      },
      {
        heading: "Following a foreign key with INNER JOIN",
        body: "An order row does not store the customer's name — it stores a customer_id pointing at the customers table. INNER JOIN stitches two tables together wherever the ON condition matches, and drops rows that have no match on the other side.",
        exampleSql:
          "SELECT orders.id, customers.name\nFROM orders\nINNER JOIN customers ON orders.customer_id = customers.id;",
      },
      {
        heading: "Aliases name your output",
        body: "AS renames an output column, and short table aliases keep multi-table queries readable. When a task asks for exact column names, AS is how you deliver them.",
        exampleSql:
          "SELECT o.id AS order_id, c.name AS customer_name\nFROM orders AS o\nINNER JOIN customers AS c ON o.customer_id = c.id;",
      },
    ],
  },

  database: { schemaSql, seedSql },

  challenge: {
    expectedColumns: ["order_id", "customer_name", "shipment_status"],
    referenceQuery: referenceSql.trim(),
    hints: [
      "Start from the shipments table — you only care about rows WHERE status = 'delayed'.",
      "shipments.order_id links to orders.id, and orders.customer_id links to customers.id. That's two INNER JOINs.",
      "The output needs exact column names: use AS, e.g. o.id AS order_id, c.name AS customer_name, s.status AS shipment_status.",
    ],
  },

  reward: {
    xp: 100,
    successMessage:
      "Priya matches your list against the open tickets and exhales — every stuck order is accounted for. Tobin Reed, Petra Hale, Nyra Solace… all on routes out of Duskharbor, where the coastal road has been closed for a week. Apology emails with revised dates go out within the hour, and the refund queue stays empty. Operations has already asked who wrote the query.",
  },

  explanation: {
    summary:
      "The answer lives in three tables, so the query joins them along their foreign keys: shipments point at orders (shipments.order_id = orders.id) and orders point at customers (orders.customer_id = customers.id). INNER JOIN keeps only rows that match on both sides, the WHERE clause keeps only shipments whose status is 'delayed', and AS renames each output column to exactly what the ticket asked for.",
    concepts: [
      "SELECT",
      "Table aliases",
      "INNER JOIN",
      "Filtering with WHERE",
      "Selecting columns from multiple tables",
    ],
  },
};
