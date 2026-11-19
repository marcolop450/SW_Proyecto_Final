## 1. Salud y ciclo de vida

- [x] 1.1 Abortar el arranque si falla PostgreSQL y agregar las comprobaciones HTTP.
- [x] 1.2 Configurar la comprobación y las dependencias en Compose.
- [x] 1.3 Cerrar el watchdog, los servidores y Prisma en orden.

## 2. Verificación

- [x] 2.1 Comprobar el contrato de salud y GET /api, con base disponible, caída y recuperación.
- [x] 2.2 Verificar credenciales inválidas y los manejadores de SIGTERM y SIGINT en procesos locales.
- [x] 2.3 Ejecutar las suites E2E sin `--forceExit` con PostgreSQL desechable.
- [x] 2.4 Registrar las evidencias en el plan. Las pruebas con el conjunto final se repetirán en el bloque D.
- [x] 2.5 Verificar el inicio de los servicios dependientes, la recuperación y el cierre ante señales reales en Docker.
- [x] 2.6 Comprobar el arranque de la API contenedorizada y la disponibilidad con Supabase.

## Resultados

El 19 de noviembre de 2026 se verificaron la compilación y las 25 pruebas E2E con Node 22 y PostgreSQL 17 desechable. Las suites terminaron con `--detectOpenHandles` y sin `--forceExit`. La API compilada salió con código 1 ante credenciales inválidas, respondió durante una caída real de PostgreSQL y recuperó la disponibilidad al reiniciar la base. Al emitir los eventos SIGTERM y SIGINT desde procesos de prueba se confirmó que Nest ejecuta el cierre y Prisma desconecta.

La configuración de Compose pasó `config --quiet`. Después de recuperar Docker Desktop con un reinicio de Windows, se reconstruyó la imagen de producción con Node 24. En un proyecto Compose temporal con PostgreSQL 16 se comprobaron el código 1 por credenciales inválidas, la espera del frontend y Caddy, la transición `healthy → unhealthy → healthy` sin reiniciar la API y la desconexión de Prisma al recibir SIGTERM y SIGINT reales. Con Supabase se verificó por separado el arranque y la consulta de disponibilidad de solo lectura. Las evidencias se registran en [el plan compartido](../../../docs/PLAN_DESPLIEGUE_AWS.md).
