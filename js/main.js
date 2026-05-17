// main.js - Funcionalidades principales del sitio

function formatearPrecioCOP(valor) {
    if (valor == null || valor === '') return '';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(valor));
}

document.addEventListener('DOMContentLoaded', function() {
    // Verificar compatibilidad del navegador
    verificarCompatibilidadNavegador();

    // Inicializar carrusel de productos destacados
    inicializarCarrusel();

    // Inicializar validación de formularios
    inicializarValidacionFormularios();

    // Inicializar efectos de botones
    inicializarEfectosBotones();

    // Inicializar menú móvil
    inicializarMenuMovil();

    // Inicializar menú de usuario
    inicializarUserMenu();

    // Mostrar botón de admin si corresponde
    inicializarAdminButton();

    // Inicializar animaciones de entrada
    inicializarAnimaciones();

    // Agregar transición suave en los enlaces a autenticación
    setupAuthLinkTransitions();

    // Inicializar catálogo y detalle producto con la API
    inicializarPaginaApi();
});

// Función para inicializar el carrusel de productos destacados
function inicializarCarrusel() {
    const carrusel = document.querySelector('.productos-destacados');
    if (!carrusel) return;

    // Agregar estructura del carrusel
    carrusel.innerHTML = `
        <div class="carrusel-contenedor">
            <div class="carrusel-track">
                ${carrusel.innerHTML}
            </div>
            <button class="carrusel-btn carrusel-prev" aria-label="Producto anterior">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="carrusel-btn carrusel-next" aria-label="Producto siguiente">
                <i class="fas fa-chevron-right"></i>
            </button>
            <div class="carrusel-indicadores"></div>
        </div>
    `;

    const track = carrusel.querySelector('.carrusel-track');
    const prevBtn = carrusel.querySelector('.carrusel-prev');
    const nextBtn = carrusel.querySelector('.carrusel-next');
    const indicadores = carrusel.querySelector('.carrusel-indicadores');

    const productos = track.children;
    const totalProductos = productos.length;
    let currentIndex = 0;

    // Crear indicadores
    for (let i = 0; i < totalProductos; i++) {
        const indicador = document.createElement('button');
        indicador.className = `indicador ${i === 0 ? 'activo' : ''}`;
        indicador.setAttribute('aria-label', `Ir al producto ${i + 1}`);
        indicador.addEventListener('click', () => irAProducto(i));
        indicadores.appendChild(indicador);
    }

    function actualizarCarrusel() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Actualizar indicadores
        indicadores.querySelectorAll('.indicador').forEach((ind, index) => {
            ind.classList.toggle('activo', index === currentIndex);
        });
    }

    function irAProducto(index) {
        currentIndex = index;
        actualizarCarrusel();
    }

    function siguienteProducto() {
        currentIndex = (currentIndex + 1) % totalProductos;
        actualizarCarrusel();
    }

    function productoAnterior() {
        currentIndex = (currentIndex - 1 + totalProductos) % totalProductos;
        actualizarCarrusel();
    }

    // Event listeners
    prevBtn.addEventListener('click', productoAnterior);
    nextBtn.addEventListener('click', siguienteProducto);

    // Auto-play (opcional)
    let autoPlayInterval = setInterval(siguienteProducto, 5000);

    // Pausar auto-play en hover
    carrusel.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    carrusel.addEventListener('mouseleave', () => {
        autoPlayInterval = setInterval(siguienteProducto, 5000);
    });

    // Soporte para swipe en móviles
    let startX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        clearInterval(autoPlayInterval);
    });

    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                siguienteProducto();
            } else {
                productoAnterior();
            }
            isDragging = false;
        }
    });

    track.addEventListener('touchend', () => {
        isDragging = false;
        autoPlayInterval = setInterval(siguienteProducto, 5000);
    });

    // Navegación por teclado
    carrusel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            productoAnterior();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            siguienteProducto();
        }
    });

    // Hacer el carrusel focusable para navegación por teclado
    carrusel.setAttribute('tabindex', '0');
    carrusel.setAttribute('aria-label', 'Carrusel de productos destacados');
    carrusel.setAttribute('role', 'region');

    // Actualizar aria-live para lectores de pantalla
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    carrusel.appendChild(liveRegion);

    function actualizarLiveRegion() {
        const productoActual = productos[currentIndex];
        const nombreProducto = productoActual.querySelector('h4').textContent;
        liveRegion.textContent = `Producto ${currentIndex + 1} de ${totalProductos}: ${nombreProducto}`;
    }

    // Llamar inicialmente y en cada cambio
    actualizarLiveRegion();
    // Modificar la función actualizarCarrusel para incluir la actualización de live region
    const originalActualizarCarrusel = actualizarCarrusel;
    actualizarCarrusel = function() {
        originalActualizarCarrusel();
        actualizarLiveRegion();
    };
}

