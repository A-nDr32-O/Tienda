# Imágenes de Productos - El Enemigos

## Imágenes Existentes ✅
- `logo.png` - Logo de la tienda
- `apex.jpg` - Apex Legends
- `death stranding.png` - Death Stranding
- `headset.png` - Auriculares gaming
- `hero-bg.jpg` - Imagen de fondo del hero
- `ps5.png` - PlayStation 5
- `ps5 vertical.png` - PlayStation 5 (vertical)

## Imágenes Requeridas 📋

### Juegos
- `cyberpunk.jpg` - Cyberpunk 2077 (900x1200px, formato JPG)
- `fifa.jpg` - FIFA 24 (900x1200px, formato JPG)
- `gta.jpg` - Grand Theft Auto V (900x1200px, formato JPG)
- `the-last-of-us.jpg` - The Last of Us Part II (900x1200px, formato JPG)

### Consolas
- `xbox-series-x.jpg` - Xbox Series X (900x1200px, formato JPG)
- `nintendo-switch.jpg` - Nintendo Switch OLED (900x1200px, formato JPG)

### Accesorios
- `monitor-gaming.jpg` - Monitor gaming 144Hz (900x1200px, formato JPG)
- `teclado-mecanico.jpg` - Teclado mecánico gaming (900x1200px, formato JPG)
- `mouse-gaming.jpg` - Mouse gaming RGB (900x1200px, formato JPG)
- `silla-gaming.jpg` - Silla gaming ergonómica (900x1200px, formato JPG)
- `alfombrilla.jpg` - Alfombrilla gaming XXL (900x1200px, formato JPG)

## Imágenes para "Nosotros" 📸

### Galería de la Tienda
- `tienda-interior.jpg` - Interior de la tienda física (1200x800px)
- `equipo.jpg` - Foto del equipo de trabajo (800x600px)
- `evento-gaming.jpg` - Evento o torneo en la tienda (1200x800px)
- `clientes.jpg` - Clientes felices en la tienda (800x600px)

## Especificaciones de Imágenes 📐

### Formato Recomendado
- **Formato**: JPG o PNG
- **Resolución mínima**: 900x1200px (3:4 ratio)
- **Calidad**: 80-90% compresión JPG
- **Peso máximo**: 500KB por imagen
- **Fondo**: Preferiblemente blanco o transparente

### Optimización
- Usar herramientas como TinyPNG o ImageOptim
- Implementar lazy loading para mejor performance
- Crear versiones WebP para navegadores modernos
- Usar srcset para diferentes tamaños de pantalla

## Fuentes de Imágenes Aceptables 🎨

### Gratuitas y Legales
1. **Unsplash** - Fotos de alta calidad gratuitas
2. **Pexels** - Biblioteca de fotos libre de derechos
3. **Pixabay** - Imágenes y videos gratuitos
4. **Placeholder.com** - Para desarrollo temporal

### Para Productos de Gaming
- Capturas de pantalla oficiales de juegos
- Imágenes promocionales de fabricantes
- Fotos de productos de tiendas oficiales
- **IMPORTANTE**: Solo usar imágenes con derechos de uso comercial

## Implementación Actual 🔧

### Fallback Automático
```html
<img src="img/cyberpunk.jpg"
     alt="Cyberpunk 2077"
     onerror="this.src='https://via.placeholder.com/250x250/9370DB/FFFFFF?text=Cyberpunk+2077'">
```

### Lazy Loading (Futuro)
```html
<img loading="lazy"
     src="img/cyberpunk.jpg"
     alt="Cyberpunk 2077">
```

## Próximos Pasos 📋

1. **Descargar imágenes de alta calidad** de fuentes legales
2. **Optimizar imágenes** para web (compresión, formato)
3. **Implementar WebP** con fallbacks JPG
4. **Agregar lazy loading** para mejor performance
5. **Crear versiones responsive** con srcset

## Notas Importantes ⚠️

- **Derechos de autor**: Solo usar imágenes con permisos comerciales
- **Marcas registradas**: Evitar logos de empresas sin autorización
- **Calidad**: Las imágenes deben ser nítidas y profesionales
- **Consistencia**: Mantener estilo visual coherente en todo el catálogo