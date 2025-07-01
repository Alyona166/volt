-- SQL-дамп для БД volt_service
-- Структура таблиц для работы с текстовым полем устройства

-- Таблица пользователей (клиентов и техников)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(80) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('user','admin','technician') DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица услуг
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица заказов на ремонт (device - текстовое поле)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    device VARCHAR(100) NOT NULL,
    problem_description TEXT,
    status ENUM('Новый','В процессе','Завершено','Отменено') DEFAULT 'Новый',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME,
    total_cost DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица отзывов
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(80) NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Тестовые данные

-- Пользователи (клиенты, админ, техники)
INSERT INTO users (name, email, phone, password, role) VALUES
('Иван Иванов', 'ivan@mail.ru', '+79090000001', '$2y$10$demoHash1', 'user'),
('Петр Петров', 'petr@mail.ru', '+79090000002', '$2y$10$demoHash2', 'user'),
('Анна Сидорова', 'anna@mail.ru', '+79090000003', '$2y$10$demoHash3', 'user'),
('Мария Козлова', 'maria@mail.ru', '+79090000004', '$2y$10$demoHash4', 'user'),
('Админ', 'admin@volt.ru', '+79090000005', '$2y$10$adminHash', 'admin'),
('Техник Алексей', 'alex@volt.ru', '+79090000006', '$2y$10$techHash1', 'technician'),
('Техник Дмитрий', 'dmitry@volt.ru', '+79090000007', '$2y$10$techHash2', 'technician');

-- Услуги
INSERT INTO services (name, price, description) VALUES
('Замена экрана iPhone', 8000, 'Замена разбитого экрана на iPhone'),
('Ремонт материнской платы', 5000, 'Ремонт или замена материнской платы'),
('Замена стиральной машинки', 4000, 'Замена подшипников стиральной машины'),
('Замена батареи', 3000, 'Замена аккумулятора устройства'),
('Ремонт зарядного устройства', 2000, 'Ремонт блока питания'),
('Замена динамика', 1500, 'Замена динамика в устройстве'),
('Чистка от пыли', 1000, 'Профилактическая чистка устройства'),
('Замена клавиатуры', 2500, 'Замена клавиатуры ноутбука');

-- Заказы на ремонт
INSERT INTO orders (user_id, service_id, device, problem_description, status, created_at, started_at, completed_at, total_cost) VALUES
(1, 1, 'iPhone 12', 'Разбит экран', 'В процессе', '2024-01-15 10:00:00', '2024-01-15 14:00:00', NULL, 8000),
(2, 2, 'Ноутбук HP Pavilion', 'Не включается', 'Завершено', '2024-01-10 09:00:00', '2024-01-10 11:00:00', '2024-01-12 16:00:00', 5000),
(3, 3, 'Стиральная машина LG', 'Сильный шум при работе', 'В процессе', '2024-01-20 13:00:00', '2024-01-20 15:00:00', NULL, 4000),
(4, 4, 'iPhone 13', 'Быстро разряжается', 'Завершено', '2024-01-05 08:00:00', '2024-01-05 10:00:00', '2024-01-06 14:00:00', 3000),
(1, 5, 'iPad Pro', 'Не заряжается', 'Новый', '2024-01-25 11:00:00', NULL, NULL, 2000),
(2, 6, 'Ноутбук Lenovo ThinkPad', 'Не работает звук', 'Завершено', '2024-01-08 12:00:00', '2024-01-08 14:00:00', '2024-01-09 10:00:00', 1500),
(3, 7, 'MacBook Air', 'Перегревается', 'В процессе', '2024-01-22 16:00:00', '2024-01-22 18:00:00', NULL, 1000),
(4, 1, 'Samsung Galaxy S21', 'Трещина на экране', 'Завершено', '2024-01-12 10:00:00', '2024-01-12 12:00:00', '2024-01-14 15:00:00', 7500),
(1, 8, 'Dell Inspiron', 'Клавиши залипают', 'Новый', '2024-01-28 09:00:00', NULL, NULL, 2500),
(2, 3, 'Стиральная машина Samsung', 'Не отжимает', 'В процессе', '2024-01-18 14:00:00', '2024-01-18 16:00:00', NULL, 4500);

-- Отзывы
INSERT INTO feedback (name, email, message) VALUES
('Петр', 'petr@mail.ru', 'Спасибо за быстрый ремонт!'),
('Анна', 'anna@mail.ru', 'Когда будет готов мой ноутбук?'),
('Иван', 'ivan@mail.ru', 'Отличная работа, рекомендую!'),
('Мария', 'maria@mail.ru', 'Цены приемлемые, качество хорошее'); 