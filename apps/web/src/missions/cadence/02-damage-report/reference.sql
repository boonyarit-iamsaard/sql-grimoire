WITH collision_slots AS (
    SELECT
        room_id,
        booking_date,
        slot_hour
    FROM bookings
    GROUP BY
        room_id,
        booking_date,
        slot_hour
    HAVING COUNT(*) > 1
)

SELECT
    c.name AS customer_name,
    COUNT(*) AS affected_bookings,
    SUM(p.amount) AS refund_exposure
FROM collision_slots AS cs
INNER JOIN bookings AS b
    ON
        cs.room_id = b.room_id
        AND cs.booking_date = b.booking_date
        AND cs.slot_hour = b.slot_hour
INNER JOIN customers AS c
    ON b.customer_id = c.id
INNER JOIN payments AS p
    ON b.id = p.booking_id
GROUP BY
    c.id,
    c.name;
