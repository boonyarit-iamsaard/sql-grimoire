SELECT
    o.id AS order_id,
    c.name AS customer_name,
    c.city
FROM orders AS o
INNER JOIN customers AS c
    ON o.customer_id = c.id
LEFT JOIN shipments AS s
    ON o.id = s.order_id
WHERE o.status = 'confirmed' AND s.id IS NULL;
