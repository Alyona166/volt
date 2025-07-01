document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark');
    }

    // Theme toggle functionality
    if (themeToggleBtn) {
        function setTheme(dark) {
            body.classList.toggle('dark-theme', dark);
            icon.textContent = dark ? '☀️' : '🌙';
            localStorage.setItem('theme', dark ? 'dark' : 'light');
        }
        function getTheme() {
            if (savedTheme) return savedTheme === 'dark';
            return prefersDark;
        }
        themeToggleBtn.addEventListener('click', () => setTheme(!body.classList.contains('dark-theme')));
        setTheme(getTheme());
    }

    // === Services Slider ===
    const servicesSlider = document.querySelector('.services-slider');
    if (servicesSlider) {
        const slides = servicesSlider.querySelectorAll('.service-slide');
        const prevBtn = servicesSlider.querySelector('.slider-prev');
        const nextBtn = servicesSlider.querySelector('.slider-next');
        const dots = servicesSlider.querySelectorAll('.slider-dot');
        let currentSlide = 0;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.style.display = i === index ? 'block' : 'none';
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });

        // Auto-slide every 5 seconds
        setInterval(nextSlide, 5000);

        // Show first slide initially
        showSlide(0);
    }

    // === FAQ Accordion ===
    const faqQuestions = document.querySelectorAll('.faq__question');
    console.log('FAQ questions found:', faqQuestions.length); // Отладка
    faqQuestions.forEach((btn, index) => {
        console.log('FAQ button', index, ':', btn.textContent); // Отладка
        btn.addEventListener('click', function() {
            console.log('FAQ button clicked:', btn.textContent); // Отладка
            // Скрыть все ответы
            faqQuestions.forEach(q => {
                if (q !== btn) q.setAttribute('aria-expanded', 'false');
            });
            // Переключить текущий
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            console.log('FAQ expanded:', !expanded); // Отладка
        });
    });

    // Cabinet Tabs
    const tabs = document.querySelectorAll('.cabinet__tab');
    const panels = document.querySelectorAll('.cabinet__panel');
    if (tabs.length && panels.length) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('cabinet__tab--active'));
                panels.forEach(p => p.classList.remove('cabinet__panel--active'));
                tab.classList.add('cabinet__tab--active');
                const tabName = tab.getAttribute('data-tab');
                document.getElementById('tab-' + tabName).classList.add('cabinet__panel--active');
            });
        });
    }

    // === Универсальная валидация форм ===
    (function() {
        function setError(input, message) {
            input.classList.add('input-error');
            let hint = input.parentNode.querySelector('.input-hint');
            if (!hint) {
                hint = document.createElement('div');
                hint.className = 'input-hint';
                input.parentNode.appendChild(hint);
            }
            hint.textContent = message;
        }
        function clearError(input) {
            input.classList.remove('input-error');
            let hint = input.parentNode.querySelector('.input-hint');
            if (hint) hint.textContent = '';
        }
        function validateEmail(email) {
            return /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email);
        }
        function validatePhone(phone) {
            return /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone);
        }
        function maskPhone(input) {
            input.addEventListener('input', function(e) {
                let x = input.value.replace(/\D/g, '').slice(0, 11);
                let formatted = '+7 ';
                if (x.length > 1) formatted += '(' + x.slice(1,4);
                if (x.length >= 4) formatted += ') ' + x.slice(4,7);
                if (x.length >= 7) formatted += '-' + x.slice(7,9);
                if (x.length >= 9) formatted += '-' + x.slice(9,11);
                input.value = formatted;
            });
        }
        document.querySelectorAll('.validate-form').forEach(form => {
            // Маска для телефона
            form.querySelectorAll('input[type="tel"]').forEach(maskPhone);
            form.addEventListener('submit', function(e) {
                let valid = true;
                form.querySelectorAll('input,textarea').forEach(input => {
                    clearError(input);
                    if (input.hasAttribute('required') && !input.value.trim()) {
                        setError(input, 'Поле обязательно для заполнения');
                        valid = false;
                    } else if (input.type === 'email' && input.value && !validateEmail(input.value)) {
                        setError(input, 'Введите корректный email');
                        valid = false;
                    } else if (input.type === 'tel' && input.value && !validatePhone(input.value)) {
                        setError(input, 'Телефон в формате +7 (XXX) XXX-XX-XX');
                        valid = false;
                    } else if (input.name === 'name' && /[^а-яА-Яa-zA-Z\s-]/.test(input.value)) {
                        setError(input, 'Имя: только буквы, пробелы и дефис');
                        valid = false;
                    }
                });
                if (!valid) {
                    e.preventDefault();
                }
            });
            // Подсказки при вводе
            form.querySelectorAll('input,textarea').forEach(input => {
                input.addEventListener('input', () => clearError(input));
            });
        });
    })();

    // === Form Validation & Mask ===
    // Маска телефона
    function phoneMask(input) {
        input.addEventListener('input', function(e) {
            let x = input.value.replace(/\D/g, '').slice(0, 11);
            let formatted = '+7';
            if (x.length > 1) formatted += ' (' + x.slice(1, 4);
            if (x.length >= 4) formatted += ') ' + x.slice(4, 7);
            if (x.length >= 7) formatted += '-' + x.slice(7, 9);
            if (x.length >= 9) formatted += '-' + x.slice(9, 11);
            input.value = formatted;
        });
    }
    // Регистрация
    const regForm = document.getElementById('register-form');
    if (regForm) {
        const name = regForm.querySelector('[name="name"]');
        const email = regForm.querySelector('[name="email"]');
        const phone = regForm.querySelector('[name="phone"]');
        const pass1 = regForm.querySelector('[name="password"]');
        const pass2 = regForm.querySelector('[name="password2"]');
        phoneMask(phone);
        regForm.addEventListener('submit', function(e) {
            let valid = true;
            // Имя
            if (!name.value.trim()) {
                setError(name, 'Введите имя'); valid = false;
            } else {
                clearError(name);
            }
            // Email
            if (!email.value.trim()) {
                setError(email, 'Введите e-mail'); valid = false;
            } else if (!/^\S+@\S+\.\S+$/.test(email.value)) {
                setError(email, 'Некорректный e-mail'); valid = false;
            } else {
                clearError(email);
            }
            // Телефон
            if (!phone.value.trim() || phone.value.replace(/\D/g, '').length !== 11) {
                setError(phone, 'Введите корректный номер'); valid = false;
            } else {
                clearError(phone);
            }
            // Пароль
            if (!pass1.value) {
                setError(pass1, 'Введите пароль'); valid = false;
            } else if (pass1.value.length < 6) {
                setError(pass1, 'Минимум 6 символов'); valid = false;
            } else {
                clearError(pass1);
            }
            // Подтверждение пароля
            if (pass2.value !== pass1.value) {
                setError(pass2, 'Пароли не совпадают'); valid = false;
            } else {
                clearError(pass2);
            }
            if (!valid) e.preventDefault();
        });
        // Ограничения на символы (только буквы и пробелы для имени)
        name.addEventListener('input', function() {
            name.value = name.value.replace(/[^а-яА-Яa-zA-ZёЁ\s-]/g, '');
        });
    }
    // Авторизация
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const email = loginForm.querySelector('[name="email"]');
        const pass = loginForm.querySelector('[name="password"]');
        loginForm.addEventListener('submit', function(e) {
            let valid = true;
            if (!email.value.trim()) {
                setError(email, 'Введите e-mail'); valid = false;
            } else if (!/^\S+@\S+\.\S+$/.test(email.value)) {
                setError(email, 'Некорректный e-mail'); valid = false;
            } else {
                clearError(email);
            }
            if (!pass.value) {
                setError(pass, 'Введите пароль'); valid = false;
            } else {
                clearError(pass);
            }
            if (!valid) e.preventDefault();
        });
    }

    // === Проверка авторизации на всех страницах ===
    function checkUserAuth() {
        fetch('php/check_auth.php')
            .then(res => res.json())
            .then(data => {
                if (data.logged_in) {
                    // Пользователь авторизован
                    const userInfo = document.getElementById('user-info');
                    const guestActions = document.getElementById('guest-actions');
                    const userName = document.getElementById('user-name');
                    
                    if (userInfo && guestActions && userName) {
                        userInfo.style.display = 'inline';
                        guestActions.style.display = 'none';
                        userName.innerHTML = `Привет, ${data.user_name}! <a href="cabinet.html" class="btn btn--small">Личный кабинет</a>`;
                    }
                } else {
                    // Пользователь не авторизован
                    const userInfo = document.getElementById('user-info');
                    const guestActions = document.getElementById('guest-actions');
                    
                    if (userInfo && guestActions) {
                        userInfo.style.display = 'none';
                        guestActions.style.display = 'inline';
                    }
                }
            })
            .catch(() => {
                // В случае ошибки показываем гостевые действия
                const userInfo = document.getElementById('user-info');
                const guestActions = document.getElementById('guest-actions');
                
                if (userInfo && guestActions) {
                    userInfo.style.display = 'none';
                    guestActions.style.display = 'inline';
                }
            });
    }

    // Проверяем авторизацию при загрузке страницы
    checkUserAuth();

    // === Cabinet: проверка авторизации и отображение пользователя ===
    if (document.querySelector('.main--cabinet')) {
        // Проверяем авторизацию пользователя
        fetch('php/check_auth.php')
            .then(res => res.json())
            .then(data => {
                if (data.logged_in) {
                    // Пользователь авторизован
                    document.getElementById('user-info').style.display = 'inline';
                    document.getElementById('guest-actions').style.display = 'none';
                    document.getElementById('user-name').textContent = `Привет, ${data.user_name}!`;
                } else {
                    // Пользователь не авторизован
                    document.getElementById('user-info').style.display = 'none';
                    document.getElementById('guest-actions').style.display = 'inline';
                    // Показываем сообщение о необходимости авторизации
                    document.querySelector('.cabinet__content').innerHTML = '<div style="padding:2rem;text-align:center;font-size:1.2rem;color:#b00;">Пожалуйста, авторизуйтесь для просмотра заявок.</div>';
                }
            })
            .catch(() => {
                // В случае ошибки показываем гостевые действия
                document.getElementById('user-info').style.display = 'none';
                document.getElementById('guest-actions').style.display = 'inline';
            });
    }

    // === Cabinet: динамическая подгрузка заявок ===
    if (document.querySelector('.main--cabinet')) {
        fetch('php/cabinet.php')
            .then(res => res.json())
            .then(data => {
                if (data.error === 'not_authorized') {
                    document.querySelector('.cabinet__content').innerHTML = '<div style="padding:2rem;text-align:center;font-size:1.2rem;color:#b00;">Пожалуйста, авторизуйтесь для просмотра заявок.</div>';
                    return;
                }
                if (data.error) {
                    document.querySelector('.cabinet__content').innerHTML = '<div style="padding:2rem;text-align:center;font-size:1.1rem;color:#b00;">Ошибка загрузки данных</div>';
                    return;
                }
                const orders = data.orders || [];
                const rows = orders.map(order => `
                    <tr>
                        <td>${order.service}</td>
                        <td>${order.device}</td>
                        <td><span class="status ${order.status === 'Завершено' ? 'status--done' : 'status--progress'}">${order.status}</span></td>
                    </tr>
                `).join('');
                document.querySelectorAll('.cabinet__table tbody').forEach(tbody => {
                    tbody.innerHTML = rows;
                });
            })
            .catch(() => {
                document.querySelector('.cabinet__content').innerHTML = '<div style="padding:2rem;text-align:center;font-size:1.1rem;color:#b00;">Ошибка соединения с сервером</div>';
            });
    }

    // === Cabinet: создание заявки ===
    const orderCreateBtn = document.getElementById('order-create-open');
    const orderCreateModal = document.getElementById('order-create-modal');
    const orderCreateClose = document.getElementById('order-create-close');
    const orderCreateOverlay = document.getElementById('order-create-overlay');
    const orderCreateForm = document.getElementById('order-create-form');
    const orderServiceSelect = document.getElementById('order-service');
    const orderDeviceSelect = document.getElementById('order-device');

    function openOrderModal() {
        orderCreateModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (orderCreateForm) orderCreateForm.reset();
        orderCreateModal.querySelectorAll('.form__error').forEach(e => e.textContent = '');
    }
    function closeOrderModal() {
        orderCreateModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    if (orderCreateBtn && orderCreateModal) {
        orderCreateBtn.addEventListener('click', openOrderModal);
        orderCreateClose.addEventListener('click', closeOrderModal);
        orderCreateOverlay.addEventListener('click', closeOrderModal);
        document.addEventListener('keydown', function(e) {
            if (orderCreateModal.getAttribute('aria-hidden') === 'false' && e.key === 'Escape') closeOrderModal();
        });
    }
    // Подгрузка услуг в select
    if (orderServiceSelect) {
        fetch('php/services_list.php')
            .then(res => res.json())
            .then(data => {
                orderServiceSelect.innerHTML = data.services.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            });
    }
    // Подгрузка устройств пользователя в select
    if (orderDeviceSelect) {
        fetch('php/user_devices.php')
            .then(res => res.json())
            .then(data => {
                orderDeviceSelect.innerHTML = data.devices.map(
                    d => `<option value="${d.id}">${d.name} (${d.type}, ${d.manufacturer}, ${d.model})</option>`
                ).join('');
            });
    }
    // Валидация и отправка формы
    if (orderCreateForm) {
        orderCreateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const service_id = orderServiceSelect.value;
            const device = document.getElementById('order-device').value.trim();
            const comment = document.getElementById('order-comment').value;
            let valid = true;
            if (!service_id) {
                orderServiceSelect.nextElementSibling.textContent = 'Выберите услугу'; valid = false;
            } else {
                orderServiceSelect.nextElementSibling.textContent = '';
            }
            if (!device) {
                document.getElementById('order-device').nextElementSibling.textContent = 'Укажите устройство'; valid = false;
            } else {
                document.getElementById('order-device').nextElementSibling.textContent = '';
            }
            // Комментарий не обязателен
            if (!valid) return;
            fetch('php/create_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ service_id, device, comment })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    closeOrderModal();
                    // Обновить таблицу заявок
                    if (document.querySelector('.main--cabinet')) {
                        fetch('php/cabinet.php')
                            .then(res => res.json())
                            .then(data => {
                                const orders = data.orders || [];
                                const rows = orders.map(order => `
                                    <tr>
                                        <td>${order.service}</td>
                                        <td>${order.device}</td>
                                        <td><span class="status ${order.status === 'Завершено' ? 'status--done' : 'status--progress'}">${order.status}</span></td>
                                    </tr>
                                `).join('');
                                document.querySelectorAll('.cabinet__table tbody').forEach(tbody => {
                                    tbody.innerHTML = rows;
                                });
                            });
                    }
                } else if (data.error === 'validation') {
                    if (data.message) alert(data.message);
                } else {
                    alert('Ошибка при создании заявки' + (data.message ? (': ' + data.message) : ''));
                }
            })
            .catch(() => alert('Ошибка соединения с сервером'));
        });
    }

    // === Слайдер отзывов ===
    (function() {
        const slides = document.querySelectorAll('#reviews-slider .slide');
        const prevBtn = document.getElementById('slider-prev');
        const nextBtn = document.getElementById('slider-next');
        let current = 0;
        let timer = null;

        function showSlide(idx) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === idx);
            });
            current = idx;
        }

        function nextSlide() {
            showSlide((current + 1) % slides.length);
        }
        function prevSlide() {
            showSlide((current - 1 + slides.length) % slides.length);
        }

        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);

        function startAuto() {
            timer = setInterval(nextSlide, 6000);
        }
        function stopAuto() {
            clearInterval(timer);
        }
        document.getElementById('reviews-slider').addEventListener('mouseenter', stopAuto);
        document.getElementById('reviews-slider').addEventListener('mouseleave', startAuto);

        showSlide(0);
        startAuto();
    })();
}); 