<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'not_authorized']);
    exit;
}

require_once 'db.php';
$user_id = $_SESSION['user_id'];

// Получаем данные
$data = json_decode(file_get_contents('php://input'), true);
$service_id = isset($data['service_id']) ? (int)$data['service_id'] : 0;
$device = trim($data['device'] ?? '');
$comment = trim($data['comment'] ?? '');

if (!$service_id || !$device) {
    echo json_encode(['error' => 'validation', 'message' => 'Заполните все обязательные поля']);
    exit;
}

try {
    $stmt = $pdo->prepare('INSERT INTO orders (user_id, service_id, device, problem_description, status) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$user_id, $service_id, $device, $comment, 'В процессе']);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['error' => 'db_error', 'message' => $e->getMessage()]);
} 