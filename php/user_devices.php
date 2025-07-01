<?php
session_start();
header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['devices' => []]);
    exit;
}
require_once 'db.php';
// Можно фильтровать по пользователю, если есть связь, либо выводить все устройства
$stmt = $pdo->query('SELECT id, name, type, manufacturer, model FROM devices');
$devices = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(['devices' => $devices]); 