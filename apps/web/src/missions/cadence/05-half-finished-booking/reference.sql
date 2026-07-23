BEGIN TRANSACTION;

INSERT INTO bookings (
    id,
    room_id,
    booking_date,
    slot_hour,
    customer_id
)
VALUES (118, 3, '2026-07-24', 12, 5);

INSERT INTO payments (
    id,
    booking_id,
    amount,
    paid_at
)
VALUES (2018, 118, 45, '2026-07-23 10:05:00');

ROLLBACK;

BEGIN TRANSACTION;

DELETE FROM bookings
WHERE id = 117;

INSERT INTO bookings (
    id,
    room_id,
    booking_date,
    slot_hour,
    customer_id
)
VALUES (117, 2, '2026-07-23', 16, 7);

INSERT INTO payments (
    id,
    booking_id,
    amount,
    paid_at
)
VALUES (2017, 117, 60, '2026-07-22 11:26:00');

COMMIT;
