import { describe, expect, it } from "vitest";
import { MissionAttempt } from "../../../features/mission/mission-attempt";
import { InMemorySqliteRuntime } from "../../../test/in-memory-sqlite-runtime";
import { halfFinishedBooking } from "./mission";

describe("The Half-Finished Booking", () => {
  it("accepts repairing and replaying the booking flow in a committed transaction", async () => {
    const attempt = new MissionAttempt(
      halfFinishedBooking,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(`
      BEGIN TRANSACTION;
      INSERT INTO bookings
        (id, room_id, booking_date, slot_hour, customer_id)
      VALUES
        (118, 3, '2026-07-24', 12, 5);
      INSERT INTO payments
        (id, booking_id, amount, paid_at)
      VALUES
        (2018, 118, 45, '2026-07-23 10:05:00');
      ROLLBACK;

      BEGIN TRANSACTION;
      DELETE FROM bookings WHERE id = 117;
      INSERT INTO bookings
        (id, room_id, booking_date, slot_hour, customer_id)
      VALUES
        (117, 2, '2026-07-23', 16, 7);
      INSERT INTO payments
        (id, booking_id, amount, paid_at)
      VALUES
        (2017, 117, 60, '2026-07-22 11:26:00');
      COMMIT;
    `);

    expect(submission.evaluation).toEqual({
      passed: true,
      earnedXp: halfFinishedBooking.reward.xp,
    });
    expect(submission.completion).toMatchObject({
      missionId: "finish-booking-atomically",
      missionTitle: "The Half-Finished Booking",
    });

    attempt.dispose();
  });

  it("rejects leaving the repaired booking flow uncommitted", async () => {
    const attempt = new MissionAttempt(
      halfFinishedBooking,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(`
      BEGIN TRANSACTION;
      DELETE FROM bookings WHERE id = 117;
      INSERT INTO bookings
        (id, room_id, booking_date, slot_hour, customer_id)
      VALUES
        (117, 2, '2026-07-23', 16, 7);
      INSERT INTO payments
        (id, booking_id, amount, paid_at)
      VALUES
        (2017, 117, 60, '2026-07-22 11:26:00');
    `);

    expect(submission.evaluation.passed).toBe(false);
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });

  it("rejects replaying the writes in autocommit mode", async () => {
    const attempt = new MissionAttempt(
      halfFinishedBooking,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(`
      DELETE FROM bookings WHERE id = 117;
      INSERT INTO bookings
        (id, room_id, booking_date, slot_hour, customer_id)
      VALUES
        (117, 2, '2026-07-23', 16, 7);
      INSERT INTO payments
        (id, booking_id, amount, paid_at)
      VALUES
        (2017, 117, 60, '2026-07-22 11:26:00');
    `);

    expect(submission.evaluation.passed).toBe(false);
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });

  it("rejects leaving the original half-finished booking unchanged", async () => {
    const attempt = new MissionAttempt(
      halfFinishedBooking,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit("SELECT 1;");

    expect(submission.evaluation.passed).toBe(false);
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });

  it("rejects repairing the pair by sacrificing legitimate payment history", async () => {
    const attempt = new MissionAttempt(
      halfFinishedBooking,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(`
      BEGIN TRANSACTION;
      DELETE FROM payments WHERE id = 2003;
      DELETE FROM bookings WHERE id = 117;
      INSERT INTO bookings
        (id, room_id, booking_date, slot_hour, customer_id)
      VALUES
        (117, 2, '2026-07-23', 16, 7);
      INSERT INTO payments
        (id, booking_id, amount, paid_at)
      VALUES
        (2017, 117, 60, '2026-07-22 11:26:00');
      COMMIT;
    `);

    expect(submission.evaluation.passed).toBe(false);
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });
});
