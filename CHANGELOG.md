# Navbar fix

- Corregida la estructura HTML del navbar: `brand-left-box` ahora cierra antes del buscador.
- Restaurada la distribución de escritorio de referencia: marca a la izquierda, buscador al centro y acciones a la derecha.
- Conservada la nueva marca `MORALES STREAMING` en blanco/cyan.
- Corregido un bloque móvil de detalle con `@media` anidado accidentalmente y eliminada una duplicación directa.
- Sin cambios intencionales en tarjetas, catálogo, hero, carrito o lógica JavaScript.

# Changelog

## Estabilización V3

- Eliminadas las implementaciones antiguas duplicadas de checkout en `cart.js`.
- Eliminadas las implementaciones antiguas duplicadas del constructor de combos en `combo.js`.
- `commerce-v3.js` queda como única implementación activa del checkout y los combos V3.
- Sustituidos los importes iniciales ficticios `S/0.00` del checkout por estados neutros.
- Conservados el diseño y el flujo visible actual.

## Mejoras V1

### Carrito y stock

- Añadidas cantidades por producto con controles `−` y `+`.
- El carrito respeta el stock publicado en Google Sheets y reajusta cantidades guardadas si el stock disminuye.
- El contador, los descuentos y los totales ahora consideran unidades, no solo productos distintos.
- Los precios del carrito se actualizan con el catálogo vigente.
- El mensaje de WhatsApp incluye cantidad y subtotal por producto.

### Precios y promociones

- Centralizado el formato monetario para evitar precios como `S/0.00` o dobles decimales accidentales.
- Los precios tachados solo aparecen cuando son mayores que el precio de oferta.
- Oferta Flash solo se muestra cuando tiene título activo y precio válido mayor que cero.
- Los productos con stock cero quedan agotados aunque el campo de estado no esté actualizado.

### Combos y pago

- El combo personalizado exige al menos dos plataformas antes de habilitar el pedido.
- Se excluyen del combo productos sin precio válido o agotados.
- Los estados vacíos usan `—` en vez de mostrar importes ficticios en cero.
- El resumen de pago refleja cantidades, subtotales, descuentos y cupón en WhatsApp.

## Refactor original

### Cambiado

- Separado el CSS monolítico en base, layout, componentes y responsive.
- Conservado `css/styles.css` como punto de entrada para no romper referencias.
- Separado el JavaScript en configuración, API, catálogo, carrito, combos, interfaz e inicialización.
- Actualizado `index.html` para cargar los scripts clásicos en orden compatible.
- Añadida documentación de estructura y mantenimiento.

### Conservado

- Diseño, layout, textos y contenido HTML.
- Comportamiento móvil y reglas responsive.
- Buscador, filtros, tarjetas, flecha para subir, combos, carrito, pagos, modales y WhatsApp.
- URLs, configuración, almacenamiento local y conexión con Google Sheets.

### Decisión conservadora

- No se retiraron reglas de cascada ni estilos inline que pudieran tener efectos visibles. La prioridad de esta entrega es equivalencia visual y funcional con el original.
- No se añadieron funciones ni rediseños.


## Ajuste checkout + ancho + detalles
- Se conservó la apariencia anterior del loader y de las tarjetas del catálogo.
- Catálogo de escritorio fijado a 5 tarjetas por fila.
- Ancho principal reducido a 1240 px para evitar que el contenido llegue demasiado a los bordes.
- Cupón del carrito integrado a la paleta azul/cyan.
- Nuevo paso de checkout para revisar el pedido antes de abrir el pago.
- Modal de detalles mejorado con logo, disponibilidad, duración y categoría.
## V1 — Tarjetas y detalles estilo V3
- Catálogo de escritorio fijado a 5 tarjetas por fila.
- Tarjetas trasladadas visualmente desde `morales-streaming-v3-stock-fixed(2)`: imagen superior, badges de oferta/stock, destacado, chips, beneficios, ahorro, Ver detalles + carrito.
- Modal de detalles trasladado al estilo V3 con logo, disponibilidad, especificaciones, incluye, condiciones, precio, selector de cantidad y acciones Agregar / Comprar ahora.
- Comprar ahora usa el checkout existente de esta base.
- Se mantiene navbar, hero, combos, carrito, checkout y estructura general de la versión actual.


## Flujo V3 — checkout, categorías, legales y combo
- Checkout integrado después del carrito con resumen, método de pago, confirmación de disponibilidad y WhatsApp.
- Filtros de catálogo ampliados por categorías, orden, disponibilidad y ofertas.
- Modal de combo personalizado actualizado al estilo V3 con lista desplazable y pie fijo.
- Enlaces legales añadidos al footer con páginas independientes de Términos, Garantía, Privacidad y Contacto.
- Se mantiene el ancho general de escritorio en 1250 px y las 5 tarjetas por fila del trabajo actual.


