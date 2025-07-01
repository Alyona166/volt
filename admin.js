// Проверка авторизации админа
let isAdminAuthenticated = false;

// Основной обработчик загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    // Сначала проверяем авторизацию
    checkAdminAuth();
});

// Функция проверки авторизации
async function checkAdminAuth() {
    console.log('Проверяем авторизацию...');
    try {
        const response = await fetch('php/admin_auth.php?action=check_auth');
        const data = await response.json();
        console.log('Ответ сервера:', data);
        
        if (!data.logged_in) {
            console.log('Пользователь не авторизован, показываем модальное окно');
            showAdminAuthModal();
        } else {
            console.log('Пользователь авторизован, инициализируем панель');
            isAdminAuthenticated = true;
            initAdminPanel();
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        console.log('Показываем модальное окно из-за ошибки');
        showAdminAuthModal();
    }
}

// Показать модальное окно авторизации
function showAdminAuthModal() {
    console.log('Показываем модальное окно авторизации');
    const modal = document.getElementById('adminAuthModal');
    console.log('Найденный элемент модального окна:', modal);
    if (modal) {
        modal.style.display = 'flex';
        console.log('Модальное окно показано');
    } else {
        console.error('Модальное окно не найдено!');
    }
}

// Закрыть модальное окно авторизации
function closeAdminAuthModal() {
    document.getElementById('adminAuthModal').style.display = 'none';
}

// Обработка формы авторизации
document.getElementById('adminAuthForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    
    try {
        const response = await fetch('php/admin_auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=login&password=${encodeURIComponent(password)}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            isAdminAuthenticated = true;
            closeAdminAuthModal();
            initAdminPanel();
        } else {
            alert(data.message || 'Неверный пароль');
        }
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        alert('Ошибка авторизации');
    }
});

