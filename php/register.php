<?php
require_once 'db.php';

$errors = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';
    $password2 = $_POST['password2'] ?? '';

    // Валидация
    if ($name === '' || mb_strlen($name) < 2) {
        $errors[] = 'Введите корректное имя.';
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Введите корректный e-mail.';
    }
    if (preg_replace('/\D/', '', $phone) < 10) {
        $errors[] = 'Введите корректный телефон.';
    }
    if (strlen($password) < 6) {
        $errors[] = 'Пароль должен быть не менее 6 символов.';
    }
    if ($password !== $password2) {
        $errors[] = 'Пароли не совпадают.';
    }

    // Проверка уникальности e-mail
    if (!$errors) {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $errors[] = 'Пользователь с таким e-mail уже зарегистрирован.';
        }
    }

    // === Проверка Google reCAPTCHA ===
    $recaptcha_secret = '6LdkrnErAAAAACdFaUibxPKArmnHjG2oUrCLIPPK'; // <-- Ваш реальный secret key
    if (isset($_POST['g-recaptcha-response'])) {
        $recaptcha = $_POST['g-recaptcha-response'];
        $response = file_get_contents(
            "https://www.google.com/recaptcha/api/siteverify?secret=" . $recaptcha_secret . "&response=" . $recaptcha . "&remoteip=" . $_SERVER['REMOTE_ADDR']
        );
        $responseKeys = json_decode($response, true);
        if (!$responseKeys["success"]) {
            echo '<div style="color:#b00;padding:1.5rem;">Ошибка: Подтвердите, что вы не робот (reCAPTCHA не пройдена).</div>';
            exit;
        }
    } else {
        echo '<div style="color:#b00;padding:1.5rem;">Ошибка: reCAPTCHA не отправлена.</div>';
        exit;
    }

    // Регистрация
    if (!$errors) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)');
        if ($stmt->execute([$name, $email, $phone, $hash])) {
            header('Location: ../login.html?reg=success');
            exit;
        } else {
            $errors[] = 'Ошибка регистрации. Попробуйте позже.';
        }
    }
}
// Для AJAX-обработки можно возвращать JSON с ошибками
if (!empty($errors)) {
    echo '<ul class="form-errors">';
    foreach ($errors as $e) echo '<li>' . htmlspecialchars($e) . '</li>';
    echo '</ul>';
} 