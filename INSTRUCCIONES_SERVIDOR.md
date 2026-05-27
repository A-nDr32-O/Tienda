# Instrucciones para abrir la página con el servidor activado

## 1. Instalar dependencias

1. Abre una terminal en la carpeta `backend` del proyecto.
2. Ejecuta:

```bash
npm install
```

Esto instalará todas las dependencias necesarias para el servidor.

## 2. Iniciar el servidor

Desde la carpeta `backend`, ejecuta uno de los siguientes comandos:

- Para iniciar el servidor normalmente:

```bash
npm start
```

- Para iniciar el servidor en modo desarrollo (con reinicio automático si hay cambios):

```bash
npm run dev
```

El servidor usa `server.js` como entrada principal y quedará activo mientras la terminal esté en ejecución.

## 3. Abrir la página en el navegador

1. Con el servidor iniciado, abre tu navegador.
2. Carga la página principal desde el archivo local, por ejemplo:

```text
index.html
```

Si el proyecto está diseñado para trabajar con el backend, accede a las rutas que consumen la API del servidor desde las páginas de frontend.

## 4. Notas importantes

- Asegúrate de que el servidor esté corriendo antes de utilizar funciones que dependan del backend, como administrar productos, iniciar sesión o pagar.
- Si el servidor no se inicia, revisa la terminal para ver posibles errores de dependencias o configuración.
