## Decisions

- La aplicación aborta antes de escuchar si Prisma no puede conectar. El mensaje de arranque omite los detalles de conexión.
- GET /api/health/live verifica que la API responde. GET /api/health/ready usa SELECT 1 con un plazo de 2,5 segundos y responde con 503 en el formato habitual de errores si la comprobación falla. Las llamadas concurrentes comparten la misma consulta mientras está en ejecución.
- Compose usa Node para consultar la disponibilidad desde el propio contenedor. El frontend y Caddy esperan a la API durante el arranque. Una caída posterior de PostgreSQL cambia el estado de salud y permite recuperar la disponibilidad cuando vuelve la conexión.
- El watchdog arranca en el ciclo de vida de Nest después de inicializar Prisma. Al cerrar, Nest limpia el temporizador, cierra los servidores HTTP y Socket.IO, y desconecta Prisma al final.

## Hook de Reajuste

Las rutas de salud sirven para las pruebas del conjunto y para comprobar el servicio después del despliegue. La política de orígenes y la validación del proxy siguen en el bloque C.
