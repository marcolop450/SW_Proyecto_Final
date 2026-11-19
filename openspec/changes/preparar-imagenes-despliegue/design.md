## Context

Docker Desktop con WSL2 ya ejecuta contenedores Linux x86_64 en el equipo de desarrollo. Las aplicaciones compilan en main y las credenciales de Supabase se guardan localmente.

## Goals / Non-Goals

El objetivo es construir y probar imágenes reproducibles con los archivos de bloqueo de npm existentes, conservando el diseño y los contratos de la aplicación.

## Decisions

- Usar node:24-bookworm-slim en las etapas Node para mantener la misma familia de sistema operativo y las bibliotecas requeridas por Prisma.
- Conservar las etapas separadas de construcción y ejecución, el servidor Nginx del frontend y el usuario node de la API.
- Inyectar las credenciales únicamente durante las comprobaciones de ejecución.
- Identificar las imágenes locales con el commit base y un sufijo de validación, dado que los Dockerfiles todavía están pendientes de commit.

## Risks / Trade-offs

Debian slim puede ocupar más espacio que Alpine. Se comprobará el tamaño de las imágenes y el espacio libre al finalizar. Las dependencias bloqueadas deben compilar y ejecutarse con Node 24 antes de aceptar el cambio.

La auditoría inicial de producción reportó 15 vulnerabilidades, con 7 altas y 8 moderadas. Entre los paquetes afectados estaban @nestjs/config, @nestjs/platform-express y @nestjs/swagger y sus dependencias. La corrección y las pruebas de compatibilidad se registran en el cambio corregir-vulnerabilidades-backend.

## Hook de Reajuste

La configuración de producción, HTTPS y las rutas de salud se implementarán en los bloques siguientes del plan. Este bloque conserva las rutas y variables que utiliza el Compose actual.
