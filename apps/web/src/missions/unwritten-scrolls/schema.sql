CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers (id)
);

CREATE TABLE shipments (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    shipped_at TEXT,
    FOREIGN KEY (order_id) REFERENCES orders (id)
);
