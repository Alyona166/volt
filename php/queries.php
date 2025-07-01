<?php
session_start();
require_once 'db.php';

// Проверка авторизации админа
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header('Location: login.php');
    exit();
}

$queries = [
    1 => [
        'title' => 'Устройства в ремонте с данными заказчика',
        'sql' => "SELECT 
            o.device AS device_name,
            u.name AS customer_name,
            u.phone AS customer_phone,
            u.email AS customer_email,
            o.status,
            o.created_at AS order_date,
            s.name AS service_name,
            o.total_cost
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN services s ON o.service_id = s.id
        WHERE o.status IN ('Новый', 'В процессе')
        ORDER BY o.created_at DESC"
    ],
    2 => [
        'title' => 'Все завершённые заказы',
        'sql' => "SELECT 
            o.id AS order_id,
            o.device AS device_name,
            u.name AS customer_name,
            u.phone AS customer_phone,
            s.name AS service_name,
            o.problem_description,
            o.status,
            o.created_at AS order_date,
            o.completed_at,
            o.total_cost
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN services s ON o.service_id = s.id
        WHERE o.status = 'Завершено'
        ORDER BY o.completed_at DESC"
    ],
    3 => [
        'title' => 'Устройства с истекшей гарантией (нет данных)',
        'sql' => "SELECT 'Нет данных о гарантии в текущей структуре' AS info"
    ],
    4 => [
        'title' => 'Клиенты с активными заказами',
        'sql' => "SELECT 
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
        ORDER BY active_orders_count DESC"
    ],
    5 => [
        'title' => 'Все завершённые ремонты (без фильтра по технику)',
        'sql' => "SELECT 
            o.device AS device_name,
            s.name AS service_name,
            o.problem_description,
            o.created_at AS order_date,
            o.completed_at,
            o.total_cost
        FROM orders o
        JOIN services s ON o.service_id = s.id
        WHERE o.status = 'Завершено'
        ORDER BY o.completed_at DESC"
    ],
    6 => [
        'title' => 'Заказы, завершённые в январе 2024',
        'sql' => "SELECT 
            o.id AS order_id,
            o.device AS device_name,
            u.name AS customer_name,
            s.name AS service_name,
            o.problem_description,
            o.completed_at,
            o.total_cost
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN services s ON o.service_id = s.id
        WHERE o.completed_at BETWEEN '2024-01-01 00:00:00' AND '2024-01-31 23:59:59'
          AND o.status = 'Завершено'
        ORDER BY o.completed_at DESC"
    ],
    7 => [
        'title' => 'Устройства с неисправностью экрана',
        'sql' => "SELECT 
            o.device AS device_name,
            o.problem_description,
            o.status,
            o.created_at AS order_date,
            s.name AS service_name,
            o.total_cost,
            u.name AS customer_name
        FROM orders o
        JOIN services s ON o.service_id = s.id
        JOIN users u ON o.user_id = u.id
        WHERE o.problem_description LIKE '%экран%'
        ORDER BY o.created_at DESC"
    ],
    8 => [
        'title' => 'Статистика по устройствам (по названию)',
        'sql' => "SELECT 
            o.device AS device_name,
            COUNT(*) AS total_orders,
            COUNT(CASE WHEN o.status IN ('Новый', 'В процессе') THEN 1 END) AS in_repair,
            COUNT(CASE WHEN o.status = 'Завершено' THEN 1 END) AS repaired
        FROM orders o
        GROUP BY o.device
        ORDER BY total_orders DESC"
    ],
    9 => [
        'title' => 'Статистика заказов по статусам',
        'sql' => "SELECT 
            o.status,
            COUNT(*) AS orders_count,
            SUM(o.total_cost) AS total_revenue,
            AVG(o.total_cost) AS average_order_cost,
            MIN(o.created_at) AS earliest_order,
            MAX(o.created_at) AS latest_order
        FROM orders o
        GROUP BY o.status
        ORDER BY orders_count DESC"
    ],
    10 => [
        'title' => 'Заказы устройств Apple',
        'sql' => "SELECT 
            o.id AS order_id,
            o.device AS device_name,
            o.problem_description,
            o.status,
            o.created_at AS order_date,
            o.completed_at,
            o.total_cost,
            s.name AS service_name,
            u.name AS customer_name
        FROM orders o
        JOIN services s ON o.service_id = s.id
        JOIN users u ON o.user_id = u.id
        WHERE o.device LIKE '%Apple%'
        ORDER BY o.created_at DESC"
    ]
];

$selected_query = isset($_GET['query']) ? (int)$_GET['query'] : 1;
$result = null;
$error = null;

if (isset($_GET['execute']) && isset($queries[$selected_query])) {
    try {
        $stmt = $pdo->prepare($queries[$selected_query]['sql']);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        $error = "Ошибка выполнения запроса: " . $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SQL Запросы - VOLT</title>
    <link rel="stylesheet" href="../style.css">
    <style>
        .queries-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .query-selector {
            margin-bottom: 20px;
            padding: 15px;
            background: var(--card-bg);
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .query-selector select {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--border-color);
            border-radius: 5px;
            background: var(--bg-color);
            color: var(--text-color);
            margin-bottom: 10px;
        }
        .query-selector button {
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        .query-selector button:hover {
            background: var(--accent-hover);
        }
        .results-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: var(--card-bg);
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .results-table th,
        .results-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        .results-table th {
            background: var(--accent-color);
            color: white;
            font-weight: 600;
        }
        .results-table tr:hover {
            background: var(--hover-bg);
        }
        .error {
            color: #e74c3c;
            background: #fdf2f2;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border: 1px solid #f5c6cb;
        }
        .no-results {
            text-align: center;
            padding: 40px;
            color: var(--text-muted);
        }
        .query-title {
            color: var(--accent-color);
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: var(--accent-color);
            text-decoration: none;
            font-weight: 500;
        }
        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="queries-container">
        <a href="../admin.html" class="back-link">← Назад к админ панели</a>
        
        <h1 class="query-title">SQL Запросы для анализа данных</h1>
        
        <div class="query-selector">
            <form method="GET">
                <select name="query">
                    <?php foreach ($queries as $id => $query): ?>
                        <option value="<?= $id ?>" <?= $selected_query == $id ? 'selected' : '' ?>>
                            <?= $id ?>. <?= htmlspecialchars($query['title']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <button type="submit" name="execute">Выполнить запрос</button>
            </form>
        </div>

        <?php if ($error): ?>
            <div class="error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>

        <?php if ($result !== null): ?>
            <h2><?= htmlspecialchars($queries[$selected_query]['title']) ?></h2>
            
            <?php if (empty($result)): ?>
                <div class="no-results">По данному запросу результатов не найдено</div>
            <?php else: ?>
                <div style="overflow-x: auto;">
                    <table class="results-table">
                        <thead>
                            <tr>
                                <?php foreach (array_keys($result[0]) as $column): ?>
                                    <th><?= htmlspecialchars(ucfirst(str_replace('_', ' ', $column))) ?></th>
                                <?php endforeach; ?>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($result as $row): ?>
                                <tr>
                                    <?php foreach ($row as $value): ?>
                                        <td><?= htmlspecialchars($value ?? 'NULL') ?></td>
                                    <?php endforeach; ?>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 20px; text-align: center; color: var(--text-muted);">
                    Найдено записей: <?= count($result) ?>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>

    <script src="../script.js"></script>
</body>
</html> 