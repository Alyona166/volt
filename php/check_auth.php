<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'logged_in' => true,
        'user_id' => $_SESSION['user_id'],
        'user_name' => $_SESSION['user_name'] ?? 'Пользователь',
        'user_role' => $_SESSION['user_role'] ?? 'user'
    ]);
} else {
    echo json_encode(['logged_in' => false]);
}
?> 