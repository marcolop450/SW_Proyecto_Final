## 1. Implementación

- [x] 1.1 Aplicar una política común de orígenes a HTTP y Socket.IO.
- [x] 1.2 Derivar el origen de producción del dominio de Caddy y preservar el desarrollo local.
- [x] 1.3 Habilitar confianza en un salto de proxy en el Compose de producción.

## 2. Verificación

- [x] 2.1 Comprobar solicitudes HTTP, preflight, polling y WebSocket con orígenes permitidos y externos.
- [x] 2.2 Verificar HTTPS y la IP observada por Caddy con el proxy real.
- [x] 2.3 Registrar evidencias en el plan.

## Resultados

El 19 de noviembre de 2026 se reconstruyó la imagen de producción de Node 24 y se levantó un proyecto Compose desechable con Caddy y PostgreSQL 16. HTTPS funcionó con la autoridad local de Caddy. HTTP y polling rechazaron el origen externo con 403. Engine.IO rechazó la conexión WebSocket externa antes de cambiar de protocolo. El sitio permitido pudo autenticarse por ambos transportes y la conexión sin token se rechazó.

El proxy reemplazó las cabeceras reenviadas que mandó el cliente de prueba. Express recibió HTTPS y la dirección del cliente de Docker. El flujo de consentimiento guardó la IP que observó el proxy. Las pruebas ocurrieron en la base desechable. La prueba instrumental de la dirección y el protocolo se montó temporalmente en el contenedor de verificación.

Las seis suites de regresión terminaron por sí solas con PostgreSQL 17 temporal y las nueve pruebas específicas terminaron con detección de recursos abiertos. El estado y la próxima etapa están en [el plan de despliegue](../../../docs/PLAN_DESPLIEGUE_AWS.md).
