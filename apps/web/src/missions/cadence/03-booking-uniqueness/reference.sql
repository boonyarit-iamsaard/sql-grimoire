CREATE UNIQUE INDEX bookings_room_date_hour_unique
ON bookings (room_id, booking_date, slot_hour);
