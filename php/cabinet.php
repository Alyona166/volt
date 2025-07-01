<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'not_authorized']);
    exit;
}

require_once 'db.php';
$user_id = $_SESSION['user_id'];

try {
    // Получаем заявки пользователя с деталями услуги и устройства
    $stmt = $pdo->prepare('
        SELECT o.id, s.name AS service, o.device, o.status
        FROM orders o
        JOIN services s ON o.service_id = s.id
        WHERE o.user_id = ?
        ORDER BY o.id DESC
    ');
    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['orders' => $orders]);
} catch (Exception $e) {
    echo json_encode(['error' => 'db_error', 'message' => $e->getMessage()]);
} 