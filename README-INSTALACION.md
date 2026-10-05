# Asamblea Apostólica: calendario y tienda

Esta versión agrega `/calendario`, `/admin/calendario`, una tienda real en `/tienda`, `/admin/tienda` y el seguimiento de compra en `/tienda/pedido/:id`.

El campus, sus invitaciones y el backend actual se conservan. **No reemplaces make-server-12c44cf4 con el archivo server/index.tsx de este ZIP:** el export original contenía solo health, aunque tu función desplegada tiene más código. La nueva función independiente se llama `asamblea-commerce`.

## 1. Base de datos

En el mismo proyecto de Supabase, abrí SQL Editor y ejecutá el archivo:
`supabase/migrations/20261003_calendar_store.sql`.

Crea tablas independientes `aa_events`, `aa_products`, `aa_orders`, una función de actualización de pagos y el bucket privado `store-ebooks`. No modifica las tablas IBAA ni el KV existente. El navegador no tiene acceso directo a las tablas; la función controla los permisos. No hay datos de ejemplo.

## 2. Nueva Edge Function

En Supabase → Edge Functions, creá `asamblea-commerce`.
Copiá el contenido completo de `supabase/functions/asamblea-commerce/index.ts` y desplegalo.

Para **esta función nueva**, desactivá la verificación JWT del gateway: el webhook de Mercado Pago y las lecturas públicas necesitan acceso sin sesión. Los endpoints administrativos validan dentro del código el token del usuario y `app_metadata.role === admin`. No desactives esa validación interna ni cambies la configuración de la función del campus.

Con Supabase CLI, desde la raíz:

```sh
supabase functions deploy asamblea-commerce --project-ref hxdpdtgamxigobobgzaf --no-verify-jwt
```

Prueba de despliegue:
`https://hxdpdtgamxigobobgzaf.supabase.co/functions/v1/asamblea-commerce/health`
Debe responder `{"status":"ok"}`.

## 3. Secretos en Supabase

En Edge Functions → Secrets, configurá estos valores. Las credenciales no se colocan en React ni se comparten por chat.

| Nombre | Valor |
| --- | --- |
| SITE_URL | Dominio del frontend publicado, sin barra final. Ejemplo: https://www.apostolica.com.ar |
| MP_ACCESS_TOKEN | Access Token del vendedor para el entorno que estés probando |
| MP_WEBHOOK_SECRET | Clave secreta de firma del webhook de esa aplicación |
| MP_COLLECTOR_ID | ID de la cuenta vendedora correspondiente al Access Token |
| MP_LIVE_MODE | false para pruebas; true para producción |
| SHIPPING_ENABLED | false para empezar solo con retiro; true si habilitás envíos |
| SHIPPING_ARS | Tarifa fija de envío en pesos, por ejemplo 3500 |

SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son variables del entorno de Supabase. No cambies ni publiques sus valores.

Mercado Pago: configurá notificaciones del evento **Payments** en la aplicación correspondiente, con esta URL:
`https://hxdpdtgamxigobobgzaf.supabase.co/functions/v1/asamblea-commerce/webhook`.
El servidor comprueba la firma HMAC y consulta el pago y su orden en Mercado Pago. Verifica monto, moneda, vendedor, entorno y preferencia antes de habilitar el pedido.

Usá primero las cuentas y credenciales de prueba de Mercado Pago. Esta implementación usa Checkout Pro de preferencias (`/checkout/preferences`), no Checkout API Orders. La selección del entorno se valida en cada pago.

## 4. Frontend fuera de Make

Necesitás Node.js 22.12 o superior; recomendado Node.js 24.

```sh
npm ci
npm run build
```

El ZIP incluye una compilación `dist/`. Podés subir **el contenido** de dist a la raíz web del hosting. Conservá la configuración SPA para que `/campus/activar`, `/calendario` y los enlaces de pedidos funcionen al abrirlos directamente:

- Hostinger/Apache: incluye `.htaccess` en dist. Activá la visualización de archivos ocultos al subirlo.
- Netlify: incluye `_redirects`.
- Vercel: el proyecto incluye `vercel.json`.

El proyecto conserva la configuración pública de Supabase que venía en el export. La nueva función debe desplegarse en ese mismo proyecto. No se actualiza automáticamente la publicación figma.site al modificar este ZIP. Publicá este frontend en el hosting elegido y usá su dominio en SITE_URL.

