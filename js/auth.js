// auth.js - Manejo de autenticación
const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', async function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Verificar si ya existe token y validar datos contra la base de datos
    const token = getToken();

    if (token) {
        try {
            const response = await fetch(`${API_BASE}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const meUser = await response.json();
                localStorage.setItem('user', JSON.stringify(meUser));

                if (meUser.role === 'admin') {
                    window.location.href = 'admin-productos.html';
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
});

function toggleForms() {
    document.getElementById('loginForm').classList.toggle('active');
    document.getElementById('registerForm').classList.toggle('active');
    
    // Limpiar mensajes
    document.getElementById('loginMessage').className = 'message';
    document.getElementById('registerMessage').className = 'message';
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const messageDiv = document.getElementById('loginMessage');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error en el login');
        }

        // Guardar token y datos del usuario
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        messageDiv.className = 'message success';
        messageDiv.textContent = '✓ Login exitoso. Redirigiendo...';

        setTimeout(() => {
            if (data.user.role === 'admin') {
                window.location.href = 'admin-productos.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1500);

    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = `✗ ${error.message}`;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const messageDiv = document.getElementById('registerMessage');

    if (password !== passwordConfirm) {
        messageDiv.className = 'message error';
        messageDiv.textContent = '✗ Las contraseñas no coinciden';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error en el registro');
        }

        messageDiv.className = 'message success';
        messageDiv.textContent = '✓ Cuenta creada. Iniciando sesión...';

        // Guardar token y datos del usuario
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setTimeout(() => {
            // Redirigir a página de inicio (usuarios normales no pueden acceder a admin)
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = `✗ ${error.message}`;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'auth.html';
}

// Verificar si el usuario está autenticado y obtener token
function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Verificar autenticación
function requireAuth() {
    if (!getToken()) {
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}

// Verificar rol de admin
function requireAdmin() {
    const user = getUser();
    if (!user || user.role !== 'admin') {
        alert('Acceso denegado: Requiere permisos de administrador');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}
