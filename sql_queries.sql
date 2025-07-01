-- SQL запросы для сервисного центра VOLT
-- Выполните эти запросы в phpMyAdmin или MySQL консоли

-- 1. Получить список всех устройств, находящихся в ремонте с данными заказчика
SELECT 
    d.name AS device_name,
    d.type AS device_type,
    d.manufacturer,
    d.model,
    u.name AS customer_name,
    u.phone AS customer_phone,
    u.email AS customer_email,
    o.status,
    o.created_at AS order_date,
    s.name AS service_name,
    o.total_cost
FROM orders o
JOIN devices d ON o.device_id = d.id
JOIN users u ON o.user_id = u.id
JOIN services s ON o.service_id = s.id
WHERE o.status IN ('Новый', 'В процессе')
ORDER BY o.created_at DESC;

-- 2. Получить список всех ремонтных заказов, выполненных определенным техником
SELECT 
    o.id AS order_id,
    d.name AS device_name,
    d.manufacturer,
    d.model,
    u.name AS customer_name,
    u.phone AS customer_phone,
    s.name AS service_name,
    o.problem_description,
    o.status,
    o.created_at AS order_date,
    o.completed_at,
    o.total_cost
FROM orders o
JOIN devices d ON o.device_id = d.id
JOIN users u ON o.user_id = u.id
JOIN services s ON o.service_id = s.id
JOIN users tech ON o.technician_id = tech.id
WHERE tech.name = 'Техник Алексей' 
  AND o.status = 'Завершено'
ORDER BY o.completed_at DESC;

-- 3. Получить список всех устройств, у которых гарантия истекла
SELECT 
    d.name AS device_name,
    d.type AS device_type,
    d.manufacturer,
    d.model,
    d.serial_number,
    d.warranty_expiry,
    DATEDIFF(CURDATE(), d.warranty_expiry) AS days_expired
FROM devices d
WHERE d.warranty_expiry < CURDATE()
ORDER BY d.warranty_expiry ASC;

-- 4. Получить список всех клиентов, у которых есть активные ремонтные заказы
SELECT DISTINCT
    u.id AS user_id,
    u.name AS customer_name,
    u.email AS customer_email,
    u.phone AS customer_phone,
    COUNT(o.id) AS active_orders_count,
    SUM(o.total_cost) AS total_cost
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.status IN ('Новый', 'В процессе')
  AND u.role = 'user'
GROUP BY u.id, u.name, u.email, u.phone
ORDER BY active_orders_count DESC;

-- 5. Получить список всех устройств, которые были ремонтированы определенным техником
SELECT 
    d.name AS device_name,
    d.type AS device_type,
    d.manufacturer,
    d.model,
    s.name AS service_name,
    o.problem_description,
    o.component_issue,
    o.created_at AS order_date,
    o.completed_at,
    o.total_cost,
    tech.name AS technician_name
FROM orders o
JOIN devices d ON o.device_id = d.id
JOIN services s ON o.service_id = s.id
JOIN users tech ON o.technician_id = tech.id
WHERE tech.name = 'Техник Дмитрий'
  AND o.status = 'Завершено'
ORDER BY o.completed_at DESC;

-- 6. Получить список всех ремонтных заказов, у которых дата завершения ремонта
-- попадает в заданный временной интервал
SELECT 
    o.id AS order_id,
    d.name AS device_name,
    d.manufacturer,
    d.model,
    u.name AS customer_name,
    s.name AS service_name,
    o.problem_description,
    o.completed_at,
    o.total_cost,
    tech.name AS technician_name
FROM orders o
JOIN devices d ON o.device_id = d.id
JOIN users u ON o.user_id = u.id
JOIN services s ON o.service_id = s.id
JOIN users tech ON o.technician_id = tech.id
WHERE o.completed_at BETWEEN '2024-01-01 00:00:00' AND '2024-01-31 23:59:59'
  AND o.status = 'Завершено'
ORDER BY o.completed_at DESC;

