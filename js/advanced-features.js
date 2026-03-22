// advanced-features.js - Funcionalidades avanzadas del sitio

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar sistema de reseñas
    inicializarSistemaResenas();

    // Inicializar wishlist
    inicializarWishlist();

    // Inicializar integración con redes sociales
    inicializarRedesSociales();

    // Inicializar newsletter
    inicializarNewsletter();
});

// ===== SISTEMA DE RESEÑAS Y CALIFICACIONES =====
function inicializarSistemaResenas() {
    // Solo ejecutar en páginas de detalle de producto
    if (!document.querySelector('.detalle-producto')) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        cargarResenasProducto(productId);
        inicializarFormularioResena(productId);
    }
}

function cargarResenasProducto(productId) {
    // Cargar reseñas desde localStorage (en producción sería desde API)
    const resenas = obtenerResenasProducto(productId);
    mostrarResenas(resenas);
    actualizarRatingPromedio(resenas);
}

function obtenerResenasProducto(productId) {
    const todasResenas = JSON.parse(localStorage.getItem('resenas') || '{}');
    return todasResenas[productId] || [];
}

function mostrarResenas(resenas) {
    const contenedorResenas = document.querySelector('.resenas-container');
    if (!contenedorResenas) return;

    if (resenas.length === 0) {
        contenedorResenas.innerHTML = `
            <div class="sin-resenas">
                <i class="fas fa-comments"></i>
                <h3>Sé el primero en opinar</h3>
                <p>Comparte tu experiencia con este producto</p>
            </div>
        `;
        return;
    }

    contenedorResenas.innerHTML = resenas.map(resena => `
        <div class="resena-item">
            <div class="resena-header">
                <div class="resena-autor">
                    <div class="avatar-placeholder">${resena.nombre.charAt(0).toUpperCase()}</div>
                    <div>
                        <h4>${resena.nombre}</h4>
                        <div class="resena-rating">
                            ${generarEstrellas(resena.rating)}
                        </div>
                    </div>
                </div>
                <div class="resena-fecha">${formatearFecha(resena.fecha)}</div>
            </div>
            <div class="resena-contenido">
                <h5>${resena.titulo}</h5>
                <p>${resena.comentario}</p>
                ${resena.recomienda ? '<span class="recomendacion"><i class="fas fa-thumbs-up"></i> Recomienda este producto</span>' : ''}
            </div>
            <div class="resena-util">
                <button class="btn-util" onclick="marcarUtil(this)">
                    <i class="fas fa-thumbs-up"></i> Útil (${resena.util || 0})
                </button>
            </div>
        </div>
    `).join('');
}

function actualizarRatingPromedio(resenas) {
    if (resenas.length === 0) return;

    const promedio = resenas.reduce((sum, resena) => sum + resena.rating, 0) / resenas.length;
    const contenedorRating = document.querySelector('.rating');

    if (contenedorRating) {
        contenedorRating.innerHTML = generarEstrellas(Math.round(promedio));
        const spanRating = contenedorRating.querySelector('span');
        if (spanRating) {
            spanRating.textContent = `${promedio.toFixed(1)} (${resenas.length} reseñas)`;
        }
    }
}

function inicializarFormularioResena(productId) {
    const formResena = document.getElementById('form-resena');
    if (!formResena) return;

    // Sistema de rating interactivo
    const estrellas = formResena.querySelectorAll('.rating-input i');
    let ratingSeleccionado = 0;

    estrellas.forEach((estrella, index) => {
        estrella.addEventListener('click', () => {
            ratingSeleccionado = index + 1;
            actualizarEstrellasSeleccionadas(estrellas, ratingSeleccionado);
        });

        estrella.addEventListener('mouseover', () => {
            actualizarEstrellasSeleccionadas(estrellas, index + 1);
        });

        estrella.addEventListener('mouseout', () => {
            actualizarEstrellasSeleccionadas(estrellas, ratingSeleccionado);
        });
    });

    // Enviar reseña
    formResena.addEventListener('submit', function(e) {
        e.preventDefault();

        if (ratingSeleccionado === 0) {
            mostrarNotificacion('Por favor selecciona una calificación', 'error');
            return;
        }

        const nuevaResena = {
            id: Date.now(),
            nombre: this.nombre.value,
            titulo: this.titulo.value,
            comentario: this.comentario.value,
            rating: ratingSeleccionado,
            recomienda: this.recomienda.checked,
            fecha: new Date().toISOString(),
            util: 0
        };

        guardarResena(productId, nuevaResena);
        mostrarNotificacion('¡Reseña publicada exitosamente!', 'success');

        // Limpiar formulario
        this.reset();
        ratingSeleccionado = 0;
        actualizarEstrellasSeleccionadas(estrellas, 0);

        // Recargar reseñas
        cargarResenasProducto(productId);
    });
}

function guardarResena(productId, resena) {
    const todasResenas = JSON.parse(localStorage.getItem('resenas') || '{}');
    if (!todasResenas[productId]) {
        todasResenas[productId] = [];
    }
    todasResenas[productId].unshift(resena); // Agregar al inicio
    localStorage.setItem('resenas', JSON.stringify(todasResenas));
}

function actualizarEstrellasSeleccionadas(estrellas, rating) {
    estrellas.forEach((estrella, index) => {
        if (index < rating) {
            estrella.className = 'fas fa-star';
        } else {
            estrella.className = 'far fa-star';
        }
    });
}

