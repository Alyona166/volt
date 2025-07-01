<?php
session_start();

// Проверяем, авторизован ли админ
function isAdminLoggedIn() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

// Обработка входа
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $password = $_POST['password'] ?? '';
    
    if ($password === '123123') {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['role'] = 'admin';
        $_SESSION['user_id'] = 1; // Можно заменить на реальный ID, если есть
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Неверный пароль']);
    }
    exit;
}

// Обработка выхода
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'logout') {
    unset($_SESSION['admin_logged_in']);
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

// Проверка авторизации для API запросов
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'check_auth') {
    echo json_encode(['logged_in' => isAdminLoggedIn()]);
    exit;
}
?> 