> Actualización: para carga de PDF e importación de las tablas adjuntas, seguí primero ACTIVAR-HOSTINGER-Y-EGRESADOS.md. El botón ahora sube a Hostinger, no al bucket. Las instrucciones de carga a Supabase de esta guía corresponden a la versión anterior.

# IBAA Egresados: instalación y conservación de los QR

Este ZIP contiene el proyecto completo actualizado y `dist` compilado. No incluye los egresados ni PDFs históricos: no estaban en el ZIP original. No se modificó el Supabase remoto.

## 1. Supabase

Ejecutar `supabase/migrations/20261004_ibaa_graduates.sql` en SQL Editor del mismo proyecto. Crea tabla, permisos y bucket PDF público, sin modificar tablas de campus, tienda ni calendario.

Crear una NUEVA Edge Function llamada `ibaa-graduates`; pegar TODO `supabase/functions/ibaa-graduates/index.ts` y desplegar. Desactivar Verify JWT solo en esta función: su código verifica sesión y rol admin en todas las rutas administrativas. No reemplazar `make-server-12c44cf4` ni `asamblea-commerce`.

Agregar secreto `GRADUATES_ALLOWED_ORIGINS` con los orígenes exactos separados por comas, sin barra final. Ejemplo:

```
http://localhost:8443,https://apostolica.com.ar,https://www.apostolica.com.ar
```

Comprobar `https://hxdpdtgamxigobobgzaf.supabase.co/functions/v1/ibaa-graduates/health`: devuelve `{"status":"ok"}`.

## 2. Administración

Ingresar con cuenta cuyo app_metadata.role sea admin. Abrir Admin → IBAA Egresados. Cargar nombre, instituto, año, promedio opcional, certificado y estado. DNI se conserva en admin, no se lista públicamente (el PDF histórico puede contenerlo).

PDF nuevo: subir desde admin (máximo 20 MB) y luego guardar. PDF histórico: pegar URL original sin cambiarla. Publicar requiere certificado. Los archivos subidos son públicos: este módulo está destinado a certificados que se publican en el listado. Eliminar un registro no elimina su PDF ni rompe automáticamente sus enlaces.

Un mismo nombre/instituto/año no admite dos registros. Si hay homónimos reales en una promoción, revisar la identificación antes de importar y adaptar la clave única; no fusionarlos sin comprobarlos.

## 3. Promociones históricas: antes de retirar WordPress

1. Respaldar archivos y base de datos de WordPress y la carpeta completa `IBAADoc` desde Hostinger, además de cualquier carpeta adicional que usen los certificados.
2. Abrir cada tabla histórica; desactivar paginación o mostrar todos los registros. Copiar `scripts/exportar-egresados-wordpress.js` en la consola del navegador. Verificar el total y descargar el JSON. El script copia datos y URLs; NO descarga PDFs.
3. Importar cada JSON desde Admin → IBAA Egresados. Se conservan los registros existentes con mismo nombre/instituto/año: el importador no los reemplaza. Comparar recuentos contra WordPress. Si una tabla tiene otra estructura, no asumir que el script exportó todo: adaptar el exportador con su HTML.
4. Si lo preferís, exportar manualmente un JSON con objetos que tengan `name`, `institute`, `graduation_year`, `average` (número o null), `document_number`, `certificate_url`, `status` (`published` o `draft`). Máximo 500 objetos por archivo. No importar ejemplos inventados.
5. Conservar `IBAADoc` y los PDFs en la misma carpeta pública del alojamiento. NO eliminarlos al subir `dist`. Rutas sensibles a mayúsculas: respetar carpeta, nombre y extensión.
6. Revisar certificados y QR reales de cada año antes de eliminar WordPress. Mantener una copia recuperable de WordPress hasta completar esta validación.

## 4. Rutas

- `/ibaa`: nueva pestaña Egresados.
- `/ibaa/egresados`: todas las promociones.
- `/ibaa/egresados-2020/`: promoción 2020; misma dirección del QR.
- `/ibaa/egresados-2026/`: futuras promociones; NO hay que recompilar para agregar años.
- `/ibaa/ibaa-egresados-2022/`: también admite el formato de rutas histórico que se observó en el sitio.
- `/ibaa-2/`: IBAA abre con Egresados seleccionado.

La ruta identifica el año, no al alumno. Se muestra tabla con buscador. Para mantener URLs adicionales distintas de estos formatos, agregar alias antes de cambiar el sitio.

## 5. Publicación en Hostinger

`npm install`, `npm run check`, `npm run build`. Subir el CONTENIDO de `dist` a la raíz pública junto con `.htaccess`. Retirar el index.php y reglas WordPress al activar la nueva web, conservando PDFs y respaldos. Si quedan directorios físicos `ibaa/egresados-2020`, pueden interferir con el fallback SPA: comprobar que cada URL histórica cargue la app.

El `.htaccess` preserva archivos y carpetas existentes: PDFs reales se sirven directamente. Si se cambia de alojamiento, copiar allí esas mismas rutas o establecer redirecciones específicas antes del fallback; no alcanza con mantener el dominio.

## Validación realizada

TypeScript y compilación de frontend; chequeo Deno de la función; pruebas de validación de año, acceso admin y publicación. No se ejecutó SQL remoto, no se desplegó ninguna función ni se verificó el QR en el dominio publicado. Importación histórica y respaldo de PDFs pendientes de los archivos originales.
