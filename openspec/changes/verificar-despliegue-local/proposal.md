## Why

Antes de elegir recursos AWS, el equipo necesita verificar el Compose completo, la experiencia HTTPS, la recuperación y las dependencias de las imágenes.

## What Changes

- Verificar el Compose publicado con Supabase mediante consultas de lectura y ejecutar las pruebas que escriben contra PostgreSQL desechable.
- Ejecutar pruebas de navegador con una cámara simulada y revisar la recuperación de imágenes y certificados.
- Actualizar la versión bloqueada de follow-redirects para resolver CVE-2026-116689.
- Liberar cualquier pista que el navegador entregue después de salir del portal del postulante.

## Capabilities

### New Capabilities

- `local-release-verification`: comprobaciones del entorno de producción antes de AWS.