Si cambiás de dominio, agregá sus URLs de activación y recuperación a Redirect URLs de Supabase. El backend ya desplegado del campus puede tener una URL Figma fija: ajustá únicamente ese destino para el nuevo dominio. SMTP permanece igual.

Para desarrollo local configurá temporalmente SITE_URL con el origen exacto local o usá una función de prueba separada. No cambies el origen de producción mientras haya compradores.

## 5. Uso

### Calendario
Entrá como admin → Calendario. Cargá título, descripción, categoría, fecha/hora, lugar y enlaces. Los horarios se interpretan en Buenos Aires. Borrador oculta el evento de la web; Publicado lo muestra en el mes correspondiente. En celular aparece el listado; en escritorio también la cuadrícula mensual. El clic muestra detalles.

### Productos
Admin → Tienda → Productos. Cargá título, autor, categoría, precio ARS, portada URL y descripción. Elegí libro físico o ebook. Para ebook subí un PDF de hasta 50 MB; no se permite publicarlo sin archivo. Para libro físico cargá stock. Podés editar o pasar a borrador. Un producto con pedidos no se elimina para preservar su historial.

### Compra
Esta primera versión compra **un título por pedido**, hasta 10 ejemplares físicos o un ebook. El comprador ingresa nombre y correo, y elige retiro o envío. No requiere registro ni afecta la política de altas del campus.

El backend calcula el precio desde la base de datos y abre Mercado Pago. Al regresar, la página consulta el estado real. La URL de retorno por sí sola nunca aprueba un pedido. El enlace de descarga dura 60 segundos y solo se genera para pagos aprobados.

El acceso del comprador al pedido se guarda con un token privado en el navegador donde inició la compra. Cambiar de navegador o borrar los datos locales pierde ese acceso: en esta versión deberá contactar al administrador. No se envían todavía comprobantes propios ni enlaces por email; Mercado Pago gestiona sus comprobantes. El administrador puede identificar el pedido por correo.

### Pedidos y stock
Admin → Tienda → Pedidos muestra los últimos 500 pedidos y permite actualizar el estado de entrega física. El estado de pago no se modifica manualmente. “Consultar pago nuevamente” revalida pagos recibidos, útil después de reponer stock de un pedido `paid_review`.

El stock se descuenta en una transacción al aprobar el pago y una notificación repetida no lo descuenta dos veces. No se reserva al abrir Checkout: si varios compradores pagan el último ejemplar, el segundo queda `paid_review`; deberá coordinarse entrega o devolución en Mercado Pago. No hay stock negativo ni entrega automática para esos pedidos. Los reembolsos y contracargos completos bloquean ebooks y restituyen el stock aplicado. Un reembolso parcial requiere revisión administrativa.

Los archivos de ebooks anteriores se conservan cuando un producto cambia de PDF, para que los pedidos previos mantengan su archivo. PDFs subidos y luego descartados no se eliminan automáticamente.

## 6. Verificación antes de vender

1. Publicar un evento y comprobarlo en móvil/escritorio; verificar que un borrador no aparezca.
2. Publicar un libro físico y un ebook propio de prueba.
3. Comprar con cuentas de prueba de Mercado Pago y comprobar retorno, webhook y aprobación.
4. Verificar que sin pago aprobado no se habilita la descarga; comprobar un pago rechazado.
5. Reenviar una notificación para comprobar que no duplica stock. Probar devolución y falta de stock.
6. Comprobar que alumnos y visitantes no pueden usar endpoints admin.
7. Pasar a credenciales de producción únicamente después de completar estas pruebas.

La compilación y los tipos del frontend se comprobaron localmente. Las pruebas del backend comprueban rechazo de solicitudes admin anónimas, firma ausente/falsa, cantidades inválidas, precio calculado desde DB y bloqueo de descargas pendientes. Las seis pruebas pasaron con respuestas simuladas. No se ejecutó la migración en tu proyecto ni se realizaron cobros reales. La comprobación visual automatizada quedó bloqueada porque el entorno no pudo descargar Chromium.

## Alcance

Sin carrito de múltiples títulos, cupones, recurrencias de eventos, transportistas automáticos ni cuentas públicas de compradores. El calendario y la tienda no consumen créditos Make. Hosting, Supabase y las comisiones de cobro dependen de tus servicios contratados.

Referencias de integración:
- https://www.mercadopago.com.ar/developers/en/docs/checkout-pro-preferences/payment-notifications
- https://github.com/mercadopago/openapi/blob/main/schemas/webhooks.yaml