// Función para inicializar validación de formularios
function inicializarValidacionFormularios() {
    // Validación del formulario de suscripción
    const formSuscripcion = document.querySelector('.suscripcion-pie form');
    if (formSuscripcion) {
        formSuscripcion.addEventListener('submit', function(e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            // Validación básica de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!email) {
                mostrarMensajeError(emailInput, 'Por favor ingresa tu correo electrónico');
                return;
            }

            if (!emailRegex.test(email)) {
                mostrarMensajeError(emailInput, 'Por favor ingresa un correo electrónico válido');
                return;
            }

            // Simular envío exitoso
            mostrarMensajeExito('¡Gracias por suscribirte! Recibirás nuestras novedades pronto.');
            emailInput.value = '';
        });
    }

    // Validación del formulario de contacto (si existe)
    const formContacto = document.querySelector('.formulario-contacto form');
    if (formContacto) {
        formContacto.addEventListener('submit', async function(e) {
            e.preventDefault();

            const campos = this.querySelectorAll('input, textarea');
            let valido = true;
            const formMessage = this.querySelector('#contactFormMessage');

            if (formMessage) {
                formMessage.className = 'message';
                formMessage.textContent = '';
            }

            campos.forEach(campo => {
                if (campo.hasAttribute('required') && !campo.value.trim()) {
                    mostrarMensajeError(campo, 'Este campo es obligatorio');
                    valido = false;
                } else {
                    ocultarMensajeError(campo);
                }
            });

            const emailCampo = this.querySelector('input[type="email"]');
            if (emailCampo && emailCampo.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailCampo.value.trim())) {
                    mostrarMensajeError(emailCampo, 'Ingresa un correo electrónico válido');
                    valido = false;
                }
            }

            if (valido) {
                const payload = {
                    nombre: this.querySelector('#nombre').value.trim(),
                    email: this.querySelector('#email').value.trim(),
                    asunto: this.querySelector('#asunto').value.trim(),
                    mensaje: this.querySelector('#mensaje').value.trim()
                };

                try {
                    const response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.error || 'Error enviando el mensaje');
                    }

                    if (formMessage) {
                        formMessage.className = 'message success';
                        formMessage.textContent = '¡Mensaje enviado! También recibirás una copia en tu correo.';
                    }
                    this.reset();
                } catch (error) {
                    if (formMessage) {
                        formMessage.className = 'message error';
                        formMessage.textContent = `Error: ${error.message}`;
                    } else {
                        alert(`Error: ${error.message}`);
                    }
                }
            }
        });
    }
}

function ocultarMensajeError(campo) {
    const errorExistente = campo.parentNode.querySelector('.mensaje-error');
    if (errorExistente) {
        errorExistente.remove();
    }
    campo.classList.remove('campo-error');
}

function mostrarMensajeExito(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-exito';
    notificacion.textContent = mensaje;

    document.body.appendChild(notificacion);

    // Animación de entrada
    notificacion.style.opacity = '0';
    notificacion.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        notificacion.style.transition = 'all 0.3s ease';
        notificacion.style.opacity = '1';
        notificacion.style.transform = 'translateY(0)';
    }, 10);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        notificacion.style.opacity = '0';
        notificacion.style.transform = 'translateY(-20px)';
        setTimeout(() => notificacion.remove(), 300);
    }, 5000);
}

