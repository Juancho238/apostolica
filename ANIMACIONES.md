# Animaciones del sitio

Entradas de secciones al entrar en pantalla (550 ms), incluyendo portadas y contenido de las pestañas IBAA. Tarjetas con elevación leve al pasar el cursor o enfocar con teclado.

Sin dependencias nuevas. Respeta prefers-reduced-motion. El contenido nunca queda oculto esperando JavaScript. Menús sticky y diálogos no reciben la animación de scroll. Administración y campus no se modificaron.

Archivos: src/components/Reveal.tsx, páginas públicas de src/pages y src/index.css.

Subí los cambios a tu repositorio y Vercel compilará la nueva versión. Para Hostinger se incluye dist compilado. No requiere SQL ni desplegar Edge Functions.

Verificación: npm run check y npm run build correctos. No se pudo completar la revisión visual automatizada porque este entorno no dispone del navegador Chromium. Revisar en el preview de Vercel móvil y escritorio antes de publicar.
