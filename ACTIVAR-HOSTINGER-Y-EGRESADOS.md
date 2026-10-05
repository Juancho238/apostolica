# Activar carga en Hostinger e importar egresados

1. Hacé copia de seguridad de WordPress, su base de datos y public_html/IBAADoc. Conservá todos los PDF y nombres exactos en esa carpeta. Este proyecto incluye sus enlaces, no los archivos históricos.
2. Subí el contenido de dist a public_html. Incluye api/upload-certificate.php ya configurado con la clave pública del proyecto Supabase. No necesita service_role. No borres IBAADoc al actualizar el sitio.
3. PHP requiere cURL y fileinfo. Configurá upload_max_filesize=20M y post_max_size=24M. El script crea IBAADoc/AÑO al subir un PDF; esa carpeta debe permitir escritura al proceso PHP. No uses permisos 777.
4. Si todavía no creaste la tabla de egresados, ejecutá supabase/migrations/20261004_ibaa_graduates.sql en Supabase SQL Editor. El bucket que crea la instalación anterior ya no se usa para las nuevas cargas; no borres archivos que ya hayas guardado allí.
5. Ejecutá datos-egresados/importar-egresados.sql en SQL Editor. Contiene 213 registros de 2020–2024 y omite los existentes con igual año, instituto y nombre. Alternativamente importá datos-egresados/egresados-todos.json desde Admin > IBAA Egresados. Elegí una de las dos opciones.
6. Si aún no desplegaste ibaa-graduates, desplegá supabase/functions/ibaa-graduates/index.ts con verify_jwt=false (supabase/config.toml). Configurá GRADUATES_ALLOWED_ORIGINS con https://apostolica.com.ar,https://www.apostolica.com.ar y el origen local si lo usás. Esta función verifica sesión y rol admin internamente. No reemplaces make-server-12c44cf4 ni asamblea-commerce.
7. En Admin > IBAA Egresados, ingresá el año y elegí un PDF. El archivo se guarda en Hostinger y se completa automáticamente su URL. Luego presioná Guardar. Si no guardás el registro, el PDF permanece en Hostinger sin asociar. Eliminar un egresado no elimina su PDF.
8. Probá un PDF pequeño con una cuenta admin y verificá el enlace. Una cuenta de alumno no puede subir archivos. Revisá también /ibaa/egresados-2020/ y el resto de promociones antes de quitar WordPress.

La carga desde localhost funciona para puertos 8443 y 5173. Si usás otro origen (por ejemplo figma.site), agregá su URL exacta a $origins en el PHP. Si aparece “Falta la sesión” aun habiendo iniciado sesión, verificá que Hostinger preserve el encabezado Authorization hacia PHP.

El archivo PHP no genera QR ni modifica el PDF. Los certificados nuevos deben incluir el QR de la promoción, por ejemplo https://apostolica.com.ar/ibaa/egresados-2026/.

## Datos pendientes de revisión

Ver datos-egresados/REVISION.txt. Se preservan nombres, DNI y URLs originales. El DNI se muestra solo en admin, aunque los propios PDF pueden contenerlo.
- 2020: Marcelo Alejandro Kaiserián tiene promedio original 88, fuera de escala 0–10. Se importó sin promedio; confirmá el correcto.
- 2024: dos registros de Córdoba, Cesar Hernán Horacio comparten DNI y PDF pero tienen promedios 9.33 y 9.37. Se conservan ambos para que elijas cuál corresponde.
- 2021: la tabla no asigna instituto por alumno, se usó IBAA / IFMA. Revisá los casos señalados en REVISION.txt.

No subas datos-egresados ni tablepress-source a public_html: contienen DNI. Solo se publica el contenido de dist.

## Verificación local

TypeScript y compilación de producción verificados. No se ejecutó el PHP en Hostinger ni se aplicó SQL o desplegaron funciones en tu cuenta. La validación real de carga requiere los pasos anteriores.
