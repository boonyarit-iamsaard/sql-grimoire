import { describe, expect, it } from "vitest";
import { MissionAttempt } from "../../../features/mission/mission-attempt";
import { InMemorySqliteRuntime } from "../../../test/in-memory-sqlite-runtime";
import { orphanedPayments } from "./mission";

describe("The Cleanup That Made It Worse", () => {
  it("accepts repairing the orphan and adding an enforced foreign key", async () => {
    const attempt = new MissionAttempt(
      orphanedPayments,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(`
      PRAGMA foreign_keys = ON;
      DELETE FROM payments WHERE id = 2002;
      CREATE TABLE guarded_payments (
        id INTEGER PRIMARY KEY,
        booking_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        paid_at TEXT NOT NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings (id)
      );
      INSERT INTO guarded_payments (id, booking_id, amount, paid_at)
      SELECT id, booking_id, amount, paid_at
      FROM payments;
      DROP TABLE payments;
      ALTER TABLE guarded_payments RENAME TO payments;
    `);

    expect(submission.evaluation).toEqual({
      passed: true,
      earnedXp: orphanedPayments.reward.xp,
    });
    expect(submission.completion).toMatchObject({
      missionId: "prevent-orphaned-payments",
      missionTitle: "The Cleanup That Made It Worse",
    });

    attempt.dispose();
  });

  it("rejects deleting the orphan without adding the foreign key", async () => {
    const attempt = new MissionAttempt(
      orphanedPayments,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(
      "DELETE FROM payments WHERE id = 2002;",
    );

    expect(submission.evaluation.passed).toBe(false);
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });

  it("rejects declaring the foreign key without enabling enforcement", async () => {
    const attempt = new MissionAttempt(
      orphanedPayments,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(`
      DELETE FROM payments WHERE id = 2002;
      CREATE TABLE guarded_payments (
        id INTEGER PRIMARY KEY,
        booking_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        paid_at TEXT NOT NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings (id)
      );
      INSERT INTO guarded_payments (id, booking_id, amount, paid_at)
      SELECT id, booking_id, amount, paid_at
      FROM payments;
      DROP TABLE payments;
      ALTER TABLE guarded_payments RENAME TO payments;
    `);

    expect(submission.evaluation.passed).toBe(false);
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });

  it("rejects a repair that removes a legitimate payment", async () => {
    const attempt = new MissionAttempt(
      orphanedPayments,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(`
      PRAGMA foreign_keys = ON;
      DELETE FROM payments WHERE id IN (2002, 2003);
      CREATE TABLE guarded_payments (
        id INTEGER PRIMARY KEY,
        booking_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        paid_at TEXT NOT NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings (id)
      );
      INSERT INTO guarded_payments (id, booking_id, amount, paid_at)
      SELECT id, booking_id, amount, paid_at
      FROM payments;
      DROP TABLE payments;
      ALTER TABLE guarded_payments RENAME TO payments;
    `);

    expect(submission.evaluation.passed).toBe(false);
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });

  it("rejects rebuilding the table without repairing the orphan", async () => {
    const attempt = new MissionAttempt(
      orphanedPayments,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(`
      CREATE TABLE guarded_payments (
        id INTEGER PRIMARY KEY,
        booking_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        paid_at TEXT NOT NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings (id)
      );
      INSERT INTO guarded_payments (id, booking_id, amount, paid_at)
      SELECT id, booking_id, amount, paid_at
      FROM payments;
      DROP TABLE payments;
      ALTER TABLE guarded_payments RENAME TO payments;
      PRAGMA foreign_keys = ON;
    `);

    expect(submission.evaluation.passed).toBe(false);
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });

  it("rejects a targeted constraint that blocks only the authored insert", async () => {
    const attempt = new MissionAttempt(
      orphanedPayments,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(`
      DELETE FROM payments WHERE id = 2002;
      CREATE TABLE guarded_payments (
        id INTEGER PRIMARY KEY,
        booking_id INTEGER NOT NULL CHECK (booking_id != 999),
        amount INTEGER NOT NULL,
        paid_at TEXT NOT NULL
      );
      INSERT INTO guarded_payments (id, booking_id, amount, paid_at)
      SELECT id, booking_id, amount, paid_at
      FROM payments;
      DROP TABLE payments;
      ALTER TABLE guarded_payments RENAME TO payments;
    `);

    expect(submission.evaluation.passed).toBe(false);
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });

  it("rejects a foreign key that cascades the careless booking delete", async () => {
    const attempt = new MissionAttempt(
      orphanedPayments,
      new InMemorySqliteRuntime(),
    );
    await attempt.open();

    const submission = await attempt.submit(`
      PRAGMA foreign_keys = ON;
      DELETE FROM payments WHERE id = 2002;
      CREATE TABLE guarded_payments (
        id INTEGER PRIMARY KEY,
        booking_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        paid_at TEXT NOT NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
      );
      INSERT INTO guarded_payments (id, booking_id, amount, paid_at)
      SELECT id, booking_id, amount, paid_at
      FROM payments;
      DROP TABLE payments;
      ALTER TABLE guarded_payments RENAME TO payments;
    `);

    expect(submission.evaluation.passed).toBe(false);
    expect(submission.completion).toBeNull();

    attempt.dispose();
  });
});
