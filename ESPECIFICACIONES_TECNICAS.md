# Especificaciones técnicas de la página

Este documento describe los archivos principales del frontend y las funciones técnicas que usa cada uno.

## Archivos HTML principales

### `index.html`
- Página de inicio de la tienda.
- Estructura:
  - Encabezado con navegación, wishlist y acceso a usuario/carrito.
  - Sección hero con banner principal y botón a `productos.html`.
  - Tarjetas de categorías: Juegos, Consolas y Accesorios.
  - Productos destacados con enlaces a `producto-detalle.html?id=...`.
  - Pie de página con enlaces rápidos, suscripción y redes sociales.
- Scripts incluidos:
  - `js/carrito.js`
  - `js/main.js`
  - `js/advanced-features.js`
- Funciones activas:
  - Carrusel de productos destacados.
  - Menú móvil accesible.
  - Notificaciones.
  - Animaciones de entrada.

### `productos.html`
- Página de catálogo de productos.
- Estructura:
  - Filtros por categoría: Todos, Juegos, Consolas, Accesorios.
  - Barra de búsqueda de productos.
  - Grid de cartas de producto con botón "Ver Detalles" y "Añadir al Carrito".
  - Sección opcional de acceso al panel de admin si el usuario es administrador.
- Scripts incluidos:
  - `js/carrito.js`
  - `js/main.js`
  - `js/advanced-features.js`
- Funciones activas:
  - Carga dinámica de productos desde API o datos locales.
  - Filtrado y búsqueda en tiempo real.
  - Paginación adaptativa.
  - Wishlist en tarjetas y contador de wishlist.
  - Interacción con el carrito.

### `producto-detalle.html`
- Página de detalle de producto.
- Estructura:
  - Imagen, título, precio, descripción y especificaciones.
  - Controles de cantidad y botones "Añadir al Carrito" / "Comprar Ahora".
  - Sección de reseñas con formulario para enviar opiniones.
  - Productos relacionados.
- Scripts incluidos:
  - `js/carrito.js`
  - `js/main.js`
  - `js/advanced-features.js`
- Funciones activas:
  - Carga del producto por `id` de la query string.
  - Renderizado de especificaciones dinámicas.
  - Gestión de cantidad de compra.
  - Agregar al carrito y abrir modal de carrito.
  - Sistema de reseñas con estrellas y almacenamiento local.
  - Compartir en redes sociales.

### `auth.html`
- Página de autenticación.
- Estructura:
  - Formulario de login y formulario de registro.
  - Mensajes de éxito/error.
  - Enlace para alternar entre formularios.
- Script incluido:
  - `js/auth.js`
- Funciones activas:
  - Login con POST a `http://localhost:3000/api/auth/login`.
  - Registro con POST a `http://localhost:3000/api/auth/register`.
  - Almacenamiento de `token` y `user` en `localStorage`.
  - Verificación de sesión existente con `GET /api/users/me`.
  - Redirección al inicio tras autenticación.

### `wishlist.html`
- Página de wishlist de usuario.
- Estructura:
  - Mensaje de acceso restringido si no hay sesión.
  - Sección de productos favoritos si el usuario está autenticado.
  - Mensaje y enlace si la wishlist está vacía.
- Scripts incluidos:
  - `js/carrito.js`
  - `js/main.js`
  - `js/advanced-features.js`
- Funciones activas:
  - Verificación de autenticación mediante token.
  - Carga de wishlist desde `localStorage`.
  - Renderizado de productos guardados.
  - Botón para agregar desde wishlist al carrito.

### `admin-productos.html`
- Página de panel de administración.
- Estructura:
  - Interfaz de administración con espacio para lista de productos, listado de usuarios y formularios.
  - Botón de logout.
- Scripts incluidos: solo `css/style.css` y estilos internos.
- Funciones activas (esperadas por la lógica general):
  - Control de acceso admin desde `js/main.js`.
  - Gestión de productos y usuarios.

