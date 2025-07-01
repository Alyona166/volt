// admin-auth.js

// Вставка стилей для модального окна
if (!document.getElementById('admin-auth-modal-style')) {
    const style = document.createElement('style');
    style.id = 'admin-auth-modal-style';
    style.textContent = `
    #adminAuthModal {
        display: none;
        position: fixed;
        z-index: 9999;
        left: 0; top: 0; right: 0; bottom: 0;
        width: 100vw; height: 100vh;
        align-items: center;
        justify-content: center;
        font-family: 'Segoe UI', Arial, sans-serif;
    }
    #adminAuthModal .admin-auth-overlay {
        position: absolute;
        left: 0; top: 0; right: 0; bottom: 0;
        width: 100vw; height: 100vh;
        background: rgba(34, 44, 56, 0.45);
        z-index: 1;
        animation: adminFadeIn 0.3s;
    }
    #adminAuthModal .modal-content {
        position: relative;
        z-index: 2;
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 8px 40px rgba(34,44,56,0.18);
        padding: 2.2rem 2.5rem 2rem 2.5rem;
        max-width: 370px;
        width: 96vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        animation: adminModalIn 0.3s cubic-bezier(.4,1.6,.6,1) both;
    }
    #adminAuthModal .modal-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.2rem;
    }
    #adminAuthModal .modal-header h2 {
        font-size: 1.25rem;
        color: #223;
        margin: 0;
        font-weight: 600;
    }
    #adminAuthModal .close {
        font-size: 1.7rem;
        color: #888;
        cursor: pointer;
        border: none;
        background: none;
        transition: color 0.2s;
    }
    #adminAuthModal .close:hover {
        color: #e74c3c;
    }
    #adminAuthModal .form-group {
        width: 100%;
        margin-bottom: 1.2rem;
    }
    #adminAuthModal label {
        display: block;
        margin-bottom: 0.5rem;
        color: #223;
        font-size: 1rem;
        font-weight: 500;
    }
    #adminAuthModal input[type="password"] {
        width: 100%;
        padding: 0.7em 1em;
        border: 1px solid #cfd8dc;
        border-radius: 8px;
        font-size: 1.05rem;
        outline: none;
        transition: border 0.2s;
        background: #f8fafb;
    }
    #adminAuthModal input[type="password"]:focus {
        border-color: #4a90e2;
    }
    #adminAuthModal .form-actions {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }
    #adminAuthModal .btn-primary {
        background: #4a90e2;
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 0.7em 1.7em;
        font-size: 1.05rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
        box-shadow: 0 2px 8px rgba(34,44,56,0.07);
    }
    #adminAuthModal .btn-primary:hover {
        background: #357ab8;
    }
    @media (max-width: 600px) {
        #adminAuthModal .modal-content {
            padding: 1.2rem 0.7rem 1rem 0.7rem;
            max-width: 98vw;
        }
        #adminAuthModal .modal-header h2 {
            font-size: 1.05rem;
        }
    }
    @keyframes adminModalIn {
        from { opacity: 0; transform: translateY(40px) scale(0.98); }
        to   { opacity: 1; transform: none; }
    }
    @keyframes adminFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
    }
    `;
    document.head.appendChild(style);
}

// Вставка модального окна в body, если его нет
if (!document.getElementById('adminAuthModal')) {
    const modalHtml = `
    <div id="adminAuthModal" class="modal" style="display:none;z-index:9999;">
      <div class="admin-auth-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Авторизация администратора</h2>
          <span class="close" id="adminAuthClose">&times;</span>
        </div>
        <div class="modal-body">
          <form id="adminAuthForm">
            <div class="form-group">
              <label for="adminPassword">Пароль:</label>
              <input type="password" id="adminPassword" name="password" required autocomplete="off">
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Войти</button>
            </div>
          </form>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

const adminAuthModal = document.getElementById('adminAuthModal');
const adminAuthForm = document.getElementById('adminAuthForm');
const adminAuthClose = document.getElementById('adminAuthClose');
const adminAuthOverlay = adminAuthModal.querySelector('.admin-auth-overlay');

function showAdminAuthModal() {
    adminAuthModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    adminAuthForm.reset();
    setTimeout(() => {
        document.getElementById('adminPassword').focus();
    }, 100);
}
function closeAdminAuthModal() {
    adminAuthModal.style.display = 'none';
    document.body.style.overflow = '';
}

adminAuthClose.onclick = closeAdminAuthModal;
adminAuthOverlay.onclick = closeAdminAuthModal;
adminAuthModal.onkeydown = function(e) {
    if (e.key === 'Escape') closeAdminAuthModal();
};

// Обработка формы
adminAuthForm.onsubmit = async function(e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    try {
        const response = await fetch('php/admin_auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=login&password=${encodeURIComponent(password)}`
        });
        const data = await response.json();
        if (data.success) {
            closeAdminAuthModal();
            window.location.href = 'admin.html';
        } else {
            alert(data.message || 'Неверный пароль');
        }
    } catch (error) {
        alert('Ошибка авторизации');
    }
};

// Экспортируем функцию для показа окна
window.showAdminAuthModal = showAdminAuthModal; 