import type { Mission } from "../../../features/mission/mission-types";
import referenceSql from "./reference.sql?raw";
import schemaSql from "./schema.sql?raw";
import seedSql from "./seed.sql?raw";

export const orphanedPayments: Mission = {
  id: "prevent-orphaned-payments",
  title: "The Cleanup That Made It Worse",
  caseId: "cadence",
  objective:
    "Repair every payment whose booking no longer exists, then rebuild `payments` with an enforced FOREIGN KEY from `booking_id` to `bookings.id` that rejects invalid references and refuses deleting a booking that still has a payment. Preserve every legitimate payment. Submit one or more SQL statements.",

  briefing: {
    reporter: "Noor Shah",
    role: "Finance Manager, Cadence Studios",
    channel: "Incident remediation thread #284",
    body: [
      "The collision cleanup removed booking 102 from the calendar, but Finance still has payment 2002 against that booking ID. The refund was handled outside this ledger, so this row is now money attached to a booking the database says never existed.",
      "Find payments whose booking is missing and remove those orphans without touching the legitimate payment history. Then close the hole that allowed the careless delete to leave this state behind.",
      "The relationship must become a database guarantee: every future `payments.booking_id` must reference a real `bookings.id`. This is SQLite, so declaring the relationship is not enough by itself. Make sure enforcement is active when the repaired table takes over.",
    ],
  },

  primer: {
    title: "Turning a relationship into referential integrity",
    sections: [
      {
        heading: "An anti-join exposes broken references",
        body: "A payment should have exactly one parent booking. A `LEFT JOIN` keeps every payment even when no booking matches; filtering the booking side to `NULL` isolates the orphans. `NOT EXISTS` expresses the same absence directly. Either form finds the rows that violate the intended relationship before you add the guarantee.",
        exampleSql:
          "SELECT p.id, p.booking_id\nFROM payments AS p\nLEFT JOIN bookings AS b ON b.id = p.booking_id\nWHERE b.id IS NULL;",
      },
      {
        heading: "A FOREIGN KEY makes the relationship mandatory",
        body: "Application code can forget a cleanup step, run statements in the wrong order, or write from a maintenance script. A foreign key moves the rule into the database: a child value is accepted only when its parent key exists, and the default action refuses to delete a parent that still has children. The orphan is the application's fault only until the schema makes that state impossible.",
      },
      {
        heading: "SQLite requires enforcement and a table rebuild",
        body: "SQLite checks foreign keys only when the connection has run `PRAGMA foreign_keys = ON`. Put that statement before any transaction. SQLite also cannot add this constraint to an existing table with `ALTER TABLE`, so create a replacement table with the foreign key, copy the repaired rows, drop the old table, and rename the replacement. A transaction keeps that multi-step change together.",
        exampleSql:
          "PRAGMA foreign_keys = ON;\n\nBEGIN TRANSACTION;\nCREATE TABLE replacement_payments (\n    id INTEGER PRIMARY KEY,\n    booking_id INTEGER NOT NULL,\n    FOREIGN KEY (booking_id) REFERENCES bookings (id)\n);\n-- Copy repaired rows, replace the old table, then COMMIT.",
      },
    ],
  },

  database: { schemaSql, seedSql },

  challenge: {
    referenceScript: referenceSql.trim(),
    probes: [
      {
        type: "query",
        sql: "SELECT id, booking_id, amount, paid_at FROM payments;",
      },
      {
        type: "query",
        sql: "SELECT COUNT(*) AS orphaned_payments FROM payments AS p LEFT JOIN bookings AS b ON b.id = p.booking_id WHERE b.id IS NULL;",
      },
      {
        type: "must-fail",
        sql: "INSERT INTO payments (id, booking_id, amount, paid_at) VALUES (2017, 999, 75, '2026-07-23 09:00:00');",
      },
      {
        type: "must-fail",
        sql: "INSERT INTO payments (id, booking_id, amount, paid_at) VALUES (2018, 102, 90, '2026-07-23 09:15:00');",
      },
      {
        type: "must-fail",
        sql: "UPDATE payments SET booking_id = 997 WHERE id = 2001;",
      },
      {
        type: "must-fail",
        sql: "DELETE FROM bookings WHERE id = 101;",
      },
    ],
    hints: [
      "Start by locating the broken relationship: keep every payment with a `LEFT JOIN` to `bookings`, then filter for `b.id IS NULL`. Delete only those orphaned payment rows before copying data into the replacement table.",
      "SQLite cannot add this foreign key to the existing `payments` table. Create a replacement with the same four columns plus `FOREIGN KEY (booking_id) REFERENCES bookings (id)`, copy the repaired payments, drop the old table, and rename the replacement. Keep the default delete action so a booking with a payment cannot be deleted.",
      "Run `PRAGMA foreign_keys = ON;` before `BEGIN TRANSACTION`. Then perform the cleanup and table rebuild inside the transaction. The pragma is connection-level; declaring `REFERENCES` without enabling enforcement will not make the invalid insert fail.",
    ],
  },

  reward: {
    xp: 180,
    successMessage:
      "Noor reruns the orphan report: zero rows. All twelve legitimate payments still reconcile to real bookings. Finance tries both sides of the relationship: SQLite refuses a payment against booking 999 and refuses to delete booking 101 while its payment remains. The manual cleanup cannot leave the same kind of phantom behind again; referential integrity is now a guarantee shared by every writer.",
  },

  explanation: {
    summary:
      "The anti-join identified the payment whose parent booking had been deleted. Removing that orphan made the existing data valid enough to copy into a replacement `payments` table. The rebuilt table declares `booking_id` as a foreign key to `bookings.id`, while `PRAGMA foreign_keys = ON` activates SQLite's enforcement for the connection. The transaction keeps the cleanup and replacement together. The completed schema now rejects payments that reference nonexistent bookings and refuses to delete a booking while its payment remains, without sacrificing legitimate payment history.",
    concepts: [
      "Referential integrity",
      "FOREIGN KEY",
      "Anti-joins",
      "NOT EXISTS",
      "PRAGMA foreign_keys",
      "SQLite table rebuilds",
      "Transactional schema changes",
    ],
  },
};
