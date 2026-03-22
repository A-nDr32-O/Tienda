// Sistema de Carrito de Compras
class Carrito {
    constructor() {
        this.items = this.cargarCarrito();
        this.actualizarContador();
        this.crearModalCarrito();
        this.inicializarEventos();
    }

    // Cargar carrito desde localStorage
    cargarCarrito() {
        const carrito = localStorage.getItem('carrito');
        return carrito ? JSON.parse(carrito) : [];
    }

    // Guardar carrito en localStorage
    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.items));
        this.actualizarContador();
    }

    // Agregar producto al carrito
    async agregarProducto(productoRef, cantidad = 1) {
        let producto;

        if (typeof productoRef === 'number') {
            const productoExistente = this.items.find(item => item.id === productoRef);
            if (productoExistente) {
                productoExistente.cantidad += cantidad;
                this.guardarCarrito();
                this.mostrarNotificacion('Producto agregado al carrito');
                return;
            }

            producto = await this.obtenerProductoPorId(productoRef);
        } else if (typeof productoRef === 'object' && productoRef !== null) {
            producto = productoRef;
        }

        if (!producto) {
            this.mostrarNotificacion('No se encontró el producto', 'error');
            return;
        }

        const productoExistente = this.items.find(item => item.id === producto.id);
        if (productoExistente) {
            productoExistente.cantidad += cantidad;
        } else {
            this.items.push({
                id: producto.id,
                nombre: producto.name || producto.nombre,
                precio: producto.price || producto.precio,
                imagen: producto.image || producto.imagen,
                cantidad: cantidad
            });
        }

        this.guardarCarrito();
        this.mostrarNotificacion('Producto agregado al carrito');
    }

    // Obtener producto por ID (llamada a API o fallback)
    async obtenerProductoPorId(id) {
        try {
            const response = await fetch('http://localhost:3000/api/products/' + id);
            if (!response.ok) {
                // fallback local
                return this.obtenerProductoLocalPorId(id);
            }
            return await response.json();
        } catch (error) {
            return this.obtenerProductoLocalPorId(id);
        }
    }

    obtenerProductoLocalPorId(id) {
        const productos = [
            { id: 1, nombre: "Apex Legends: Deluxe Edition", precio: 59.99, imagen: "img/apex.jpg" },
            { id: 2, nombre: "Death Stranding: Deluxe Edition", precio: 49.99, imagen: "img/death stranding.png" },
            { id: 3, nombre: "Cyberpunk 2077", precio: 39.99, imagen: "img/apex.jpg" },
            { id: 4, nombre: "FIFA 24", precio: 69.99, imagen: "img/apex.jpg" },
            { id: 5, nombre: "Grand Theft Auto V", precio: 29.99, imagen: "img/apex.jpg" },
            { id: 6, nombre: "The Last of Us Part II", precio: 49.99, imagen: "img/death stranding.png" },
            { id: 7, nombre: "PlayStation 5", precio: 499.99, imagen: "img/ps5 vertical.png" },
            { id: 8, nombre: "Xbox Series X", precio: 499.99, imagen: "img/ps5.png" },
            { id: 9, nombre: "Nintendo Switch OLED", precio: 349.99, imagen: "img/ps5.png" },
            { id: 10, nombre: "PlayStation 4", precio: 299.99, imagen: "img/ps5 vertical.png" },
            { id: 11, nombre: "Headset Gaming RGB", precio: 89.99, imagen: "img/headset.png" },
            { id: 12, nombre: "Teclado Mecánico Gaming", precio: 129.99, imagen: "img/headset.png" },
            { id: 13, nombre: "Mouse Gaming RGB", precio: 79.99, imagen: "img/headset.png" },
            { id: 14, nombre: "Monitor Gaming 144Hz", precio: 299.99, imagen: "img/headset.png" },
            { id: 15, nombre: "Silla Gaming Ergonómica", precio: 249.99, imagen: "img/headset.png" }
        ];

        return productos.find(p => p.id === id);
    }

    // Eliminar producto del carrito
    eliminarProducto(productoId) {
        this.items = this.items.filter(item => item.id !== productoId);
        this.guardarCarrito();
        this.actualizarModalCarrito();
        this.mostrarNotificacion('Producto eliminado del carrito');
    }

    // Actualizar cantidad de producto
    actualizarCantidad(productoId, nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            this.eliminarProducto(productoId);
            return;
        }

        const producto = this.items.find(item => item.id === productoId);
        if (producto) {
            producto.cantidad = nuevaCantidad;
            this.guardarCarrito();
            this.actualizarModalCarrito();
        }
    }

    // Calcular total del carrito
    calcularTotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }

    // Calcular total con descuento (si aplica)
    calcularTotalConDescuento() {
        const subtotal = this.calcularTotal();
        let descuento = 0;

        // Aplicar descuento del 10% si hay más de 3 productos
        if (this.items.length > 3) {
            descuento = subtotal * 0.1;
        }

        // Aplicar descuento del 5% si el total supera $200
        if (subtotal > 200) {
            descuento = Math.max(descuento, subtotal * 0.05);
        }

        return {
            subtotal: subtotal,
            descuento: descuento,
            total: subtotal - descuento
        };
    }

    // Actualizar contador del carrito en el header
    actualizarContador() {
        const contador = document.querySelector('.boton-carrito');
        if (contador) {
            const totalItems = this.items.reduce((total, item) => total + item.cantidad, 0);
            contador.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> ${totalItems} Items`;
        }
    }

    // Crear modal del carrito
    crearModalCarrito() {
        const modal = document.createElement('div');
        modal.id = 'modal-carrito';
        modal.className = 'modal-carrito';
        modal.innerHTML = `
            <div class="modal-contenido">
                <div class="modal-header">
                    <h2>Tu Carrito de Compras</h2>
                    <span class="cerrar-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div id="carrito-vacio" class="carrito-vacio">
                        <i class="fa-solid fa-cart-shopping"></i>
                        <p>Tu carrito está vacío</p>
                        <a href="productos.html" class="boton boton-gradiente">Ir a Productos</a>
                    </div>
                    <div id="carrito-items" class="carrito-items" style="display: none;">
                        <!-- Los items se cargarán dinámicamente -->
                    </div>
                </div>
                <div class="modal-footer" id="carrito-footer" style="display: none;">
                    <div class="carrito-totales">
                        <div class="total-item">
                            <span>Subtotal:</span>
                            <span id="subtotal">$0.00</span>
                        </div>
                        <div class="total-item descuento" id="descuento-item" style="display: none;">
                            <span>Descuento:</span>
                            <span id="descuento">-$0.00</span>
                        </div>
                        <div class="total-item total-final">
                            <span>Total:</span>
                            <span id="total-final">$0.00</span>
                        </div>
                    </div>
                    <div class="carrito-acciones">
                        <button class="boton boton-gradiente-claro" id="vaciar-carrito">Vaciar Carrito</button>
                        <button class="boton boton-gradiente" id="proceder-compra">Proceder al Pago</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Actualizar contenido del modal
    actualizarModalCarrito() {
        const carritoVacio = document.getElementById('carrito-vacio');
        const carritoItems = document.getElementById('carrito-items');
        const carritoFooter = document.getElementById('carrito-footer');

        if (this.items.length === 0) {
            carritoVacio.style.display = 'block';
            carritoItems.style.display = 'none';
            carritoFooter.style.display = 'none';
            return;
        }

        carritoVacio.style.display = 'none';
        carritoItems.style.display = 'block';
        carritoFooter.style.display = 'block';

        // Generar HTML de los items
        carritoItems.innerHTML = this.items.map(item => `
            <div class="carrito-item" data-id="${item.id}">
                <img src="${item.imagen}" alt="${item.nombre}">
                <div class="item-info">
                    <h4>${item.nombre}</h4>
                    <p class="item-precio">$${item.precio.toFixed(2)}</p>
                </div>
                <div class="item-cantidad">
                    <button class="cantidad-btn disminuir">-</button>
                    <input type="number" value="${item.cantidad}" min="1" max="10" class="cantidad-input">
                    <button class="cantidad-btn aumentar">+</button>
                </div>
                <div class="item-subtotal">
                    <p>$${(item.precio * item.cantidad).toFixed(2)}</p>
                </div>
                <button class="eliminar-item">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Actualizar totales
        const totales = this.calcularTotalConDescuento();
        document.getElementById('subtotal').textContent = `$${totales.subtotal.toFixed(2)}`;

        const descuentoItem = document.getElementById('descuento-item');
        const descuentoSpan = document.getElementById('descuento');

        if (totales.descuento > 0) {
            descuentoItem.style.display = 'flex';
            descuentoSpan.textContent = `-$${totales.descuento.toFixed(2)}`;
        } else {
            descuentoItem.style.display = 'none';
        }

        document.getElementById('total-final').textContent = `$${totales.total.toFixed(2)}`;

        // Agregar event listeners a los botones de cantidad y eliminar
        this.agregarEventosCarrito();
    }

    // Agregar eventos a los elementos del carrito
    agregarEventosCarrito() {
        // Botones de eliminar
        document.querySelectorAll('.eliminar-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.carrito-item');
                const productoId = parseInt(item.dataset.id);
                this.eliminarProducto(productoId);
            });
        });

        // Botones de cantidad
        document.querySelectorAll('.disminuir').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.carrito-item');
                const input = item.querySelector('.cantidad-input');
                const nuevaCantidad = parseInt(input.value) - 1;
                input.value = nuevaCantidad;
                const productoId = parseInt(item.dataset.id);
                this.actualizarCantidad(productoId, nuevaCantidad);
            });
        });

        document.querySelectorAll('.aumentar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.carrito-item');
                const input = item.querySelector('.cantidad-input');
                const nuevaCantidad = parseInt(input.value) + 1;
                input.value = nuevaCantidad;
                const productoId = parseInt(item.dataset.id);
                this.actualizarCantidad(productoId, nuevaCantidad);
            });
        });

        // Inputs de cantidad
        document.querySelectorAll('.cantidad-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const item = e.target.closest('.carrito-item');
                const nuevaCantidad = parseInt(e.target.value);
                const productoId = parseInt(item.dataset.id);
                this.actualizarCantidad(productoId, nuevaCantidad);
            });
        });
    }

    // Inicializar eventos
    inicializarEventos() {
        // Evento para abrir el modal del carrito
        const botonCarrito = document.querySelector('.boton-carrito');
        if (botonCarrito) {
            botonCarrito.addEventListener('click', (e) => {
                e.preventDefault();
                this.mostrarModal();
            });
        }

        // Evento para cerrar el modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-carrito') || e.target.classList.contains('cerrar-modal')) {
                this.ocultarModal();
            }
        });

        // Evento para vaciar carrito
        document.getElementById('vaciar-carrito')?.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                this.items = [];
                this.guardarCarrito();
                this.actualizarModalCarrito();
                this.mostrarNotificacion('Carrito vaciado');
            }
        });

        // Evento para proceder al pago
        document.getElementById('proceder-compra')?.addEventListener('click', () => {
            alert('Funcionalidad de pago próximamente disponible');
        });
    }

    // Mostrar modal
    mostrarModal() {
        const modal = document.getElementById('modal-carrito');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.actualizarModalCarrito();
    }

    // Ocultar modal
    ocultarModal() {
        const modal = document.getElementById('modal-carrito');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Mostrar notificación
    mostrarNotificacion(mensaje) {
        // Crear elemento de notificación
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion';
        notificacion.textContent = mensaje;

        document.body.appendChild(notificacion);

        // Mostrar notificación
        setTimeout(() => notificacion.classList.add('mostrar'), 100);

        // Ocultar y eliminar notificación
        setTimeout(() => {
            notificacion.classList.remove('mostrar');
            setTimeout(() => document.body.removeChild(notificacion), 300);
        }, 3000);
    }
}

// Inicializar carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.carrito = new Carrito();
});

// Función global para agregar productos al carrito (desde botones)
function agregarAlCarrito(productoId, cantidad = 1) {
    if (window.carrito) {
        window.carrito.agregarProducto(productoId, cantidad);
    }
}