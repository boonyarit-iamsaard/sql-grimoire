PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

DELETE FROM payments
WHERE NOT EXISTS (
    SELECT 1
    FROM bookings
    WHERE bookings.id = payments.booking_id
);

CREATE TABLE guarded_payments (
    id INTEGER PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    paid_at TEXT NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings (id)
);

INSERT INTO guarded_payments (id, booking_id, amount, paid_at)
SELECT
    id,
    booking_id,
    amount,
    paid_at
FROM payments;

DROP TABLE payments;

ALTER TABLE guarded_payments RENAME TO payments;

COMMIT;
