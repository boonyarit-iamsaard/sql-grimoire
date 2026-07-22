import type { Mission } from "../../../features/mission/mission-types";
import referenceSql from "./reference.sql?raw";
import schemaSql from "./schema.sql?raw";
import seedSql from "./seed.sql?raw";

export const roomCollisions: Mission = {
  id: "double-booked-slots",
  title: "The Same Room, Twice",
  caseId: "cadence",
  objective:
    "Find every room and hour slot with more than one booking. Return the room name, booking date, slot hour, and booking count as columns `room_name`, `booking_date`, `slot_hour`, `booking_count`.",

  briefing: {
    reporter: "Rina Solis",
    role: "Studio Operations Manager, Cadence Studios",
    channel: "Front desk escalation #284",
    body: [
      "Two bands arrived for the Live Room at 6 p.m. on Saturday. Both had confirmation emails, both had paid, and neither booking looked unusual when the front desk opened it on its own.",
      "The team remembers similar arguments in other rooms this week, but the calendar is too crowded to trust memory. We need to know whether this was one bad slot or a pattern before tonight's sessions begin.",
      "Send me every room, date, and hour that was sold more than once, together with the number of bookings in that slot. Adjacent hours are valid bookings, and the same hour on another day is a different slot — do not pull those into the incident.",
    ],
  },

  primer: {
    title: "Using groups to detect collisions",
    sections: [
      {
        heading: "Find the business key behind the duplicate",
        body: "Every booking has a unique `id`, so grouping by that column can never reveal a collision. The repeated thing the business cares about is the slot: one room, on one date, at one hour. Those three columns form the business key you need to test.",
      },
      {
        heading: "Count complete keys, then keep the repeats",
        body: "Duplicate detection uses the familiar grouping shape on every column in the business key. `COUNT(*)` measures how often each complete key occurs, and `HAVING COUNT(*) > 1` keeps only keys claimed by multiple rows. Leaving out part of the key creates false collisions between things the business considers different.",
        exampleSql:
          "SELECT booking_id, amount, COUNT(*) AS payment_count\nFROM payments\nGROUP BY booking_id, amount\nHAVING COUNT(*) > 1;",
      },
    ],
  },

  database: { schemaSql, seedSql },

  challenge: {
    expectedColumns: [
      "room_name",
      "booking_date",
      "slot_hour",
      "booking_count",
    ],
    referenceQuery: referenceSql.trim(),
    hints: [
      "One slot is defined by three values together: `room_id`, `booking_date`, and `slot_hour`. Grouping by only the date or hour will mix unrelated bookings.",
      "Use `COUNT(*)` to measure each group, then keep only repeated groups with `HAVING COUNT(*) > 1`. An aggregate condition cannot go in `WHERE` because the count does not exist until after grouping.",
      "Join `rooms` to return its name. The shape is `SELECT r.name AS room_name, b.booking_date, b.slot_hour, COUNT(*) AS booking_count ... GROUP BY r.id, r.name, b.booking_date, b.slot_hour HAVING COUNT(*) > 1`.",
    ],
  },

  reward: {
    xp: 120,
    successMessage:
      "Rina checks your four rows against the confirmation emails. Eight bookings carry valid receipts for four rooms, each promised to two people at once. The front desk blocks the collided slots while Finance starts calculating refunds — and asks for the names and amounts behind your counts.",
  },

  explanation: {
    summary:
      "The query treats the room, booking date, and slot hour as one business key. `GROUP BY` collapses bookings that share that complete key, `COUNT(*)` measures how many bookings landed in each slot, and `HAVING COUNT(*) > 1` keeps only the groups that repeat. Including every part of the key matters: grouping by the hour alone would merge different rooms and dates, while grouping by the date alone would merge unrelated sessions throughout the day. The join adds the room's business-facing name without changing which bookings form a collision.",
    concepts: [
      "GROUP BY with multiple columns",
      "COUNT",
      "HAVING",
      "Composite business keys",
      "Duplicate detection",
    ],
  },
};
