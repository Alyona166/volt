<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

// Разрешённые таблицы
$allowed_tables = ['users', 'services', 'orders'];

// Получение action и table
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    $action = $_GET['action'] ?? 'list';
    $table = $_GET['table'] ?? '';
} else {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    $table = $input['table'] ?? '';
    $data = $input['data'] ?? [];
}

if (!in_array($table, $allowed_tables)) {
    echo json_encode(['error' => 'unknown_table', 'details' => "Неизвестная таблица: '$table'. Доступные: users, services, orders"]);
    exit;
}

try {
    if ($method === 'GET' && $action === 'list') {
        // Чтение
        if ($table === 'orders') {
            $stmt = $pdo->query('SELECT o.*, u.name AS user_name, s.name AS service_name FROM orders o JOIN users u ON o.user_id = u.id JOIN services s ON o.service_id = s.id ORDER BY o.id DESC');
        } else {
            $stmt = $pdo->query("SELECT * FROM `$table` ORDER BY id DESC");
        }
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['data' => $rows]);
        exit;
    }
    if ($method === 'POST') {
        if ($action === 'add') {
            if ($table === 'users') {
                $stmt = $pdo->prepare('INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)');
                $stmt->execute([
                    $data['name'] ?? '',
                    $data['email'] ?? '',
                    $data['phone'] ?? '',
                    password_hash($data['password'] ?? '', PASSWORD_DEFAULT)
                ]);
            } elseif ($table === 'services') {
                $stmt = $pdo->prepare('INSERT INTO services (name, price) VALUES (?, ?)');
                $stmt->execute([
                    $data['name'] ?? '',
                    $data['price'] ?? 0
                ]);
            } elseif ($table === 'orders') {
                $stmt = $pdo->prepare('INSERT INTO orders (user_id, service_id, device, problem_description, status) VALUES (?, ?, ?, ?, ?)');
                $stmt->execute([
                    $data['user_id'] ?? 0,
                    $data['service_id'] ?? 0,
                    $data['device'] ?? '',
                    $data['problem_description'] ?? '',
                    $data['status'] ?? 'В процессе'
                ]);
            }
            echo json_encode(['success' => true]);
            exit;
        }
        if ($action === 'edit') {
            if (!isset($data['id'])) throw new Exception('Не указан id для редактирования');
            if ($table === 'users') {
                $stmt = $pdo->prepare('UPDATE users SET name=?, email=?, phone=? WHERE id=?');
                $stmt->execute([
                    $data['name'] ?? '',
                    $data['email'] ?? '',
                    $data['phone'] ?? '',
                    $data['id']
                ]);
            } elseif ($table === 'services') {
                $stmt = $pdo->prepare('UPDATE services SET name=?, price=? WHERE id=?');
                $stmt->execute([
                    $data['name'] ?? '',
                    $data['price'] ?? 0,
                    $data['id']
                ]);
            } elseif ($table === 'orders') {
                $stmt = $pdo->prepare('UPDATE orders SET user_id=?, service_id=?, device=?, problem_description=?, status=? WHERE id=?');
                $stmt->execute([
                    $data['user_id'] ?? 0,
                    $data['service_id'] ?? 0,
                    $data['device'] ?? '',
                    $data['problem_description'] ?? '',
                    $data['status'] ?? 'В процессе',
                    $data['id']
                ]);
            }
            echo json_encode(['success' => true]);
            exit;
        }
        if ($action === 'delete') {
            if (!isset($data['id'])) throw new Exception('Не указан id для удаления');
            $stmt = $pdo->prepare("DELETE FROM `$table` WHERE id=?");
            $stmt->execute([$data['id']]);
            echo json_encode(['success' => true]);
            exit;
        }
        throw new Exception('Неизвестное действие');
    }
    throw new Exception('Неверный метод запроса');
} catch (Exception $e) {
    echo json_encode(['error' => 'db_error', 'message' => $e->getMessage()]);
    exit;
} 