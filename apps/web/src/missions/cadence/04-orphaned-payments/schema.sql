CREATE TABLE rooms (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE bookings (
    id INTEGER PRIMARY KEY,
    room_id INTEGER NOT NULL,
    booking_date TEXT NOT NULL,
    slot_hour INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    FOREIGN KEY (room_id) REFERENCES rooms (id),
    FOREIGN KEY (customer_id) REFERENCES customers (id)
);

CREATE UNIQUE INDEX bookings_room_date_hour_unique
ON bookings (room_id, booking_date, slot_hour);

CREATE TABLE payments (
    id INTEGER PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    paid_at TEXT NOT NULL
);
