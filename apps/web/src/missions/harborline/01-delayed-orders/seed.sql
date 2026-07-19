INSERT INTO customers (id, name, city) VALUES
(1, 'Mara Voss', 'Emberfall'),
(2, 'Tobin Reed', 'Duskharbor'),
(3, 'Ilsa Thorn', 'Emberfall'),
(4, 'Corvin Ash', 'Windmere'),
(5, 'Petra Hale', 'Duskharbor'),
(6, 'Aldric Stone', 'Windmere'),
(7, 'Nyra Solace', 'Emberfall'),
(8, 'Bram Oakes', 'Thornfield');

INSERT INTO orders (id, customer_id, status, created_at) VALUES
(101, 1, 'confirmed', '2026-06-28'),
(102, 2, 'confirmed', '2026-06-29'),
(103, 3, 'confirmed', '2026-06-30'),
(104, 4, 'pending', '2026-07-01'),
(105, 5, 'confirmed', '2026-07-01'),
(106, 6, 'confirmed', '2026-07-02'),
(107, 7, 'confirmed', '2026-07-03'),
(108, 1, 'confirmed', '2026-07-04'),
(109, 8, 'cancelled', '2026-07-05'),
(110, 2, 'confirmed', '2026-07-05');

INSERT INTO shipments (id, order_id, status, shipped_at) VALUES
(201, 101, 'delivered', '2026-06-30'),
(202, 102, 'delayed', '2026-07-01'),
(203, 103, 'delivered', '2026-07-02'),
(204, 105, 'delayed', '2026-07-03'),
(205, 106, 'in_transit', '2026-07-04'),
(206, 107, 'delayed', NULL),
(207, 108, 'in_transit', '2026-07-06'),
(208, 110, 'delayed', '2026-07-07');