function generarEstrellas(rating) {
    let estrellas = '';
    for (let i = 1; i <= 5; i++) {
        estrellas += `<i class="${i <= rating ? 'fas' : 'far'} fa-star"></i>`;
    }
    return estrellas;
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function marcarUtil(boton) {
    const count = parseInt(boton.textContent.match(/\d+/)[0]) + 1;
    boton.innerHTML = `<i class="fas fa-thumbs-up"></i> Útil (${count})`;
    boton.disabled = true;
    boton.classList.add('marcado-util');
}

// ===== SISTEMA DE WISHLIST =====
function inicializarWishlist() {
    actualizarContadorWishlist();
    agregarBotonesWishlist();
}

function agregarBotonesWishlist() {
    // Agregar botones a tarjetas de productos
    const tarjetasProducto = document.querySelectorAll('.tarjeta-producto');
    tarjetasProducto.forEach(tarjeta => {
        const productId = tarjeta.dataset.id;
        if (!productId) return;

        const wishlistBtn = document.createElement('button');
        wishlistBtn.className = 'btn-wishlist';
        wishlistBtn.setAttribute('aria-label', 'Agregar a wishlist');
        wishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
        wishlistBtn.onclick = () => toggleWishlist(productId);

        // Verificar si ya está en wishlist
        if (estaEnWishlist(productId)) {
            wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
            wishlistBtn.classList.add('active');
        }

        tarjeta.appendChild(wishlistBtn);
    });
}

function toggleWishlist(productId) {
    const wishlist = obtenerWishlist();
    const index = wishlist.indexOf(productId);

    if (index > -1) {
        wishlist.splice(index, 1);
        mostrarNotificacion('Producto removido de wishlist', 'info');
    } else {
        wishlist.push(productId);
        mostrarNotificacion('Producto agregado a wishlist', 'success');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    actualizarContadorWishlist();
    actualizarBotonesWishlist();
}

function estaEnWishlist(productId) {
    const wishlist = obtenerWishlist();
    return wishlist.includes(productId);
}

function obtenerWishlist() {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
}

function actualizarContadorWishlist() {
    const wishlist = obtenerWishlist();
    const contador = document.querySelector('.contador-wishlist');

    if (contador) {
        contador.textContent = wishlist.length;
        contador.style.display = wishlist.length > 0 ? 'inline' : 'none';
    }
}

function actualizarBotonesWishlist() {
    const botones = document.querySelectorAll('.btn-wishlist');
    botones.forEach(boton => {
        const tarjeta = boton.closest('.tarjeta-producto');
        const productId = tarjeta?.dataset.id;
        if (productId) {
            const enWishlist = estaEnWishlist(productId);
            boton.innerHTML = `<i class="fa${enWishlist ? 's' : 'r'} fa-heart"></i>`;
            boton.classList.toggle('active', enWishlist);
        }
    });
}

// ===== INTEGRACIÓN CON REDES SOCIALES =====
function inicializarRedesSociales() {
    // Compartir en redes sociales
    const botonesCompartir = document.querySelectorAll('.btn-compartir');
    botonesCompartir.forEach(boton => {
        boton.addEventListener('click', function() {
            const red = this.dataset.red;
            const url = encodeURIComponent(window.location.href);
            const titulo = encodeURIComponent(document.title);
            const texto = encodeURIComponent('¡Mira este producto increíble que encontré en El Enemigos!');

            let urlCompartir = '';

            switch(red) {
                case 'facebook':
                    urlCompartir = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'twitter':
                    urlCompartir = `https://twitter.com/intent/tweet?url=${url}&text=${texto}`;
                    break;
                case 'whatsapp':
                    urlCompartir = `https://wa.me/?text=${texto}%20${url}`;
                    break;
                case 'telegram':
                    urlCompartir = `https://t.me/share/url?url=${url}&text=${texto}`;
                    break;
            }

            if (urlCompartir) {
                window.open(urlCompartir, '_blank', 'width=600,height=400');
            }
        });
    });

    // Login social (simulado)
    const botonesLogin = document.querySelectorAll('.btn-login-social');
    botonesLogin.forEach(boton => {
        boton.addEventListener('click', function() {
            const red = this.dataset.red;
            mostrarNotificacion(`Login con ${red} próximamente disponible`, 'info');
        });
    });
}

// ===== NEWSLETTER FUNCIONAL =====
function inicializarNewsletter() {
    const formulariosNewsletter = document.querySelectorAll('.suscripcion-pie form, .newsletter-form');

    formulariosNewsletter.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (!validarEmail(email)) {
                mostrarNotificacion('Por favor ingresa un email válido', 'error');
                return;
            }

            // Simular envío a API
            enviarNewsletter(email)
                .then(() => {
                    mostrarNotificacion('¡Suscripción exitosa! Revisa tu email para confirmar.', 'success');
                    emailInput.value = '';
                })
                .catch(() => {
                    mostrarNotificacion('Error al suscribirse. Inténtalo de nuevo.', 'error');
                });
        });
    });
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function enviarNewsletter(email) {
    return new Promise((resolve, reject) => {
        // Simular llamada a API
        setTimeout(() => {
            const suscriptores = JSON.parse(localStorage.getItem('suscriptores') || '[]');

            if (suscriptores.includes(email)) {
                reject(new Error('Email ya suscrito'));
                return;
            }

            suscriptores.push(email);
            localStorage.setItem('suscriptores', JSON.stringify(suscriptores));

            resolve();
        }, 1000);
    });
}

// ===== FUNCIONES AUXILIARES =====
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${mensaje}</span>
        <button class="cerrar-notificacion" onclick="this.parentElement.remove()">&times;</button>
    `;

    // Agregar al DOM
    document.body.appendChild(notificacion);

    // Animar entrada
    setTimeout(() => notificacion.classList.add('mostrar'), 10);

    // Auto-remover
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        setTimeout(() => notificacion.remove(), 300);
    }, 5000);
}

// Función global para acceder desde HTML
window.toggleWishlist = toggleWishlist;