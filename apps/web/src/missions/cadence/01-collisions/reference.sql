SELECT
    r.name AS room_name,
    b.booking_date,
    b.slot_hour,
    COUNT(*) AS booking_count
FROM bookings AS b
INNER JOIN rooms AS r
    ON b.room_id = r.id
GROUP BY
    r.id,
    r.name,
    b.booking_date,
    b.slot_hour
HAVING COUNT(*) > 1;
