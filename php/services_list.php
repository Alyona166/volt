<?php
require_once 'db.php';
header('Content-Type: application/json');
try {
    $stmt = $pdo->query('SELECT id, name FROM services ORDER BY name');
    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['services' => $services]);
} catch (Exception $e) {
    echo json_encode(['services' => []]);
} 