// Инициализация админ-панели после авторизации
function initAdminPanel() {
    // Переключение вкладок
    const navLinks = document.querySelectorAll('.nav__link[data-tab]');
    const tabContents = document.querySelectorAll('.admin-tab-content');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('nav__link--active'));
            this.classList.add('nav__link--active');
            const tab = this.dataset.tab;
            tabContents.forEach(tc => tc.style.display = 'none');
            document.getElementById('tab-' + tab).style.display = '';
            if (tab !== 'queries') loadTable(tab);
            if (tab === 'queries') loadQueries();
        });
    });

    // Переопределяю loadTable для users/services/orders
    function loadTable(tab) {
        fetch(`php/admin.php?action=list&table=${tab}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    document.getElementById('tab-' + tab).innerHTML = '<div style="color:#b00;padding:2rem;">Ошибка загрузки данных</div>';
                    return;
                }
                if (tab === 'users' || tab === 'services' || tab === 'orders') {
                    renderCrudTable(tab, data.data || []);
                } else {
                    // старый вывод для других вкладок (если останутся)
                    const rows = (data.data || []).map(row =>
                        '<tr>' + Object.values(row).map(v => `<td>${v}</td>`).join('') + '</tr>'
                    ).join('');
                    const headers = data.data && data.data[0] ? Object.keys(data.data[0]).map(h => `<th>${h}</th>`).join('') : '';
                    document.getElementById('tab-' + tab).innerHTML = `
                        <div class="cabinet__card">
                            <table class="cabinet__table">
                                <thead><tr>${headers}</tr></thead>
                                <tbody>${rows}</tbody>
                            </table>
                        </div>
                    `;
                }
            });
    }

    // Дорабатываю renderCrudTable для orders
    function renderCrudTable(tab, data) {
        const isUsers = tab === 'users';
        const isServices = tab === 'services';
        const isOrders = tab === 'orders';
        const headers = data[0] ? Object.keys(data[0]) : [];
        let html = `<div style="margin-bottom:1.2rem;display:flex;gap:1rem;">
            <button class="btn" id="admin-add-btn">Добавить</button>
        </div>`;
        html += `<div class="cabinet__card"><table class="cabinet__table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}<th></th></tr></thead><tbody>`;
        html += data.map(row =>
            `<tr>${headers.map(h=>`<td>${row[h]}</td>`).join('')}
                <td>
                    <button class="btn btn--small admin-edit-btn" data-id="${row.id}" data-tab="${tab}">✏️</button>
                    <button class="btn btn--small admin-del-btn" data-id="${row.id}" data-tab="${tab}">🗑️</button>
                </td>
            </tr>`
        ).join('');
        html += '</tbody></table></div>';
        document.getElementById('tab-' + tab).innerHTML = html;

        // Добавить
        document.getElementById('admin-add-btn').onclick = () => openCrudModal(tab, null, tab);
        // Редактировать
        document.querySelectorAll('.admin-edit-btn').forEach(btn => {
            btn.onclick = () => {
                const row = data.find(r => r.id == btn.dataset.id);
                const btnTab = btn.dataset.tab;
                openCrudModal(btnTab, row, btnTab);
            };
        });
        // Удалить
        document.querySelectorAll('.admin-del-btn').forEach(btn => {
            btn.onclick = () => {
                const btnTab = btn.dataset.tab;
                if (confirm('Удалить запись?')) {
                    console.log('CRUD table (delete):', btnTab);
                    fetch('php/admin.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'delete', table: btnTab, data: { id: btn.dataset.id } })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            loadTable(btnTab);
                        } else {
                            let errorMsg = 'Ошибка при удалении';
                            if (data.error === 'Unauthorized') {
                                errorMsg = 'Ошибка авторизации: ' + (data.details || 'Сессия администратора не найдена');
                            } else if (data.error === 'db_error') {
                                errorMsg = 'Ошибка базы данных: ' + data.message;
                                if (data.details) errorMsg += '\n\nДетали: ' + data.details;
                                if (data.sql_state) errorMsg += '\nSQL State: ' + data.sql_state;
                                if (data.debug_info) {
                                    console.log('Debug info:', data.debug_info);
                                    errorMsg += '\n\nДополнительная информация выведена в консоль';
                                }
                            } else if (data.error === 'unknown_table') {
                                errorMsg = 'Неизвестная таблица: ' + (data.details || '');
                            }
                            alert(errorMsg);
                            console.error('CRUD Error:', data);
                        }
                    })
                    .catch(error => {
                        console.error('Network error:', error);
                        alert('Ошибка соединения с сервером: ' + error.message);
                    });
                }
            };
        });
    }

    function openCrudModal(tabArg, row, forceTab) {
        const tab = forceTab || tabArg;
        console.log('[DEBUG] openCrudModal, tab =', tab);
        if (!tab || (tab !== 'users' && tab !== 'services' && tab !== 'orders')) {
            alert('Ошибка: tab не определён или некорректен! (' + tab + ')');
            return;
        }
        const isUsers = tab === 'users';
        const isServices = tab === 'services';
        const isOrders = tab === 'orders';
        let formHtml = '<form id="crud-form">';
        if (isUsers) {
            formHtml += `<div class="form__group"><label>Имя</label><input name="name" required value="${row?.name||''}"></div>`;
            formHtml += `<div class="form__group"><label>Email</label><input name="email" required value="${row?.email||''}"></div>`;
            formHtml += `<div class="form__group"><label>Телефон</label><input name="phone" required value="${row?.phone||''}"></div>`;
            if (!row) formHtml += `<div class="form__group"><label>Пароль</label><input name="password" type="password" required></div>`;
        }
        if (isServices) {
            formHtml += `<div class="form__group"><label>Название</label><input name="name" required value="${row?.name||''}"></div>`;
            formHtml += `<div class="form__group"><label>Цена</label><input name="price" type="number" min="0" required value="${row?.price||''}"></div>`;
        }
        if (isOrders) {
            formHtml += `<div class="form__group"><label>ID пользователя</label><input name="user_id" type="number" required value="${row?.user_id||''}"></div>`;
            formHtml += `<div class="form__group"><label>ID услуги</label><input name="service_id" type="number" required value="${row?.service_id||''}"></div>`;
            formHtml += `<div class="form__group"><label>Устройство</label><input name="device" required value="${row?.device||''}"></div>`;
            formHtml += `<div class="form__group"><label>Описание проблемы</label><input name="problem_description" value="${row?.problem_description||''}"></div>`;
            formHtml += `<div class="form__group"><label>Статус</label><select name="status">
                <option value="Новый" ${row?.status==='Новый'?'selected':''}>Новый</option>
                <option value="В процессе" ${row?.status==='В процессе'?'selected':''}>В процессе</option>
                <option value="Завершено" ${row?.status==='Завершено'?'selected':''}>Завершено</option>
                <option value="Отменено" ${row?.status==='Отменено'?'selected':''}>Отменено</option>
            </select></div>`;
            formHtml += `<div class="form__group"><label>Стоимость</label><input name="total_cost" type="number" step="0.01" value="${row?.total_cost||''}"></div>`;
        }
        formHtml += '<button class="btn form__submit" type="submit">Сохранить</button></form>';
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `<div class="modal__overlay"></div><div class="modal__content"><button class="modal__close" id="crud-close">×</button><h2 class="modal__title">${row ? 'Редактировать' : 'Добавить'} ${isUsers ? 'пользователя' : isServices ? 'услугу' : 'заявку'}</h2>${formHtml}</div>`;
        document.getElementById('admin-modal-root').appendChild(modal);
        document.getElementById('crud-close').onclick = ()=>modal.remove();
        modal.querySelector('.modal__overlay').onclick = ()=>modal.remove();
        modal.querySelector('#crud-form').onsubmit = function(e) {
            e.preventDefault();
            const formData = Object.fromEntries(new FormData(this));
            if (row) formData.id = row.id;
            console.log('CRUD table (save):', tab);
            if (!tab || (tab !== 'users' && tab !== 'services' && tab !== 'orders')) {
                alert('Ошибка: tab не определён или некорректен при отправке! (' + tab + ')');
                return;
            }
            console.log('CRUD data:', formData);
            fetch('php/admin.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: row ? 'edit' : 'add',
                    table: tab,
                    data: formData
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    modal.remove();
                    loadTable(tab);
                } else {
                    let errorMsg = 'Ошибка при сохранении';
                    if (data.error === 'Unauthorized') {
                        errorMsg = 'Ошибка авторизации: ' + (data.details || 'Сессия администратора не найдена');
                    } else if (data.error === 'db_error') {
                        errorMsg = 'Ошибка базы данных: ' + data.message;
                        if (data.details) errorMsg += '\n\nДетали: ' + data.details;
                        if (data.sql_state) errorMsg += '\nSQL State: ' + data.sql_state;
                        if (data.debug_info) {
                            console.log('Debug info:', data.debug_info);
                            errorMsg += '\n\nДополнительная информация выведена в консоль';
                        }
                    } else if (data.error === 'unknown_table') {
                        errorMsg = 'Неизвестная таблица: ' + (data.details || '');
                    }
                    alert(errorMsg);
                    console.error('CRUD Error:', data);
                }
            })
            .catch(error => {
                console.error('Network error:', error);
                alert('Ошибка соединения с сервером: ' + error.message);
            });
        };
    }

    // Загрузка по умолчанию
    loadTable('users');

    // Заглушка для вкладки SQL-запросов
    function loadQueries() {
        document.getElementById('tab-queries').innerHTML = `
            <div class="queries-section">
                <p>Выберите один из 10 аналитических запросов для получения данных:</p>
                <div class="queries-grid">
                    <div class="query-card">
                        <h3>1. Устройства в ремонте</h3>
                        <p>Список всех устройств, находящихся в ремонте с данными заказчика</p>
                        <a href="php/queries.php?query=1&execute=1" target="_blank">Выполнить</a>
                    </div>
                    <div class="query-card">
                        <h3>2. Заказы техника</h3>
                        <p>Список всех ремонтных заказов, выполненных определенным техником</p>
                        <a href="php/queries.php?query=2&execute=1" target="_blank">Выполнить</a>
                    </div>
                    <div class="query-card">
                        <h3>3. Истекшая гарантия</h3>
                        <p>Список всех устройств, у которых гарантия истекла</p>
                        <a href="php/queries.php?query=3&execute=1" target="_blank">Выполнить</a>
                    </div>
                    <div class="query-card">
                        <h3>4. Активные клиенты</h3>
                        <p>Список всех клиентов, у которых есть активные ремонтные заказы</p>
                        <a href="php/queries.php?query=4&execute=1" target="_blank">Выполнить</a>
                    </div>
                    <div class="query-card">
                        <h3>5. Ремонты техника</h3>
                        <p>Список всех устройств, которые были отремонтированы определенным техником</p>
                        <a href="php/queries.php?query=5&execute=1" target="_blank">Выполнить</a>
                    </div>
                    <div class="query-card">
                        <h3>6. Заказы по периоду</h3>
                        <p>Список всех ремонтных заказов, завершенных в заданный период</p>
                        <a href="php/queries.php?query=6&execute=1" target="_blank">Выполнить</a>
                    </div>
                    <div class="query-card">
                        <h3>7. Неисправности компонентов</h3>
                        <p>Список всех устройств с неисправностью определенного компонента</p>
                        <a href="php/queries.php?query=7&execute=1" target="_blank">Выполнить</a>
                    </div>
                    <div class="query-card">
                        <h3>8. Статистика по типам</h3>
                        <p>Список всех устройств, сгруппированных по типу</p>
                        <a href="php/queries.php?query=8&execute=1" target="_blank">Выполнить</a>
                    </div>
                    <div class="query-card">
                        <h3>9. Статистика по статусам</h3>
                        <p>Список всех ремонтных заказов, сгруппированных по статусу</p>
                        <a href="php/queries.php?query=9&execute=1" target="_blank">Выполнить</a>
                    </div>
                    <div class="query-card">
                        <h3>10. Заказы производителя</h3>
                        <p>Список всех ремонтных заказов устройств определенного производителя</p>
                        <a href="php/queries.php?query=10&execute=1" target="_blank">Выполнить</a>
                    </div>
                </div>
            </div>
        `;
    }
} 