### `nosotros.html`
- Página informativa del equipo y la misión de la tienda.
- Estructura:
  - Sección «Nuestra Historia», misión, valores y testimonios.
  - Galería de imágenes.
- Scripts incluidos:
  - `js/carrito.js`
  - `js/main.js`
  - `js/advanced-features.js`
- Funciones activas:
  - Menú, carrito y navegación.
  - Animaciones de entrada.

### `contacto.html`
- Página de contacto.
- Estructura:
  - Información de contacto y horarios.
  - Formulario de contacto con campos obligatorios.
  - Mapa embebido de ubicación.
- Scripts incluidos:
  - `js/carrito.js`
  - `js/main.js`
  - `js/advanced-features.js`
- Funciones activas:
  - Validación del formulario de contacto.
  - Envío simulado a la API de contacto.

## Archivos JavaScript principales

### `js/main.js`
Funcionalidad principal de la interfaz. Incluye:
- `formatearPrecioCOP(valor)` — formatea valores numéricos a moneda COP.
- `inicializarCarrusel()` — transforma la sección de destacados en carrusel con autoplay, swipe y accesibilidad.
- `inicializarValidacionFormularios()` — valida formularios de suscripción y contacto.
- `mostrarMensajeError(campo, mensaje)` — muestra errores de validación.
- `ocultarMensajeError(campo)` — oculta errores de validación.
- `mostrarMensajeExito(mensaje)` — notificación visual para acciones exitosas.
- `inicializarEfectosBotones()` — agrega efecto ripple y animación a los botones.
- `inicializarMenuMovil()` — controla el menú hamburguesa y su accesibilidad.
- `getToken()` / `getUser()` — lee credenciales de `localStorage`.
- `fadeAndNavigate(url)` — navegación con transición suave.
- `setupAuthLinkTransitions()` — captura enlaces a `auth.html` para animar el cambio de página.
- `logoutAndRedirect()` — cierra sesión y redirige a `auth.html`.
- `inicializarUserMenu()` — crea popup de usuario con edición de perfil y logout.
- `inicializarAdminButton()` — muestra el botón de admin si el usuario es admin.
- `updateUserPopup()` — actualiza datos del popup de usuario.
- `handleUserProfileUpdate(popup)` — envía cambios de perfil a `PUT /api/users/me`.
- `inicializarAnimaciones()` — animaciones de entrada para tarjetas y secciones.
- `verificarCompatibilidadNavegador()` — revisa soporte de Flexbox, Grid, localStorage e IntersectionObserver.
- `fetchProductos()` / `fetchProductoById(id)` — obtiene datos desde API o utiliza datos locales como fallback.
- `cargarProductosCatalogo()` — renderiza catálogo dinámico, filtros, búsqueda y paginación.
- `cargarDetalleProducto()` — carga el producto seleccionado, agrega eventos de carrito y renderiza relacionados.
- `agregarAlCarrito(productId)` — función global para añadir producto al carrito.
- `inicializarPaginaApi()` — ejecuta la carga de catálogo y detalle cuando la página lo requiere.

### `js/carrito.js`
Gestión completa del carrito de compras:
- Clase `Carrito`
  - `cargarCarrito()` — lee carrito desde `localStorage`.
  - `guardarCarrito()` — persiste carrito en `localStorage`.
  - `agregarProducto(productoRef, cantidad)` — agrega o actualiza producto en carrito.
  - `obtenerProductoPorId(id)` — consulta API de producto y usa fallback local.
  - `obtenerProductoLocalPorId(id)` — datos locales cuando la API no responde.
  - `eliminarProducto(productoId)` — elimina item.
  - `actualizarCantidad(productoId, nuevaCantidad)` — cambia cantidad y recalcula.
  - `calcularTotal()` — subtotal del carrito.
  - `calcularTotalConDescuento()` — aplica descuentos condicionales.
  - `actualizarContador()` — actualiza el contador de items en la cabecera.
  - `crearModalCarrito()` — genera el modal HTML del carrito.
  - `actualizarModalCarrito()` — actualiza vista del modal.
  - `agregarEventosCarrito()` — agrega eventos de cantidad y eliminación.
  - `inicializarEventos()` — abre/cierra modal, vaciar carrito y proceder a pago.
  - `mostrarModal()` / `ocultarModal()` — controla visibilidad del modal.
  - `mostrarNotificacion(mensaje)` — notificaciones básicas.
