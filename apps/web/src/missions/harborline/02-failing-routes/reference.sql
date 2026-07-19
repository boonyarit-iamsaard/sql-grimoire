SELECT
    c.city,
    COUNT(*) AS delayed_orders
FROM shipments AS s
INNER JOIN orders AS o
    ON s.order_id = o.id
INNER JOIN customers AS c
    ON o.customer_id = c.id
WHERE s.status = 'delayed'
GROUP BY c.city
HAVING COUNT(*) >= 2;