// Función para inicializar efectos de botones
function inicializarEfectosBotones() {
    const botones = document.querySelectorAll('.boton');

    botones.forEach(boton => {
        // Efecto de ripple al hacer click
        boton.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });

        // Efecto de escala al presionar
        boton.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });

        boton.addEventListener('mouseup', function() {
            this.style.transform = '';
        });

        boton.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// Función para inicializar el menú móvil
function inicializarMenuMovil() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.enlaces-navegacion');

    if (!menuToggle || !nav) return;

    // Crear overlay para cerrar menú
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    // Función para alternar menú
    function toggleMenu() {
        const isOpen = nav.classList.contains('menu-open');
        menuToggle.classList.toggle('active');
        nav.classList.toggle('menu-open');
        overlay.classList.toggle('active');
        document.body.classList.toggle('menu-open-body');

        // Actualizar atributos de accesibilidad
        menuToggle.setAttribute('aria-expanded', !isOpen);
        overlay.setAttribute('aria-hidden', isOpen);

        // Focus management
        if (!isOpen) {
            // Mover foco al primer enlace del menú
            const firstLink = nav.querySelector('a');
            if (firstLink) firstLink.focus();
        }
    }

    // Toggle menú con click
    menuToggle.addEventListener('click', toggleMenu);

    // Toggle menú con Enter o Space
    menuToggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });

    // Cerrar menú al hacer click en overlay
    overlay.addEventListener('click', function() {
        if (nav.classList.contains('menu-open')) {
            toggleMenu();
        }
    });

    // Cerrar menú al hacer click en un enlace
    nav.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            toggleMenu();
        }
    });

    // Cerrar menú al presionar Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('menu-open')) {
            toggleMenu();
        }
    });

    // Trap focus dentro del menú cuando está abierto
    nav.addEventListener('keydown', function(e) {
        if (!nav.classList.contains('menu-open')) return;

        const focusableElements = nav.querySelectorAll('a, button');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    });

    // Inicializar atributos de accesibilidad
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-controls', 'menu-navegacion');
    nav.setAttribute('id', 'menu-navegacion');
}

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
}

function fadeAndNavigate(url) {
    document.body.classList.add('fade-page-out');
    setTimeout(() => window.location.href = url, 250);
}

function setupAuthLinkTransitions() {
    document.querySelectorAll('a[href^="auth.html"]:not(.user-menu-link)').forEach(link => {
        link.addEventListener('click', function(e) {
            if (e.defaultPrevented) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            fadeAndNavigate(this.href);
        });
    });
}

function logoutAndRedirect() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    fadeAndNavigate('auth.html');
}

function inicializarUserMenu() {
    const userActions = document.querySelector('.acciones-usuario');
    if (!userActions) return;

    const popup = document.createElement('div');
    popup.className = 'user-popup hidden';
    popup.innerHTML = `
        <div class="user-popup-card" role="dialog" aria-modal="true" aria-label="Menú de usuario">
            <div class="user-popup-header">
                <span id="userPopupGreeting">Hola</span>
                <button type="button" class="user-popup-close" aria-label="Cerrar menú">×</button>
            </div>
            <div class="user-popup-body">
                <div class="user-popup-actions">
                    <button type="button" id="userPopupEdit" class="user-popup-button">Editar perfil</button>
                    <button type="button" id="userPopupLogout" class="user-popup-button secondary">Cerrar sesión</button>
                </div>
                <div class="user-popup-form hidden" id="userPopupForm">
                    <label for="userNewName">Nombre</label>
                    <input id="userNewName" type="text" placeholder="Nuevo nombre">
                    <label for="userNewPassword">Nueva contraseña</label>
                    <input id="userNewPassword" type="password" placeholder="Nueva contraseña">
                    <label for="userNewPasswordConfirm">Confirmar contraseña</label>
                    <input id="userNewPasswordConfirm" type="password" placeholder="Confirmar contraseña">
                    <div class="user-popup-form-actions">
                        <button type="button" id="userPopupSave" class="user-popup-button">Guardar cambios</button>
                        <button type="button" id="userPopupCancel" class="user-popup-button secondary">Cancelar</button>
                    </div>
                    <div id="userPopupMessage" class="user-popup-message"></div>
                </div>
            </div>
        </div>`;
    document.body.appendChild(popup);

    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;
        if (!link.querySelector('i.fa-user')) return;

        const user = getUser();
        if (!user) {
            e.preventDefault();
            fadeAndNavigate('auth.html');
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        updateUserPopup();
        popup.classList.toggle('hidden');
    });

    popup.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('.acciones-usuario')) {
            return;
        }
        if (!popup.contains(e.target)) {
            popup.classList.add('hidden');
        }
    });

    const closeButton = popup.querySelector('.user-popup-close');
    const editButton = popup.querySelector('#userPopupEdit');
    const logoutButton = popup.querySelector('#userPopupLogout');
    const saveButton = popup.querySelector('#userPopupSave');
    const cancelButton = popup.querySelector('#userPopupCancel');
    const formContainer = popup.querySelector('#userPopupForm');

    closeButton.addEventListener('click', () => popup.classList.add('hidden'));
    logoutButton.addEventListener('click', logoutAndRedirect);
    editButton.addEventListener('click', () => {
        formContainer.classList.remove('hidden');
        popup.querySelector('#userPopupMessage').textContent = '';
    });
    cancelButton.addEventListener('click', () => {
        formContainer.classList.add('hidden');
        popup.querySelector('#userPopupMessage').textContent = '';
    });
    saveButton.addEventListener('click', async () => {
        await handleUserProfileUpdate(popup);
    });
}

