<?php
session_start();
require_once 'db.php';
header('Content-Type: text/html; charset=utf-8');

function resultRow($label, $ok, $msg, $extra = '') {
    $color = $ok ? '#27ae60' : '#e74c3c';
    return "<tr><td>$label</td><td style='color:$color;font-weight:bold;'>".($ok?'✔':'✖')."</td><td>$msg".($extra?'<br><small style=\'color:#aaa\'>'.$extra.'</small>':'')."</td></tr>";
}

$results = [];

// 1. Проверка структуры таблиц
$tables = ['users','services','orders'];
foreach ($tables as $tbl) {
    try {
        $stmt = $pdo->query("DESCRIBE $tbl");
        $fields = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $results[] = resultRow("Поля таблицы $tbl", true, implode(', ', $fields));
    } catch (Exception $e) {
        $results[] = resultRow("Поля таблицы $tbl", false, $e->getMessage());
    }
}

// 2. CRUD для каждой таблицы
foreach ($tables as $tbl) {
    // Чтение
    try {
        $stmt = $pdo->query("SELECT * FROM $tbl LIMIT 2");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $results[] = resultRow("Чтение ($tbl)", true, 'ОК', json_encode($data, JSON_UNESCAPED_UNICODE));
    } catch (Exception $e) {
        $results[] = resultRow("Чтение ($tbl)", false, $e->getMessage());
    }
    // Добавление
    $insertOk = false; $insertId = null; $insertMsg = '';
    try {
        if ($tbl=='users') {
            $stmt = $pdo->prepare('INSERT INTO users (name,email,phone,password) VALUES (?,?,?,?)');
            $stmt->execute(['Тестовый','test_diag@volt.ru','+70000000000',password_hash('test',PASSWORD_DEFAULT)]);
            $insertId = $pdo->lastInsertId(); $insertOk = true; $insertMsg = 'id='.$insertId;
        } elseif ($tbl=='services') {
            $stmt = $pdo->prepare('INSERT INTO services (name,price) VALUES (?,?)');
            $stmt->execute(['Тестовая услуга',1234]);
            $insertId = $pdo->lastInsertId(); $insertOk = true; $insertMsg = 'id='.$insertId;
        } elseif ($tbl=='orders') {
            $userId = $pdo->query('SELECT id FROM users ORDER BY id DESC LIMIT 1')->fetchColumn();
            $serviceId = $pdo->query('SELECT id FROM services ORDER BY id DESC LIMIT 1')->fetchColumn();
            $stmt = $pdo->prepare('INSERT INTO orders (user_id,service_id,device,problem_description,status) VALUES (?,?,?,?,?)');
            $stmt->execute([$userId,$serviceId,'Тест-устройство','Диагностическая заявка','Новый']);
            $insertId = $pdo->lastInsertId(); $insertOk = true; $insertMsg = 'id='.$insertId;
        }
        $results[] = resultRow("Добавление ($tbl)", $insertOk, $insertMsg);
    } catch (Exception $e) {
        $results[] = resultRow("Добавление ($tbl)", false, $e->getMessage());
    }
    // Изменение
    try {
        if ($insertOk && $insertId) {
            if ($tbl=='users') {
                $stmt = $pdo->prepare('UPDATE users SET name=? WHERE id=?');
                $stmt->execute(['Тест-изменён',$insertId]);
            } elseif ($tbl=='services') {
                $stmt = $pdo->prepare('UPDATE services SET name=? WHERE id=?');
                $stmt->execute(['Услуга-изменена',$insertId]);
            } elseif ($tbl=='orders') {
                $stmt = $pdo->prepare('UPDATE orders SET device=? WHERE id=?');
                $stmt->execute(['Устройство-изменено',$insertId]);
            }
            $results[] = resultRow("Изменение ($tbl)", true, 'ОК');
        } else {
            $results[] = resultRow("Изменение ($tbl)", false, 'Нет id для изменения');
        }
    } catch (Exception $e) {
        $results[] = resultRow("Изменение ($tbl)", false, $e->getMessage());
    }
    // Удаление
    try {
        if ($insertOk && $insertId) {
            $stmt = $pdo->prepare("DELETE FROM $tbl WHERE id=?");
            $stmt->execute([$insertId]);
            $results[] = resultRow("Удаление ($tbl)", true, 'ОК');
        } else {
            $results[] = resultRow("Удаление ($tbl)", false, 'Нет id для удаления');
        }
    } catch (Exception $e) {
        $results[] = resultRow("Удаление ($tbl)", false, $e->getMessage());
    }
}

?><!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Диагностика БД VOLT</title>
    <style>
        body { font-family: Arial, sans-serif; background: #232b2f; color: #eee; }
        h1 { color: #27ae60; }
        table { border-collapse: collapse; width: 100%; max-width: 900px; margin: 2rem auto; background: #333; }
        th, td { padding: 12px 16px; border: 1px solid #444; }
        th { background: #222; color: #fff; }
        tr:nth-child(even) { background: #2c2c2c; }
        .hint { color: #aaa; text-align: center; margin-top: 2rem; }
        .ok { color: #27ae60; }
        .fail { color: #e74c3c; }
    </style>
</head>
<body>
    <h1>Диагностика CRUD и структуры БД VOLT</h1>
    <table>
        <tr><th>Проверка</th><th>Статус</th><th>Комментарий</th></tr>
        <?= implode('', $results) ?>
    </table>
    <div class="hint">
        <p>Если есть ошибки — скопируйте их и отправьте разработчику.<br>Тестовые записи добавляются и удаляются автоматически.</p>
        <p>Проверяются: структура таблиц, чтение, добавление, изменение, удаление для users, services, orders.</p>
    </div>
</body>
</html> 