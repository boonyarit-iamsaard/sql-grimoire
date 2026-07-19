SELECT
    o.id AS order_id,
    c.name AS customer_name,
    s.status AS shipment_status
FROM orders AS o
INNER JOIN customers AS c
    ON o.customer_id = c.id
INNER JOIN shipments AS s
    ON o.id = s.order_id
WHERE s.status = 'delayed';