-- 7. Получить список всех устройств, у которых неисправность связана с
-- определенным компонентом
SELECT 
    d.name AS device_name,
    d.type AS device_type,
    d.manufacturer,
    d.model,
    o.component_issue,
    o.problem_description,
    o.status,
    o.created_at AS order_date,
    s.name AS service_name,
    o.total_cost,
    u.name AS customer_name
FROM orders o
JOIN devices d ON o.device_id = d.id
JOIN services s ON o.service_id = s.id
JOIN users u ON o.user_id = u.id
WHERE o.component_issue = 'экран'
ORDER BY o.created_at DESC;

-- 8. Получить список всех устройств, сгруппированных по типу и указанием
-- общего количества устройств каждого типа
SELECT 
    d.type AS device_type,
    COUNT(*) AS total_devices,
    COUNT(CASE WHEN o.status IN ('Новый', 'В процессе') THEN 1 END) AS devices_in_repair,
    COUNT(CASE WHEN o.status = 'Завершено' THEN 1 END) AS repaired_devices,
    COUNT(CASE WHEN d.warranty_expiry < CURDATE() THEN 1 END) AS devices_with_expired_warranty
FROM devices d
LEFT JOIN orders o ON d.id = o.device_id
GROUP BY d.type
ORDER BY total_devices DESC;

-- 9. Получить список всех ремонтных заказов, сгруппированных по статусу и
-- указанием количества заказов для каждого статуса
SELECT 
    o.status,
    COUNT(*) AS orders_count,
    SUM(o.total_cost) AS total_revenue,
    AVG(o.total_cost) AS average_order_cost,
    MIN(o.created_at) AS earliest_order,
    MAX(o.created_at) AS latest_order
FROM orders o
GROUP BY o.status
ORDER BY orders_count DESC;

-- 10. Получить список всех ремонтных заказов, у которых неисправность связана с
-- определенным производителем устройства
SELECT 
    o.id AS order_id,
    d.name AS device_name,
    d.type AS device_type,
    d.manufacturer,
    d.model,
    o.component_issue,
    o.problem_description,
    o.status,
    o.created_at AS order_date,
    o.completed_at,
    o.total_cost,
    s.name AS service_name,
    u.name AS customer_name,
    tech.name AS technician_name
FROM orders o
JOIN devices d ON o.device_id = d.id
JOIN services s ON o.service_id = s.id
JOIN users u ON o.user_id = u.id
LEFT JOIN users tech ON o.technician_id = tech.id
WHERE d.manufacturer = 'Apple'
ORDER BY o.created_at DESC;

-- Дополнительные полезные запросы:

-- Статистика по техникам
SELECT 
    tech.name AS technician_name,
    COUNT(o.id) AS total_orders,
    COUNT(CASE WHEN o.status = 'Завершено' THEN 1 END) AS completed_orders,
    COUNT(CASE WHEN o.status IN ('Новый', 'В процессе') THEN 1 END) AS active_orders,
    SUM(o.total_cost) AS total_revenue,
    AVG(o.total_cost) AS average_order_cost
FROM users tech
LEFT JOIN orders o ON tech.id = o.technician_id
WHERE tech.role = 'technician'
GROUP BY tech.id, tech.name
ORDER BY total_orders DESC;

-- Топ самых популярных услуг
SELECT 
    s.name AS service_name,
    COUNT(o.id) AS orders_count,
    SUM(o.total_cost) AS total_revenue,
    AVG(o.total_cost) AS average_price
FROM services s
LEFT JOIN orders o ON s.id = o.service_id
GROUP BY s.id, s.name
ORDER BY orders_count DESC;

-- Устройства с истекающей гарантией (в течение 30 дней)
SELECT 
    d.name AS device_name,
    d.type AS device_type,
    d.manufacturer,
    d.model,
    d.warranty_expiry,
    DATEDIFF(d.warranty_expiry, CURDATE()) AS days_until_expiry
FROM devices d
WHERE d.warranty_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY d.warranty_expiry ASC; 