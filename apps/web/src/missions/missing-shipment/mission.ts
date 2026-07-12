import merchantNeutral from "../../assets/characters/merchant/neutral.svg";
import merchantWorried from "../../assets/characters/merchant/worried.svg";
import type { Mission } from "../../features/mission/mission-types";
import referenceSql from "./reference.sql?raw";
import schemaSql from "./schema.sql?raw";
import seedSql from "./seed.sql?raw";

export const missingShipment: Mission = {
  id: "missing-shipment",
  title: "The Missing Shipment",
  locationId: "merchant-guild",
  objective:
    "Find all delayed orders and return the order ID, customer name, and shipment status as columns order_id, customer_name, shipment_status.",

  dialogue: [
    {
      id: "briefing-1",
      speaker: "Merchant Odalia",
      portrait: merchantWorried,
      text: "Thank the roads you're here, record-keeper. Four caravans left our gates this fortnight — and customers keep arriving to say their goods never came.",
    },
    {
      id: "briefing-2",
      speaker: "Merchant Odalia",
      portrait: merchantWorried,
      text: "The guild ledger tracks every customer, every order, every shipment. Somewhere in those tables is a list of shipments marked 'delayed' — I just can't read the ledger-script.",
    },
    {
      id: "briefing-3",
      speaker: "Merchant Odalia",
      portrait: merchantNeutral,
      text: "I need to know which orders are stuck and whose names are on them, so I can send riders with apologies before the whole town turns on us.",
    },
    {
      id: "briefing-4",
      speaker: "Merchant Odalia",
      portrait: merchantNeutral,
      text: "Bring me each delayed order's ID, the customer's name, and the shipment status. The ledger desk is yours.",
    },
  ],

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
      'Odalia runs a finger down your list and exhales. "Tobin, Petra, Nyra, and Tobin again — of course, the Duskharbor road is flooded." Riders are dispatched within the hour, apologies and honey-cakes in hand. By dusk, the guild\'s reputation is safe, and the doorkeeper waves you through to the inner archives.',
  },

  explanation: {
    summary:
      "The answer lives in three tables, so the query joins them along their foreign keys: shipments point at orders (shipments.order_id = orders.id) and orders point at customers (orders.customer_id = customers.id). INNER JOIN keeps only rows that match on both sides, the WHERE clause keeps only shipments whose status is 'delayed', and AS renames each output column to what the guild asked for.",
    concepts: [
      "SELECT",
      "Table aliases",
      "INNER JOIN",
      "Filtering with WHERE",
      "Selecting columns from multiple tables",
    ],
  },
};
