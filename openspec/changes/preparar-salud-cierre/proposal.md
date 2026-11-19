## Why

Compose solo espera que el proceso de la API arranque. Si PostgreSQL no responde, la API registra el fallo y sigue iniciando. El temporizador de supervisión también sigue activo al cerrar la aplicación, lo que obliga a forzar la salida de las pruebas.

## What Changes

- Separar la comprobación del proceso de la comprobación de PostgreSQL.
- Abortar el arranque de la API si falla la conexión inicial.
- Hacer que Compose espere la disponibilidad de la API.
- Apagar el watchdog, el servidor y Prisma de forma ordenada ante SIGTERM y SIGINT.

## Capabilities

### New Capabilities

- `api-health-lifecycle`: salud operativa y cierre de la API.

## Impact

Cambian el arranque y el cierre de NestJS y las dependencias del Compose de producción. Se conserva el contrato de GET /api y el esquema de PostgreSQL.
