import { describe, expect, it } from "vitest";
import { MissionAttempt } from "../../../features/mission/mission-attempt";
import { InMemorySqliteRuntime } from "../../../test/in-memory-sqlite-runtime";
import { bookingUniqueness } from "./mission";

describe("Nothing Stopped It", () => {
  it("accepts a uniqueness guardrail without losing legitimate bookings", async () => {
    const attempt = new MissionAttempt(
      bookingUniqueness,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(
      "CREATE UNIQUE INDEX player_booking_slot ON bookings (slot_hour, room_id, booking_date);",
    );

    expect(submission.evaluation).toEqual({
      passed: true,
      earnedXp: bookingUniqueness.reward.xp,
    });
    expect(submission.completion).toMatchObject({
      missionId: "prevent-double-booking",
      missionTitle: "Nothing Stopped It",
    });
    expect(bookingUniqueness.reward.successMessage).toContain(
      "UNIQUE constraint failed",
    );

    attempt.dispose();
  });

  it("accepts rebuilding the table with a UNIQUE constraint", async () => {
    const attempt = new MissionAttempt(
      bookingUniqueness,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(`
      CREATE TABLE guarded_bookings (
        id INTEGER PRIMARY KEY,
        room_id INTEGER NOT NULL,
        booking_date TEXT NOT NULL,
        slot_hour INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        UNIQUE (room_id, booking_date, slot_hour),
        FOREIGN KEY (room_id) REFERENCES rooms (id),
        FOREIGN KEY (customer_id) REFERENCES customers (id)
      );
      INSERT INTO guarded_bookings
      SELECT id, room_id, booking_date, slot_hour, customer_id
      FROM bookings;
      DROP TABLE bookings;
      ALTER TABLE guarded_bookings RENAME TO bookings;
    `);

    expect(submission.evaluation).toEqual({
      passed: true,
      earnedXp: bookingUniqueness.reward.xp,
    });

    attempt.dispose();
  });

  it("rejects an index that does not enforce uniqueness", async () => {
    const attempt = new MissionAttempt(
      bookingUniqueness,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(
      "CREATE INDEX player_booking_slot ON bookings (room_id, booking_date, slot_hour);",
    );

    expect(submission.evaluation).toMatchObject({
      passed: false,
      reason: "PROBE_FAILED",
    });
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });

  it("rejects a guardrail that blocks separate rooms at the same time", async () => {
    const attempt = new MissionAttempt(
      bookingUniqueness,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(
      "CREATE UNIQUE INDEX player_booking_slot ON bookings (booking_date, slot_hour);",
    );

    expect(submission.evaluation.passed).toBe(false);
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });

  it("rejects a guardrail that protects only one room", async () => {
    const attempt = new MissionAttempt(
      bookingUniqueness,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(`
      CREATE UNIQUE INDEX player_booking_slot
      ON bookings (room_id, booking_date, slot_hour)
      WHERE room_id = 1;
    `);

    expect(submission.evaluation).toMatchObject({
      passed: false,
      reason: "PROBE_FAILED",
    });
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });

  it("rejects a guardrail that protects only earlier booking dates", async () => {
    const attempt = new MissionAttempt(
      bookingUniqueness,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(`
      CREATE UNIQUE INDEX player_booking_slot
      ON bookings (room_id, booking_date, slot_hour)
      WHERE booking_date <= '2026-07-21';
    `);

    expect(submission.evaluation).toMatchObject({
      passed: false,
      reason: "PROBE_FAILED",
    });
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });

  it("rejects a guardrail that includes the customer in the slot key", async () => {
    const attempt = new MissionAttempt(
      bookingUniqueness,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(`
      CREATE UNIQUE INDEX player_booking_slot
      ON bookings (room_id, booking_date, slot_hour, customer_id);
    `);

    expect(submission.evaluation).toMatchObject({
      passed: false,
      reason: "PROBE_FAILED",
    });
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });

  it("rejects a guardrail script that removes a legitimate booking", async () => {
    const attempt = new MissionAttempt(
      bookingUniqueness,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(`
      DELETE FROM bookings WHERE id = 103;
      CREATE UNIQUE INDEX player_booking_slot
      ON bookings (room_id, booking_date, slot_hour);
    `);

    expect(submission.evaluation).toMatchObject({
      passed: false,
      reason: "INCORRECT_ROWS",
    });
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });
});
