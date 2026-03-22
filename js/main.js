// main.js - Funcionalidades principales del sitio

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

    // Inicializar animaciones de entrada
    inicializarAnimaciones();

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
        formContacto.addEventListener('submit', function(e) {
            e.preventDefault();

            const campos = this.querySelectorAll('input, textarea');
            let valido = true;

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
                mostrarMensajeExito('¡Mensaje enviado exitosamente! Te responderemos pronto.');
                this.reset();
            }
        });
    }
}

// Funciones auxiliares para validación
function mostrarMensajeError(campo, mensaje) {
    ocultarMensajeError(campo);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'mensaje-error';
    errorDiv.textContent = mensaje;

    campo.parentNode.appendChild(errorDiv);
    campo.classList.add('campo-error');

    // Animación de entrada
    errorDiv.style.opacity = '0';
    errorDiv.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        errorDiv.style.transition = 'all 0.3s ease';
        errorDiv.style.opacity = '1';
        errorDiv.style.transform = 'translateY(0)';
    }, 10);
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

// ===== CLASE API =====
const API_BASE = 'http://localhost:3000/api';

async function fetchProductos() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (!response.ok) throw new Error('No se pudo obtener productos');
        return await response.json();
    } catch (err) {
        console.warn('Error API productos, fallback local', err);
        return [];
    }
}

async function fetchProductoById(id) {
    try {
        const response = await fetch(`${API_BASE}/products/${id}`);
        if (!response.ok) throw new Error('Producto no encontrado');
        return await response.json();
    } catch (err) {
        console.warn('Error API producto por id', err);
        return null;
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
    const paginacion = document.querySelector('.paginacion');
    const productosPorPagina = 6;
    let categoriaActual = 'todos';
    let terminoBusqueda = '';
    let paginaActual = 1;

    const renderizarProductos = () => {
        let visibles = productos;

        if (categoriaActual !== 'todos') {
            visibles = visibles.filter(p => p.category === categoriaActual || p.categoria === categoriaActual);
        }

        if (terminoBusqueda.trim()) {
            visibles = visibles.filter(p => (p.name || p.nombre).toLowerCase().includes(terminoBusqueda.toLowerCase()));
        }

        const totalPaginas = Math.ceil(visibles.length / productosPorPagina);
        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;
        const paginaProductos = visibles.slice(inicio, fin);

        contenedor.innerHTML = paginaProductos.map(p => {
            const name = p.name || p.nombre;
            const price = p.price || p.precio;
            const image = p.image || p.imagen;
            const id = p.id;
            const category = p.category || p.categoria;

            return `
                <div class="tarjeta tarjeta-producto" data-categoria="${category}" data-id="${id}">
                    <button class="btn-wishlist" onclick="toggleWishlist(${id})"><i class="${estaEnWishlist(id) ? 'fas' : 'far'} fa-heart"></i></button>
                    <img src="${image}" alt="${name}" onerror="this.src='https://via.placeholder.com/250x250/9370DB/FFFFFF?text=${encodeURIComponent(name)}'">
                    <h4>${name}</h4>
                    <p class="precio">$${price.toFixed(2)}</p>
                    <div class="botones-producto">
                        <a href="producto-detalle.html?id=${id}" class="boton boton-gradiente-claro">Ver Detalles</a>
                        <button onclick="agregarAlCarrito(${id})" class="boton boton-gradiente">Añadir al Carrito</button>
                    </div>
                </div>
            `;
        }).join('');

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
    };

    filtros.forEach(filtro => {
        filtro.addEventListener('click', function() {
            filtros.forEach(btn => btn.classList.remove('filtro-activo'));
            this.classList.add('filtro-activo');
            categoriaActual = this.dataset.categoria;
            paginaActual = 1;
            renderizarProductos();
        });
    });

    busqueda?.addEventListener('input', function() {
        terminoBusqueda = this.value;
        paginaActual = 1;
        renderizarProductos();
    });

    renderizarProductos();
}

async function cargarDetalleProducto() {
    const container = document.querySelector('.detalle-producto');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const productoId = Number(params.get('id'));
    if (!productoId) return;

    const producto = await fetchProductoById(productoId);
    if (!producto) {
        container.innerHTML = '<h1>Producto no encontrado</h1>';
        return;
    }

    document.getElementById('titulo-producto').textContent = producto.name || producto.nombre;
    document.getElementById('precio-producto').textContent = `$${(producto.price || producto.precio).toFixed(2)}`;
    document.getElementById('imagen-producto').src = producto.image || producto.imagen;
    document.getElementById('imagen-producto').alt = producto.name || producto.nombre;
    document.getElementById('descripcion-producto').textContent = producto.description || producto.descripcion;

    const ul = document.getElementById('lista-especificaciones');
    ul.innerHTML = '';
    if (producto.specifications || producto.especificaciones) {
        const esp = producto.specifications || producto.especificaciones;
        esp.forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            ul.appendChild(li);
        });
    }

    document.getElementById('agregar-carrito').addEventListener('click', async () => {
        const cantidad = Number(document.getElementById('cantidad').value);
        await window.carrito?.agregarProducto(producto, cantidad);
    });

    document.getElementById('comprar-ahora').addEventListener('click', async () => {
        const cantidad = Number(document.getElementById('cantidad').value);
        await window.carrito?.agregarProducto(producto, cantidad);
        setTimeout(() => window.carrito?.mostrarModal(), 250);
    });

    // Cargar relacionados
    const allProducts = await fetchProductos();
    const relatedItems = allProducts.filter(p => (p.category === producto.category || p.categoria === producto.categoria) && p.id !== productoId).slice(0, 4);
    const containerRelated = document.getElementById('productos-relacionados');
    containerRelated.innerHTML = relatedItems.map(p => {
        const name = p.name || p.nombre;
        const price = p.price || p.precio;
        const image = p.image || p.imagen;
        return `
            <div class="tarjeta tarjeta-producto">
                <img src="${image}" alt="${name}" onerror="this.src='https://via.placeholder.com/250x250/9370DB/FFFFFF?text=${encodeURIComponent(name)}'">
                <h4>${name}</h4>
                <p class="precio">$${price.toFixed(2)}</p>
                <a href="producto-detalle.html?id=${p.id}" class="boton boton-gradiente-claro">Ver Detalles</a>
            </div>
        `;
    }).join('');
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
    actualizarContadorWishlist();
}
