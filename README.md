# Morales Streaming — refactorización conservadora

Esta copia reorganiza internamente el proyecto original sin rediseñar la tienda ni añadir funciones.

La edición **Mejoras V1** parte de esa base estable y añade control de cantidades, límites por stock, precios consistentes y validaciones de promociones/combos sin cambiar el layout principal.

## Estructura

- `index.html`: estructura y contenido original.
- `css/styles.css`: punto de entrada compatible que carga las hojas en el orden original.
- `css/base.css`: variables, reset, fondo y loader inicial.
- `css/layout.css`: navegación, hero, banners y filtros.
- `css/components/`: tarjetas, secciones, modales y promociones.
- `css/responsive.css`: reglas posteriores y adaptaciones responsive, conservadas en su orden original.
- `js/config.js`: configuración, caché y utilidades de WhatsApp.
- `js/api.js`: procesamiento de datos recibidos desde Google Sheets.
- `js/catalog.js`: búsqueda, filtros, catálogo y detalle de producto.
- `js/cart.js`: estado, descuentos, cupón y renderizado del carrito.
- `js/combo.js`: selección y modal de combos personalizados.
- `js/ui.js`: pagos, FAQ, scroll y notificaciones.
- `js/main.js`: interacciones móviles y actividad visual.

## Uso

No requiere compilación. Abre `index.html` mediante un servidor web estático. La tienda conserva sus dependencias externas y la conexión configurada con Google Sheets.

## Criterio de compatibilidad

Las reglas CSS se distribuyeron por rangos contiguos y se cargan respetando la cascada original. El JavaScript continúa usando scripts clásicos, en lugar de módulos ES, para conservar las funciones globales empleadas por los manejadores existentes del HTML.

No se eliminaron overrides ni estilos inline cuya retirada pudiera alterar la apariencia. Su migración puede hacerse más adelante con comparación visual automatizada.
## Imágenes locales

Las imágenes utilizadas por la tienda están organizadas dentro de `assets/`:

- `assets/products/`: logos de las plataformas.
- `assets/product-backgrounds/`: fondos de detalles de productos.
- `assets/combos/`: imágenes de combos.
- `assets/payments/`: iconos y códigos QR de pago.
- `assets/posters/`: pósteres del encabezado.
- `assets/brand/`: identidad visual de Morales Streaming.

La hoja externa continúa controlando precios, stock y contenido. Los productos conocidos usan automáticamente su imagen local según su identificador.
