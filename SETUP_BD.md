# 🚀 Cómo usar la Base de Datos

## 1. **Iniciar el servidor backend**

Abre una terminal en la carpeta `backend/` y ejecuta:

```bash
npm install
npm start
```

El servidor correrá en `http://localhost:3000`

---

## 2. **Crear un usuario administrador**

1. Ve a [http://localhost:3000](http://localhost:3000) en tu navegador (o abre `auth.html`)
2. Haz clic en "Regístrate aquí"
3. Completa el formulario con:
   - Nombre: Tu nombre
   - Email: tu-email@ejemplo.com
   - Contraseña: Una contraseña segura

⚠️ **IMPORTANTE**: De forma manual, necesitas convertir este usuario a admin editando la base de datos `database.db`:

Desde la carpeta `backend/`, usa SQLite:
```bash
sqlite3 database.db
UPDATE users SET role = 'admin' WHERE email = 'tu-email@ejemplo.com';
.exit
```

O usa una herramienta visual como [DB Browser for SQLite](https://sqlitebrowser.org/)

---

## 3. **Inicia sesión como admin**

1. Vuelve a [auth.html](../auth.html)
2. Inicia sesión con tu email y contraseña
3. Accederás automáticamente al panel de administración

---

## 4. **Crear productos**

En el panel admin (admin-productos.html):
- Completa el formulario con los datos del producto
- Haz clic en "Crear Producto"
- Los productos aparecerán en la tienda automáticamente

---

## 5. **Ver productos en la tienda**

- La página carga automáticamente los productos de la API
- Si el servidor no está corriendo, usa datos locales como fallback

---

## 📝 Notas

- Solo los usuarios con rol `admin` pueden crear/editar/eliminar productos
- El token JWT dura 8 horas
- Los productos se guardan en la base de datos SQLite (`database.db`)
- El carrito sigue guardándose en localStorage del navegador