function inicializarAdminButton() {
    const adminButton = document.getElementById('adminPanelButton');
    const user = getUser();
    if (!adminButton) return;

    if (user && user.role === 'admin') {
        adminButton.style.display = 'block';
    } else {
        adminButton.style.display = 'none';
    }
}

function updateUserPopup() {
    const user = getUser();
    const greeting = document.getElementById('userPopupGreeting');
    const nameInput = document.getElementById('userNewName');
    const passwordInput = document.getElementById('userNewPassword');
    const passwordConfirmInput = document.getElementById('userNewPasswordConfirm');
    const formContainer = document.getElementById('userPopupForm');
    const messageDiv = document.getElementById('userPopupMessage');

    if (!user || !greeting) return;

    greeting.textContent = `Hola, ${user.name}`;
    if (nameInput) nameInput.value = user.name || '';
    if (passwordInput) passwordInput.value = '';
    if (passwordConfirmInput) passwordConfirmInput.value = '';
    if (messageDiv) {
        messageDiv.textContent = '';
        messageDiv.className = 'user-popup-message';
    }
    if (formContainer) formContainer.classList.add('hidden');
}

async function handleUserProfileUpdate(popup) {
    const name = document.getElementById('userNewName').value.trim();
    const password = document.getElementById('userNewPassword').value;
    const passwordConfirm = document.getElementById('userNewPasswordConfirm').value;
    const messageDiv = document.getElementById('userPopupMessage');

    messageDiv.className = 'user-popup-message';
    messageDiv.textContent = '';

    if (!name && !password) {
        messageDiv.classList.add('error');
        messageDiv.textContent = 'Ingresa un nombre o contraseña nueva para actualizar.';
        return;
    }

    if (password && password !== passwordConfirm) {
        messageDiv.classList.add('error');
        messageDiv.textContent = 'Las contraseñas no coinciden.';
        return;
    }

    const token = getToken();
    if (!token) {
        logoutAndRedirect();
        return;
    }

    const payload = {};
    if (name) payload.name = name;
    if (password) payload.password = password;

    try {
        const response = await fetch(`${API_BASE}/users/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'No se pudo actualizar el perfil');

        localStorage.setItem('user', JSON.stringify(data));
        messageDiv.classList.add('success');
        messageDiv.textContent = 'Perfil actualizado correctamente.';
        updateUserPopup();
    } catch (error) {
        messageDiv.classList.add('error');
        messageDiv.textContent = error.message;
    }
}

function inicializarAnimaciones() {
    // Animación de entrada para tarjetas
    const tarjetas = document.querySelectorAll('.tarjeta');
    tarjetas.forEach((tarjeta, index) => {
        tarjeta.style.opacity = '0';
        tarjeta.style.transform = 'translateY(30px)';
        tarjeta.style.transition = 'all 0.6s ease';

        setTimeout(() => {
            tarjeta.style.opacity = '1';
            tarjeta.style.transform = 'translateY(0)';
        }, index * 200);
    });

    // Animación de entrada para secciones
    const secciones = document.querySelectorAll('section');
    secciones.forEach((seccion, index) => {
        seccion.style.opacity = '0';
        seccion.style.transform = 'translateY(50px)';
        seccion.style.transition = 'all 0.8s ease';

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(seccion);
    });
}

// Función para verificar compatibilidad del navegador
function verificarCompatibilidadNavegador() {
    const incompatibilidades = [];

    // Verificar Flexbox
    if (!CSS.supports('display', 'flex')) {
        incompatibilidades.push('Flexbox no soportado');
    }

    // Verificar Grid
    if (!CSS.supports('display', 'grid')) {
        incompatibilidades.push('CSS Grid no soportado');
    }

    // Verificar ES6 features básicos
    try {
        eval('const test = () => {};');
    } catch (e) {
        incompatibilidades.push('ES6 arrow functions no soportadas');
    }

    // Verificar localStorage
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (e) {
        incompatibilidades.push('localStorage no disponible');
    }

    // Verificar Intersection Observer
    if (!window.IntersectionObserver) {
        incompatibilidades.push('Intersection Observer no soportado');
    }

    if (incompatibilidades.length > 0) {
        console.warn('Posibles problemas de compatibilidad detectados:', incompatibilidades);
        // Podríamos mostrar una notificación al usuario si es necesario
    }

    return incompatibilidades.length === 0;
}

// ===== CONFIGURACIÓN API =====
const API_BASE = 'http://localhost:3000/api';

// Datos locales como fallback
const LOCAL_PRODUCTS = [
    { id: 1, name: "Apex Legends: Deluxe Edition", price: 59.99, image: "img/Apex_legends.jpg", category: "juegos", description: "Battle royale gratuito con contenido deluxe.", specifications: ["Plataforma: PC/PS5/Xbox", "Género: Shooter", "Multijugador: Sí", "Idioma: Español/Inglés"] },
    { id: 2, name: "Death Stranding: Deluxe Edition", price: 49.99, image: "img/Death_Stranding.webp", category: "juegos", description: "Aventura de exploración con historia inmersiva.", specifications: ["Plataforma: PS4/PS5/PC", "Género: Acción/Aventura", "Duración: 40+ horas", "Idioma: Español/Inglés"] },
    { id: 3, name: "Cyberpunk 2077", price: 39.99, image: "img/Cyberpunk_2077.jpg", category: "juegos", description: "RPG futurista en Night City.", specifications: ["Plataforma: PC/PS5/Xbox", "Género: RPG", "Modo: Un jugador", "Idioma: Español/Inglés"] },
    { id: 4, name: "FIFA 24", price: 69.99, image: "img/fifa.jpg", category: "juegos", description: "Simulador de fútbol con modos de carrera y Ultimate Team.", specifications: ["Plataforma: PC/PS5/Xbox", "Género: Deportes", "Multijugador: Sí", "Idioma: Español/Inglés"] },
    { id: 5, name: "Grand Theft Auto V", price: 29.99, image: "img/gta.jpg", category: "juegos", description: "Mundo abierto con campaña y GTA Online.", specifications: ["Plataforma: PC/PS5/Xbox", "Género: Acción/Aventura", "Multijugador: Sí", "Idioma: Español/Inglés"] },
    { id: 6, name: "The Last of Us Part II", price: 49.99, image: "img/the-last-of-us.jpg", category: "juegos", description: "Aventura post-apocalíptica con narrativa emocional.", specifications: ["Plataforma: PS4", "Género: Acción/Aventura", "Duración: 20+ horas", "Idioma: Español/Inglés"] },
    { id: 7, name: "PlayStation 5", price: 499.99, image: "img/ps5.png", category: "consolas", description: "Consola de nueva generación de Sony.", specifications: ["CPU: AMD Zen 2", "GPU: 10.28 TFLOPs", "RAM: 16GB GDDR6", "Almacenamiento: 825GB SSD"] },
    { id: 8, name: "Xbox Series X", price: 499.99, image: "img/xbox-series-x.png", category: "consolas", description: "Consola de nueva generación de Microsoft.", specifications: ["CPU: AMD Zen 2", "GPU: 12 TFLOPs", "RAM: 16GB GDDR6", "Almacenamiento: 1TB SSD"] },
    { id: 9, name: "Nintendo Switch OLED", price: 349.99, image: "img/nintendo-switch.png", category: "consolas", description: "Consola híbrida con pantalla OLED.", specifications: ["Pantalla: 7' OLED", "CPU: NVIDIA Tegra", "RAM: 4GB", "Almacenamiento: 64GB"] },
    { id: 10, name: "PlayStation 4", price: 299.99, image: "img/Ps4_vertical.png", category: "consolas", description: "Consola de anterior generación con amplio catálogo.", specifications: ["CPU: AMD Jaguar", "GPU: 1.84 TFLOPs", "RAM: 8GB GDDR5", "Almacenamiento: 500GB"] },
    { id: 11, name: "Headset Gaming RGB", price: 89.99, image: "img/headset.png", category: "accesorios", description: "Audífonos gaming con RGB y micrófono desmontable.", specifications: ["Tipo: Over-ear", "Conectividad: USB/3.5mm", "Iluminación: RGB", "Micrófono: Cancelación de ruido"] },
    { id: 12, name: "Teclado Mecánico Gaming", price: 129.99, image: "img/Teclado_Mecánico_Gaming.png", category: "accesorios", description: "Teclado con switches mecánicos y RGB.", specifications: ["Switches: Cherry MX", "Conectividad: USB", "Layout: QWERTY", "Iluminación: RGB"] },
    { id: 13, name: "Mouse Gaming RGB", price: 79.99, image: "img/Mouse_Gaming_RGB.png", category: "accesorios", description: "Mouse ergonómico con DPI ajustable.", specifications: ["Sensor: Óptico", "DPI: 200-16000", "Botones: 6", "Iluminación: RGB"] },
    { id: 14, name: "Monitor Gaming 144Hz", price: 299.99, image: "img/Monitor_Gaming_144Hz.png", category: "accesorios", description: "Monitor de 144Hz con tiempo de respuesta 1ms.", specifications: ["Tamaño: 27'", "Resolución: 2560x1440", "Frecuencia: 144Hz", "Tecnología: G-Sync"] },
    { id: 15, name: "Silla Gaming Ergonómica", price: 249.99, image: "img/Silla_Gaming_Ergonómica.png", category: "accesorios", description: "Silla gaming ajustable con soporte lumbar.", specifications: ["Material: PU", "Peso max: 150kg", "Inclinación: 180°", "Garantía: 2 años"] }
];

async function fetchProductos() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (!response.ok) throw new Error('No se pudo obtener productos');
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return data;
        return LOCAL_PRODUCTS;
    } catch (err) {
        console.warn('API no disponible, usando datos locales', err);
        return LOCAL_PRODUCTS;
    }
}

async function fetchProductoById(id) {
    try {
        const response = await fetch(`${API_BASE}/products/${id}`);
        if (!response.ok) throw new Error('Producto no encontrado');
        const data = await response.json();
        if (data) return data;
        throw new Error('Producto no encontrado en API');
    } catch (err) {
        console.warn('Error API, usando datos locales', err);
        return LOCAL_PRODUCTS.find(p => p.id === Number(id)) || null;
    }
}

async function cargarProductosCatalogo() {
    const contenedor = document.getElementById('productos-container');
    if (!contenedor) return;

    let productos = await fetchProductos();
    if (!productos.length) {
        // Si no hay datos de API mantenemos la versión estática que ya estaba en DOM
        productos = Array.from(document.querySelectorAll('.tarjeta-producto')).map(tarjeta => ({
            id: Number(tarjeta.dataset.id),
            name: tarjeta.querySelector('h4').textContent,
            price: parseFloat(tarjeta.querySelector('.precio').textContent.replace('$', '')),
            image: tarjeta.querySelector('img').src,
            category: tarjeta.dataset.categoria
        }));
    }

    const filtros = document.querySelectorAll('.filtros button');
    const busqueda = document.getElementById('busqueda');
    const botonBusqueda = document.querySelector('.barra-busqueda i');
    const paginacion = document.querySelector('.paginacion');
    const productosPorPagina = 6;
    let categoriaActual = 'todos';
    let terminoBusqueda = '';
    let paginaActual = 1;

    const params = new URLSearchParams(window.location.search);
    const categoriaInicial = params.get('categoria');
    const categoriasValidas = ['todos', 'juegos', 'consolas', 'accesorios'];
    if (categoriaInicial && categoriasValidas.includes(categoriaInicial)) {
        categoriaActual = categoriaInicial;
    }

    const renderizarProductos = () => {
        let visibles = productos;

        if (categoriaActual !== 'todos') {
            visibles = visibles.filter(p => p.category === categoriaActual || p.categoria === categoriaActual);
        }

        if (terminoBusqueda.trim()) {
            visibles = visibles.filter(p => (p.name || p.nombre).toLowerCase().includes(terminoBusqueda.toLowerCase()));
        }

        const paginaSize = (categoriaActual === 'todos' && !terminoBusqueda.trim()) ? visibles.length : productosPorPagina;
        const totalPaginas = Math.max(1, Math.ceil(visibles.length / paginaSize));
        const inicio = (paginaActual - 1) * paginaSize;
        const fin = inicio + paginaSize;
        const paginaProductos = visibles.slice(inicio, fin);

        const html = paginaProductos.map(p => {
            const name = p.name || p.nombre;
            const price = p.price || p.precio;
            const image = p.image || p.imagen;
            const id = p.id;
            const category = p.category || p.categoria;

            return `
                <div class="tarjeta tarjeta-producto" data-categoria="${category}" data-id="${id}">
                    <button class="btn-wishlist" onclick="toggleWishlist(${id})"><i class="${estaEnWishlist(id) ? 'fas' : 'far'} fa-heart"></i></button>
                    <img src="${image}" alt="${name}" onerror="this.onerror=null;this.src='img/placeholder.svg'">
                    <h4>${name}</h4>
                    <p class="precio">${formatearPrecioCOP(price)}</p>
                    <div class="botones-producto">
                        <a href="producto-detalle.html?id=${id}" class="boton boton-gradiente-claro">Ver Detalles</a>
                        <button onclick="agregarAlCarrito(${id})" class="boton boton-gradiente">Añadir al Carrito</button>
                    </div>
                </div>
            `;
        }).join('');

        contenedor.classList.add('fade-out');
        setTimeout(() => {
            contenedor.innerHTML = html;
            contenedor.classList.remove('fade-out');
            contenedor.classList.add('fade-in');
            setTimeout(() => contenedor.classList.remove('fade-in'), 250);

            // Paginación visual
            paginacion.innerHTML = '';
            for (let i = 1; i <= totalPaginas; i++) {
                const btn = document.createElement('button');
                btn.className = 'pagina-btn' + (i === paginaActual ? ' pagina-activa' : '');
                btn.textContent = i;
                btn.dataset.pagina = i;
                btn.addEventListener('click', () => {
                    paginaActual = i;
                    renderizarProductos();
                });
                paginacion.appendChild(btn);
            }

            document.querySelectorAll('.boton-carrito').forEach(btn => btn.addEventListener('click', (ev) => {
                ev.preventDefault();
                window.carrito?.mostrarModal();
            }));
        }, 250);
    };

    filtros.forEach(filtro => {
        filtro.addEventListener('click', function() {
            filtros.forEach(btn => btn.classList.remove('filtro-activo'));
            this.classList.add('filtro-activo');
            categoriaActual = this.dataset.categoria;
            paginaActual = 1;

            if (categoriaActual === 'todos') {
                terminoBusqueda = '';
                if (busqueda) {
                    busqueda.value = '';
                }
            }

            renderizarProductos();
        });
    });

    filtros.forEach(btn => {
        btn.classList.toggle('filtro-activo', btn.dataset.categoria === categoriaActual);
    });

    if (busqueda) {
        busqueda.addEventListener('input', function() {
            terminoBusqueda = this.value;
            paginaActual = 1;
            renderizarProductos();
        });
    }

    if (botonBusqueda) {
        botonBusqueda.addEventListener('click', () => {
            terminoBusqueda = busqueda?.value || '';
            paginaActual = 1;
            renderizarProductos();
        });
    }

    // Renderizar productos inmediatamente al cargar la página
    renderizarProductos();
}

async function cargarDetalleProducto() {
    const agregarBtn = document.getElementById('agregar-carrito');
    const comprarBtn = document.getElementById('comprar-ahora');
    const containerRelated = document.getElementById('productos-relacionados');

    if (!agregarBtn && !comprarBtn && !containerRelated) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const productoId = Number(params.get('id'));
    if (!productoId) {
        return;
    }

    const producto = await fetchProductoById(productoId);
    if (!producto) {
        return;
    }

    const nombreProducto = producto.name || producto.nombre;
    const precioProducto = producto.price || producto.precio;
    const imagenProducto = producto.image || producto.imagen;
    const descripcionProducto = producto.description || producto.descripcion;
    const especificaciones = producto.specifications || producto.especificaciones || [];

    const tituloElemento = document.getElementById('titulo-producto');
    const precioElemento = document.getElementById('precio-producto');
    const imagenElemento = document.getElementById('imagen-producto');
    const descripcionElemento = document.getElementById('descripcion-producto');
    const listaEspecificaciones = document.getElementById('lista-especificaciones');

    if (tituloElemento) tituloElemento.textContent = nombreProducto || 'Producto';
    if (precioElemento) precioElemento.textContent = precioProducto ? formatearPrecioCOP(precioProducto) : '';
    if (imagenElemento) {
        imagenElemento.src = imagenProducto || 'img/placeholder.svg';
        imagenElemento.alt = nombreProducto || 'Producto';
    }
    if (descripcionElemento) descripcionElemento.textContent = descripcionProducto || '';
    if (listaEspecificaciones) {
        listaEspecificaciones.innerHTML = '';
        especificaciones.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            listaEspecificaciones.appendChild(li);
        });
    }

    if (agregarBtn) {
        agregarBtn.addEventListener('click', async () => {
            const cantidad = Number(document.getElementById('cantidad')?.value || 1);
            await window.carrito?.agregarProducto(producto, cantidad);
        });
    }

    if (comprarBtn) {
        comprarBtn.addEventListener('click', async () => {
            const cantidad = Number(document.getElementById('cantidad')?.value || 1);
            await window.carrito?.agregarProducto(producto, cantidad);
            setTimeout(() => window.carrito?.mostrarModal(), 250);
        });
    }

    if (containerRelated) {
        const allProducts = await fetchProductos();
        const relatedItems = allProducts
            .filter(p => (p.category === producto.category || p.categoria === producto.categoria) && p.id !== productoId)
            .slice(0, 4);

        containerRelated.innerHTML = relatedItems.map(p => {
            const name = p.name || p.nombre;
            const price = p.price || p.precio;
            const image = p.image || p.imagen;
            return `
                <div class="tarjeta tarjeta-producto">
                    <img src="${image}" alt="${name}" onerror="this.onerror=null;this.src='img/placeholder.svg'">
                    <h4>${name}</h4>
                    <p class="precio">${formatearPrecioCOP(price)}</p>
                    <a href="producto-detalle.html?id=${p.id}" class="boton boton-gradiente-claro">Ver Detalles</a>
                </div>
            `;
        }).join('');
    }
}

async function agregarAlCarrito(productId) {
    const id = Number(productId);
    if (isNaN(id)) return;
    await window.carrito?.agregarProducto(id, 1);
}

window.agregarAlCarrito = agregarAlCarrito;

async function inicializarPaginaApi() {
    await cargarProductosCatalogo();
    await cargarDetalleProducto();
    if (typeof actualizarContadorWishlist === 'function') {
        actualizarContadorWishlist();
    }
}
