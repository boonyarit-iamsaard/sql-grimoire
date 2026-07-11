import merchantNeutral from "../../assets/characters/merchant/neutral.svg";
import merchantWorried from "../../assets/characters/merchant/worried.svg";
import type { Mission } from "./mission-types";

const schemaSql = `
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE shipments (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    shipped_at TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
`;

const seedSql = `
INSERT INTO customers (id, name, city) VALUES
  (1, 'Mara Voss',      'Emberfall'),
  (2, 'Tobin Reed',     'Duskharbor'),
  (3, 'Ilsa Thorn',     'Emberfall'),
  (4, 'Corvin Ash',     'Windmere'),
  (5, 'Petra Hale',     'Duskharbor'),
  (6, 'Aldric Stone',   'Windmere'),
  (7, 'Nyra Solace',    'Emberfall'),
  (8, 'Bram Oakes',     'Thornfield');

INSERT INTO orders (id, customer_id, status, created_at) VALUES
  (101, 1, 'confirmed', '2026-06-28'),
  (102, 2, 'confirmed', '2026-06-29'),
  (103, 3, 'confirmed', '2026-06-30'),
  (104, 4, 'pending',   '2026-07-01'),
  (105, 5, 'confirmed', '2026-07-01'),
  (106, 6, 'confirmed', '2026-07-02'),
  (107, 7, 'confirmed', '2026-07-03'),
  (108, 1, 'confirmed', '2026-07-04'),
  (109, 8, 'cancelled', '2026-07-05'),
  (110, 2, 'confirmed', '2026-07-05');

INSERT INTO shipments (id, order_id, status, shipped_at) VALUES
  (201, 101, 'delivered',  '2026-06-30'),
  (202, 102, 'delayed',    '2026-07-01'),
  (203, 103, 'delivered',  '2026-07-02'),
  (204, 105, 'delayed',    '2026-07-03'),
  (205, 106, 'in_transit', '2026-07-04'),
  (206, 107, 'delayed',    NULL),
  (207, 108, 'in_transit', '2026-07-06'),
  (208, 110, 'delayed',    '2026-07-07');
`;

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
    referenceQuery: `
SELECT
    o.id AS order_id,
    c.name AS customer_name,
    s.status AS shipment_status
FROM orders AS o
JOIN customers AS c
    ON c.id = o.customer_id
JOIN shipments AS s
    ON s.order_id = o.id
WHERE s.status = 'delayed';
`.trim(),
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
