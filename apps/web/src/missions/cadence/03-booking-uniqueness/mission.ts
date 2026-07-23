import type { Mission } from "../../../features/mission/mission-types";
import referenceSql from "./reference.sql?raw";
import schemaSql from "./schema.sql?raw";
import seedSql from "./seed.sql?raw";

export const bookingUniqueness: Mission = {
  id: "prevent-double-booking",
  title: "Nothing Stopped It",
  caseId: "cadence",
  objective:
    "Add a database-level UNIQUE guardrail that prevents two bookings from sharing the same room, booking date, and slot hour. Preserve every booking in the cleaned ledger. Submit one or more SQL statements.",

  briefing: {
    reporter: "Rina Solis",
    role: "Studio Operations Manager, Cadence Studios",
    channel: "Incident remediation thread #284",
    body: [
      "Finance issued the refunds, and the front desk moved or cancelled one booking from each collided slot. The ledger in front of you is the cleaned version: every remaining room, date, and hour is legitimate and must survive the repair.",
      "The booking service checked the calendar before each sale, but two requests still reached the database before either check saw the other. The schema accepted both because nothing there says a room slot must be unique.",
      "Put that rule where every writer has to obey it. The database must reject any future booking that repeats the same room, date, and hour, without deleting or rewriting the bookings we kept.",
    ],
  },

  primer: {
    title: "Turning a business rule into a database guarantee",
    sections: [
      {
        heading: "Constraints protect invariants at the storage boundary",
        body: "A constraint is a rule the database checks whenever data changes. Application validation can provide a friendly warning, but it is only a check made at one moment by one writer. A database constraint is the final guarantee shared by every application, script, import, and concurrent request.",
      },
      {
        heading: "UNIQUE can cover a composite business key",
        body: "A `UNIQUE` rule rejects a new row when its protected value combination already exists. Cadence's slot is not one column: room, booking date, and slot hour define it together. Protecting fewer columns blocks valid bookings; leaving one out permits another kind of collision.",
        exampleSql:
          "CREATE UNIQUE INDEX one_payment_per_booking\nON payments (booking_id);",
      },
      {
        heading: "SQLite offers declarations and indexes",
        body: "When creating a table, SQLite accepts `UNIQUE` beside a single column or as a table constraint over several columns. For an existing table, a unique index adds the same behavioral guarantee without rebuilding it. SQLite refuses to create the guardrail if current rows already violate it, which is why Operations cleaned the collided bookings first. If you test the rule by inserting a duplicate, keep the constraint-violation message: it proves the database enforced the invariant.",
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
        type: "must-fail",
        sql: "INSERT INTO bookings (id, room_id, booking_date, slot_hour, customer_id) VALUES (117, 1, '2026-07-18', 18, 2);",
      },
      {
        type: "must-fail",
        sql: "INSERT INTO bookings (id, room_id, booking_date, slot_hour, customer_id) VALUES (118, 1, '2026-07-18', 17, 1);",
      },
      {
        type: "must-fail",
        sql: "INSERT INTO bookings (id, room_id, booking_date, slot_hour, customer_id) VALUES (119, 1, '2026-07-18', 19, 7);",
      },
      {
        type: "must-fail",
        sql: "INSERT INTO bookings (id, room_id, booking_date, slot_hour, customer_id) VALUES (120, 2, '2026-07-19', 14, 4);",
      },
      {
        type: "must-fail",
        sql: "INSERT INTO bookings (id, room_id, booking_date, slot_hour, customer_id) VALUES (121, 2, '2026-07-19', 15, 3);",
      },
      {
        type: "must-fail",
        sql: "INSERT INTO bookings (id, room_id, booking_date, slot_hour, customer_id) VALUES (122, 3, '2026-07-20', 19, 2);",
      },
      {
        type: "must-fail",
        sql: "INSERT INTO bookings (id, room_id, booking_date, slot_hour, customer_id) VALUES (123, 3, '2026-07-20', 18, 4);",
      },
      {
        type: "must-fail",
        sql: "INSERT INTO bookings (id, room_id, booking_date, slot_hour, customer_id) VALUES (124, 3, '2026-07-20', 20, 8);",
      },
      {
        type: "must-fail",
        sql: "INSERT INTO bookings (id, room_id, booking_date, slot_hour, customer_id) VALUES (125, 4, '2026-07-21', 10, 7);",
      },
      {
        type: "must-fail",
        sql: "INSERT INTO bookings (id, room_id, booking_date, slot_hour, customer_id) VALUES (126, 4, '2026-07-20', 18, 1);",
      },
      {
        type: "must-fail",
        sql: "INSERT INTO bookings (id, room_id, booking_date, slot_hour, customer_id) VALUES (127, 4, '2026-07-21', 11, 6);",
      },
      {
        type: "must-fail",
        sql: "INSERT INTO bookings (id, room_id, booking_date, slot_hour, customer_id) VALUES (128, 1, '2026-07-22', 18, 5);",
      },
    ],
    hints: [
      "The rule belongs to the complete slot key: `room_id`, `booking_date`, and `slot_hour` together. A constraint on only one or two of those columns would reject legitimate bookings or miss collisions.",
      "The ledger has already been cleaned, so the guardrail can be added without deleting data. If your workbench contains experimental changes, Reset restores the clean starting point before you submit.",
      "For an existing SQLite table, use `CREATE UNIQUE INDEX <name> ON bookings (room_id, booking_date, slot_hour);`. The index name is your choice; grading tests behavior, not SQL text.",
    ],
  },

  reward: {
    xp: 160,
    successMessage:
      "Rina retries the exact room, date, and hour that once slipped through. SQLite refuses it with the signal the team needed: UNIQUE constraint failed: bookings.room_id, bookings.booking_date, bookings.slot_hour. All twelve cleaned bookings remain intact, and the calendar now has a database-level guarantee instead of a timing-sensitive promise from the booking service. During the audit, Finance notices the next hole: payments can still point at booking IDs that do not exist.",
  },

  explanation: {
    summary:
      "The unique index turns Cadence's composite slot key into an invariant enforced by SQLite. Any insert or update that would repeat the same `room_id`, `booking_date`, and `slot_hour` now fails, regardless of which application or script writes the row. The three columns must be protected together: uniqueness on `room_id` alone would allow only one booking per room forever, while omitting the date or hour would either reject valid sessions or permit collisions. Because the ledger was cleaned before the change, the guardrail could be added without sacrificing legitimate bookings.",
    concepts: [
      "Database constraints",
      "UNIQUE",
      "Unique indexes",
      "Composite business keys",
      "Application checks versus database guarantees",
      "Constraint violations",
    ],
  },
};
