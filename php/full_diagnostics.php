<?php
// Расширенная диагностика для VOLT: подключение, чтение, добавление, вывод заявок
header('Content-Type: text/html; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

function resultRow($desc, $ok, $msg = '', $details = '') {
    $color = $ok ? '#27ae60' : '#e74c3c';
    $icon = $ok ? '✔️' : '❌';
    $detailsHtml = $details ? "<div style='font-size:0.95em;color:#aaa;margin-top:4px;'>$details</div>" : '';
    return "<tr><td>$desc</td><td style='color:$color;font-weight:bold;'>$icon " . ($ok ? 'OK' : 'Ошибка') . "</td><td style='color:$color;'>$msg $detailsHtml</td></tr>";
}

$results = [];
$testUserId = null;
$testServiceId = null;
$testOrderId = null;

// 1. Подключение к БД
try {
    require_once 'db.php';
    $results[] = resultRow('Подключение к БД', true);
} catch (Exception $e) {
    $results[] = resultRow('Подключение к БД', false, $e->getMessage());
    echo '<table>' . implode('', $results) . '</table>';
    exit;
}

// 2. Чтение пользователей
try {
    $users = $pdo->query('SELECT * FROM users')->fetchAll(PDO::FETCH_ASSOC);
    $count = count($users);
    $testUserId = $count ? $users[0]['id'] : null;
    $userList = $count ? implode(', ', array_map(fn($u) => $u['id'].':'.$u['name'], $users)) : '';
    $results[] = resultRow('Чтение пользователей (users)', true, "Найдено: $count", $userList);
} catch (Exception $e) {
    $results[] = resultRow('Чтение пользователей (users)', false, $e->getMessage());
}

// 3. Чтение услуг
try {
    $services = $pdo->query('SELECT * FROM services')->fetchAll(PDO::FETCH_ASSOC);
    $count = count($services);
    $testServiceId = $count ? $services[0]['id'] : null;
    $serviceList = $count ? implode(', ', array_map(fn($s) => $s['id'].':'.$s['name'], $services)) : '';
    $results[] = resultRow('Чтение услуг (services)', true, "Найдено: $count", $serviceList);
} catch (Exception $e) {
    $results[] = resultRow('Чтение услуг (services)', false, $e->getMessage());
}

// 4. Чтение заказов
try {
    $orders = $pdo->query('SELECT * FROM orders')->fetchAll(PDO::FETCH_ASSOC);
    $count = count($orders);
    $orderList = $count ? implode(', ', array_map(fn($o) => $o['id'].':'.$o['device'], $orders)) : '';
    $results[] = resultRow('Чтение заказов (orders)', true, "Найдено: $count", $orderList);
} catch (Exception $e) {
    $results[] = resultRow('Чтение заказов (orders)', false, $e->getMessage());
}

// 5. Чтение отзывов
try {
    $feedbacks = $pdo->query('SELECT * FROM feedback')->fetchAll(PDO::FETCH_ASSOC);
    $count = count($feedbacks);
    $results[] = resultRow('Чтение отзывов (feedback)', true, "Найдено: $count");
} catch (Exception $e) {
    $results[] = resultRow('Чтение отзывов (feedback)', false, $e->getMessage());
}

// 6. Попытка добавить тестовую заявку
$testOrderOk = false;
$testOrderMsg = '';
if ($testUserId && $testServiceId) {
    try {
        $stmt = $pdo->prepare('INSERT INTO orders (user_id, service_id, device, problem_description, status) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$testUserId, $testServiceId, 'Диагностическое устройство', 'Диагностическая заявка', 'Новый']);
        $testOrderOk = true;
        $testOrderMsg = 'Добавлена тестовая заявка';
        $testOrderId = $pdo->lastInsertId();
    } catch (Exception $e) {
        $testOrderMsg = $e->getMessage();
    }
    $results[] = resultRow('Добавление тестовой заявки', $testOrderOk, $testOrderMsg);
} else {
    $results[] = resultRow('Добавление тестовой заявки', false, 'Нет пользователей или услуг для теста');
}

// 7. Получение заявок для тестового пользователя
try {
    if ($testUserId) {
        $stmt = $pdo->prepare('SELECT o.id, s.name AS service, o.device, o.status FROM orders o JOIN services s ON o.service_id = s.id WHERE o.user_id = ? ORDER BY o.id DESC');
        $stmt->execute([$testUserId]);
        $userOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $count = count($userOrders);
        $ordersList = $count ? implode(', ', array_map(fn($o) => $o['id'].':'.$o['device'], $userOrders)) : '';
        $results[] = resultRow('Получение заявок пользователя (cabinet.php)', true, "Найдено: $count", $ordersList);
    } else {
        $results[] = resultRow('Получение заявок пользователя (cabinet.php)', false, 'Нет пользователей для теста');
    }
} catch (Exception $e) {
    $results[] = resultRow('Получение заявок пользователя (cabinet.php)', false, $e->getMessage());
}

// 8. Проверка структуры orders
try {
    $stmt = $pdo->query('DESCRIBE orders');
    $fields = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $results[] = resultRow('Поля таблицы orders', true, implode(', ', $fields));
} catch (Exception $e) {
    $results[] = resultRow('Поля таблицы orders', false, $e->getMessage());
}

?><!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Полная диагностика БД VOLT</title>
    <style>
        body { font-family: Arial, sans-serif; background: #222; color: #eee; }
        h1 { color: #27ae60; }
        table { border-collapse: collapse; width: 100%; max-width: 900px; margin: 2rem auto; background: #333; }
        th, td { padding: 12px 16px; border: 1px solid #444; }
        th { background: #222; color: #fff; }
        tr:nth-child(even) { background: #2c2c2c; }
        .hint { color: #aaa; text-align: center; margin-top: 2rem; }
    </style>
</head>
<body>
    <h1>Полная диагностика подключения и работы с БД VOLT</h1>
    <table>
        <tr><th>Проверка</th><th>Статус</th><th>Комментарий</th></tr>
        <?= implode('', $results) ?>
    </table>
    <div class="hint">
        <p>Если есть ошибки — скопируйте их и отправьте разработчику.<br>Тестовая заявка добавляется автоматически, удалите её вручную при необходимости.</p>
        <p>Если "Получение заявок пользователя" выдаёт ошибку — проблема в SQL-запросе или структуре orders.<br>Если "Добавление тестовой заявки" — проблема с внешними ключами или структурой.</p>
    </div>
</body>
</html> 