## Mejoras integradas - septiembre 2026
- Buscador semántico por categorías y palabras relacionadas.
- Logos centrados en Armar Combo.
- Checkout con mayor espacio útil.
- Detalles V3 con acento de color por plataforma.
- Corrección de imágenes de tarjetas en móvil.
- Carrito exclusivo: combos y productos individuales no se mezclan.
- Menú Más en PC y móvil para referidos, cómo comprar, FAQ, garantía y contacto.
- Referidos, FAQ y procedimiento de compra retirados del cuerpo principal.
- El carrito se cierra al tocar/clickear fuera del panel.
## Mejoras de interacción y móvil
- Los enlaces legales se abren dentro de la tienda y se cierran sin recargar la página.
- Las confirmaciones genéricas del navegador fueron reemplazadas por diálogos visuales propios.
- Las imágenes de las tarjetas ahora se muestran completas y centradas en móvil.
- Se compactaron el constructor de combos y el bloque de pago del checkout.
## Recursos locales
- Se descargaron y organizaron localmente los logos, fondos, QR, pósteres y recursos de marca actuales.
- El catálogo dinámico mantiene precios y stock remotos, pero usa imágenes locales para los productos conocidos.
- Se eliminaron las dependencias visuales directas de Postimages y TMDB en la página principal.
## Métodos de pago informativos
- La sección inferior dejó de abrir el modal antiguo sin pedido.
- Yape, Plin, BCP, Interbank y otros bancos se muestran como opciones visuales.
- El cliente es dirigido al carrito y al checkout para consultar el total y los datos de pago.
## Franja de medios de pago
- Se creó una franja transparente con Yape, Plin, BCP, Interbank, BBVA y Scotiabank.
- La cuadrícula anterior fue sustituida por una presentación visual uniforme y adaptable.
## Franja de pagos animada
- Se aumentó notablemente el tamaño visible de los logotipos.
- Se añadió un resplandor blanco suave para mejorar el contraste.
- La franja ahora se desplaza continuamente y se pausa al colocar el cursor encima.
## Legibilidad de la franja de pagos
- Se eliminó el resplandor que alteraba los bordes de los logos.
- Se redujo ligeramente su tamaño y se añadió un fondo claro muy sutil para mejorar el contraste.
- Los extremos del movimiento ahora aparecen y desaparecen suavemente.
## Franja de pagos simplificada
- Se retiraron los dos textos auxiliares de la sección.
- Se redujeron el ancho, la altura y el tamaño de los logos para mantenerlos dentro de la franja.
## Proporción de logos de pago
- Se redujeron únicamente Yape y Plin para equilibrar su altura visual con los logotipos bancarios.
- Los demás logos, la animación y el tamaño de la franja permanecen sin cambios.
## Pie de página y botones flotantes
- Los enlaces legales se centraron en escritorio.
- La esquina derecha queda reservada para WhatsApp y la flecha de subida, evitando que cubran el contenido.
## Altura de la franja de pagos
- Se redujo el espacio superior e inferior sin cambiar el tamaño de los logos ni la animación.
## Limpieza de reseñas
- Se retiró la nota “Los avatares son ilustrativos” para simplificar el cierre de la sección.
## Navegación y preguntas frecuentes
- Preguntas frecuentes ahora es una sección visible antes de Métodos de pago.
- En escritorio, “Más” fue reemplazado por accesos directos a Referidos y Cómo comprar.
- El menú compacto móvil conserva únicamente esos dos accesos.
- Garantía y Contacto permanecen disponibles en el pie de página mediante ventanas internas.
## Tipografía del navbar
- Referidos y Cómo comprar ahora usan el mismo tamaño y peso de letra que Planes, Pagos y Combos.
## Información de referidos
- La ventana ahora explica el proceso en tres pasos.
- Se añadió una aclaración sobre el registro y las condiciones del beneficio sin fijar montos promocionales.
## Logos del constructor de combos
- Los logos ahora ocupan por completo su recuadro, sin relleno blanco interior y manteniendo el centro.
## Transferencias bancarias
- Al seleccionar Transferencia ya no se muestran el QR ni el número de Plin.
- Se muestran BCP, Interbank, BBVA y Scotiabank como bancos disponibles.
- Se aumentó ligeramente el tamaño de Yape y Plin en la franja para equilibrarlos con los bancos.
## Normalización visual de combos
- Las tarjetas de combos ahora usan la misma paleta, bordes y botones que las tarjetas de productos.
- Se eliminó el contraste excesivo del precio verde y del degradado del botón Personalizar.
## Etiquetas de stock
- Se mantuvo el stock en la parte superior de la tarjeta.
- Se eliminó el efecto translúcido que reducía la nitidez del texto.
- Se ajustaron cápsula, borde, tipografía y colores para cada estado.
