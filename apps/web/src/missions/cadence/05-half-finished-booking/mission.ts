import type { Mission } from "../../../features/mission/mission-types";
import referenceSql from "./reference.sql?raw";
import schemaSql from "./schema.sql?raw";
import seedSql from "./seed.sql?raw";

export const halfFinishedBooking: Mission = {
  id: "finish-booking-atomically",
  title: "The Half-Finished Booking",
  caseId: "cadence",
  objective:
    "Rehearse rolling back a test booking and payment, then repair booking 117 and replay its two writes as one committed transaction. Preserve the rest of the ledger. Submit one or more SQL statements.",

  briefing: {
    reporter: "Rina Solis",
    role: "Studio Operations Manager, Cadence Studios",
    channel: "Booking service incident #284",
    body: [
      "The constraints held during this morning's restart, but Nadia Brooks still received a confirmation without a receipt. Booking 117 exists for the Drum Room at 4 p.m. today; its payment row does not.",
      "The service log shows the first line completed: `INSERT INTO bookings (id, room_id, booking_date, slot_hour, customer_id) VALUES (117, 2, '2026-07-23', 16, 7);`. The process then crashed. The next line never ran: `INSERT INTO payments (id, booking_id, amount, paid_at) VALUES (2017, 117, 60, '2026-07-22 11:26:00');`.",
      "Each row is valid on its own, so the UNIQUE and FOREIGN KEY guardrails cannot promise that both writes happen. Remove the half-finished booking, then replay both INSERTs inside one transaction and commit them as the single booking operation the database will guarantee.",
    ],
  },

  primer: {
    title: "Making a multi-step operation atomic",
    sections: [
      {
        heading: "Atomicity changes two writes into one promise",
        body: "A transaction defines one unit of work. `BEGIN TRANSACTION` opens it, every statement changes the same provisional state, and `COMMIT` makes the whole unit durable. Until that commit succeeds, the database can still abandon the unit without exposing only its first half. This Mission uses one SQLite session; coordinating overlapping writers is a later topic.",
      },
      {
        heading: "ROLLBACK restores the pre-transaction state",
        body: "When any step cannot finish, `ROLLBACK` discards every change made since `BEGIN`. The failed process is already gone, so its old half-state needs an explicit repair. The rollback guarantee protects the next attempt and every future booking flow.",
        exampleSql:
          "CREATE TEMP TABLE rollback_demo (note TEXT);\n\nBEGIN TRANSACTION;\nINSERT INTO rollback_demo (note)\nVALUES ('This provisional row will disappear');\nROLLBACK;\n\nSELECT note FROM rollback_demo;",
      },
      {
        heading: "Application cleanup cannot recreate atomicity",
        body: "A later application check can notice a missing payment and try to fix it, but another crash can interrupt that repair too. It also leaves a window in which other readers can observe the incomplete booking. Put both writes in the same transaction so the database, rather than a future code path, owns the all-or-nothing guarantee.",
      },
    ],
  },

  database: { schemaSql, seedSql },

  challenge: {
    referenceScript: referenceSql.trim(),
    probes: [
      {
        type: "query",
        sql: "SELECT id, room_id, booking_date, slot_hour, customer_id FROM bookings;",
      },
      {
        type: "query",
        sql: "SELECT id, booking_id, amount, paid_at FROM payments;",
      },
      {
        type: "query",
        sql: "SELECT b.id AS booking_id, p.id AS payment_id FROM bookings AS b INNER JOIN payments AS p ON p.booking_id = b.id WHERE b.id = 117;",
      },
      {
        type: "query",
        sql: "SELECT COUNT(*) AS bookings_without_payments FROM bookings AS b LEFT JOIN payments AS p ON p.booking_id = b.id WHERE p.id IS NULL;",
      },
      {
        type: "query",
        sql: "SELECT COUNT(*) AS payments_without_bookings FROM payments AS p LEFT JOIN bookings AS b ON b.id = p.booking_id WHERE b.id IS NULL;",
      },
      {
        type: "query",
        sql: "SELECT total_changes() AS transaction_changes;",
      },
      {
        type: "must-fail",
        sql: "ROLLBACK;",
      },
    ],
    hints: [
      "First run the Primer's rehearsal: begin a transaction, insert test booking 118 and payment 2018, then `ROLLBACK;`. Neither test row should remain.",
      "The earlier process already ended, so booking 117 cannot be rolled back now. Start a new transaction, delete that half-state, then insert booking 117 with room 2, date `2026-07-23`, slot 16, and customer 7.",
      "Inside the same transaction, insert payment 2017 for booking 117 with amount 60 and paid time `2026-07-22 11:26:00`, then `COMMIT;`. Every earlier ledger row must remain unchanged.",
    ],
  },

  reward: {
    xp: 200,
    successMessage:
      "Rina sees booking 117 and payment 2017 land together, with the earlier ledger untouched. A rollback rehearsal leaves neither test row behind. Cadence can now treat the booking and its payment as one database operation: commit both, or keep neither.",
  },

  explanation: {
    summary:
      "The repair removed the booking row left behind by the interrupted service, then replayed the booking and payment INSERTs inside one transaction. `BEGIN TRANSACTION` established their shared unit of work, `COMMIT` made both changes durable together, and `ROLLBACK` remains the failure path that discards every provisional change. This closes the Case's chain: you found the collisions, measured the refund exposure, prevented that kind of duplicate, prevented orphaned payments, and finally prevented the half-written cause by making the complete booking flow atomic.",
    concepts: [
      "Transactions",
      "Atomicity",
      "BEGIN TRANSACTION",
      "COMMIT",
      "ROLLBACK",
      "Multi-statement units of work",
    ],
  },
};