- `window.carrito = new Carrito()` — instancia global al cargar.
- `agregarAlCarrito(productoId, cantidad = 1)` — función global compatible con botones inline.

### `js/auth.js`
Manejo de autenticación:
- `handleLogin(e)` — envía login y guarda `token` + `user`.
- `handleRegister(e)` — registra usuario y guarda credenciales.
- `toggleForms()` — alterna entre login y registro.
- `fadeAndNavigate(url)` — redirección animada.
- `logout()` — elimina token y usuario.
- `getToken()` / `getUser()` — helper `localStorage`.
- `requireAuth()` / `requireAdmin()` — control de acceso para páginas protegidas.
- `DOMContentLoaded` — detecta tab de registro y valida sesión activa.

### `js/advanced-features.js`
Funciones adicionales del sitio:
- `inicializarSistemaResenas()` — activa reseñas solo en detalle de producto.
- `cargarResenasProducto(productId)` — lee reseñas de `localStorage`.
- `mostrarResenas(resenas, productId)` — renderiza reseñas con UI.
- `actualizarRatingPromedio(resenas)` — muestra rating promedio.
- `inicializarFormularioResena(productId)` — controla el formulario de reseña.
- `guardarResena(productId, resena)` — guarda reseña en `localStorage`.
- `esAdmin()` — chequea rol admin en `localStorage`.
- `eliminarResena(productId, reviewId)` — elimina reseña si es admin.
- `actualizarEstrellasSeleccionadas(estrellas, rating)` — UI de estrellas.
- `generarEstrellas(rating)` — produce HTML de estrellas.
- `formatearFecha(fechaISO)` — formato de fecha a español.
- `marcarUtil(boton)` — aumenta contador de "útil".
- `inicializarWishlist()` — carga wishlist y botones.
- `agregarBotonesWishlist()` — agrega botón de wishlist a tarjetas.
- `toggleWishlist(productId)` — añade/remueve producto de wishlist, requiere login.
- `estaEnWishlist(productId)` / `obtenerWishlist()` — helpers de wishlist.
- `actualizarContadorWishlist()` — actualiza el contador visual.
- `actualizarBotonesWishlist()` — actualiza iconos en tarjetas.
- `cargarWishlist()` — renderiza wishlist en `wishlist.html`.
- `inicializarRedesSociales()` — comparte en Facebook, Twitter, WhatsApp, Telegram.
- `inicializarNewsletter()` — valida email y guarda suscripción local.
- `validarEmail(email)` — regla regex de email.
- `enviarNewsletter(email)` — simula API de newsletter con `localStorage`.
- `mostrarNotificacion(mensaje, tipo)` — notificaciones con icono.

## Archivo CSS

### `css/style.css`
- Contiene estilos globales, diseño responsivo y componentes visuales.
- Controla:
  - layout de header, secciones y footer.
  - diseño de tarjetas de producto.
  - estilos de botones y estados interactivos.
  - adaptabilidad móvil.
  - animaciones y efectos hover.

## Notas técnicas
- El frontend usa `localStorage` para carrito, wishlist, reseñas y suscripciones.
- La API principal está configurada en `http://localhost:3000/api`.
- Hay fallbacks locales en `js/main.js` y `js/carrito.js` cuando la API no responde.
- `auth.html` depende del backend de autenticación para login/registro.
- `wishlist.html` requiere token para mostrar los productos guardados.
- La mayoría de las páginas incluyen `js/main.js` para comportamiento común del sitio.
