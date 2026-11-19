# Seguimiento del despliegue en AWS

Proyecto ErgoCheck AI. Estado revisado el 19 de noviembre de 2026.

- Rama de trabajo `main`.
- Base publicada anterior al bloque A: `99a5dd7`.
- Bloque A implementado, verificado localmente y publicado en `main` con este documento.
- Commit de esta entrega: `build(deploy): configurar producción con Supabase y seguimiento` (consultable con `git log --oneline -- compose.production.yml`).
- Bloque B implementado, verificado en Windows y Docker y publicado en `main`.
- Bloque C implementado, verificado con Caddy y publicado en `main`.
- Siguiente bloque **D · Verificación final**.
- El servicio AWS y el dominio público se elegirán después de verificar la preparación local.

## Cómo mantener este documento

Marcar `[x]` al implementar y verificar una tarea. Mantener `[ ]` para los pendientes y agregar **en curso** cuando corresponda. Al publicar un bloque, registrar su commit y las pruebas realizadas. Los resultados locales deben llevar fecha y entorno para que otro integrante pueda reproducirlos.

- [x] Guardar el plan compartido en este archivo.
- [x] Publicar este documento y el avance del bloque A en el repositorio.
- [ ] Actualizar el plan al completar cada bloque siguiente.

## Trabajo completado y publicado

- [x] Integrar los avances de `jersonuwu` en `manuel-dev`, `integracion` y `main`.
- [x] Instalar WSL2, Docker Desktop y Docker Compose en el equipo de Manuel.
- [x] Ejecutar correctamente el contenedor oficial `hello-world`.
- [x] Configurar y probar DATABASE_URL y DIRECT_URL con el Session pooler de Supabase, SSL y espera de conexión de 20 segundos.
- [x] Consultar las 15 tablas originales y comprobar su esquema mediante operaciones de solo lectura.
- [x] Actualizar los Dockerfiles a Node 24 LTS sobre Debian slim.
- [x] Conservar OpenSSL, dumb-init y el usuario node en la imagen de la API.
- [x] Excluir archivos de entorno, cachés y cobertura de los contextos Docker.
- [x] Construir y ejecutar las imágenes del backend y del frontend.
- [x] Comprobar Nginx, rutas React, proxy API y recursos de visión.
- [x] Publicar los ajustes Docker en `843d229`.
- [x] Actualizar NestJS y sus módulos compatibles a la rama 11.
- [x] Corregir las dependencias indirectas vulnerables de ExcelJS y del CLI.
- [x] Obtener 0 vulnerabilidades reportadas en las auditorías completa y de producción del backend.
- [x] Conservar los errores HTTP 400, 413 y 415 en el formato global de la API.
- [x] Aprobar 17 pruebas E2E con Node 24 y PostgreSQL temporal.
- [x] Verificar JWT, filtros HTTP, reportes PDF/XLSX, Swagger y WebSockets autenticados a través de Nginx.
- [x] Publicar las correcciones de seguridad en `99a5dd7`.
- [x] Consultar los beneficios gratuitos y los recursos existentes de la cuenta AWS.

En la verificación anterior se usó `--forceExit` por el temporizador de supervisión. Con la corrección del bloque B, las suites terminan por sí solas.

### Evidencia de los bloques publicados

Las tareas y los resultados están en [preparación de imágenes](../openspec/changes/preparar-imagenes-despliegue/tasks.md) y [corrección de vulnerabilidades](../openspec/changes/corregir-vulnerabilidades-backend/tasks.md). Los Dockerfiles y los archivos de bloqueo permiten reconstruir las imágenes en otro equipo.

## Bloque A · Configuración de producción con Supabase

- [x] Crear y verificar `compose.production.yml`, independiente del Compose existente.
- [x] Configurar la API, el frontend Nginx y la entrada Caddy.
- [x] Proporcionar las conexiones de Supabase mediante variables privadas.
- [x] Conservar los puertos de la API y del frontend dentro de la red Docker y publicar HTTP/HTTPS en la entrada.
- [x] Incorporar la plantilla `.env.production.example` y excluir el archivo privado `.env.production` de Git.
- [x] Rechazar variables obligatorias ausentes y secretos JWT de producción de menos de 32 caracteres.
- [x] Configurar reinicios, rotación de registros y volúmenes para certificados.
- [x] Identificar las imágenes mediante RELEASE_TAG.
- [x] Construir e iniciar el conjunto y registrar las comprobaciones de este bloque.

El arranque inicia los servicios. Las operaciones de esquema y las pruebas que escriben datos se ejecutan por separado, con el destino verificado.

### Variables y comandos de este bloque

Cada integrante crea su propio `.env.production` a partir de la plantilla y completa las credenciales por un canal privado. DATABASE_URL y DIRECT_URL deben señalar la misma base y esquema. JWT_SECRET debe generarse aleatoriamente. APP_DOMAIN contiene solo el nombre del servidor. En las pruebas locales se usa localhost y BIND_ADDRESS=127.0.0.1.

Para una versión publicada, RELEASE_TAG identificará el commit correspondiente. El sufijo `-check` identifica una imagen de validación de cambios locales.

Desde la raíz del repositorio, después de completar las variables:

```powershell
docker compose --env-file .env.production -f compose.production.yml config --quiet
docker compose --env-file .env.production -f compose.production.yml build
docker compose --env-file .env.production -f compose.production.yml up -d
docker compose --env-file .env.production -f compose.production.yml ps
docker compose --env-file .env.production -f compose.production.yml logs --tail 100
docker compose --env-file .env.production -f compose.production.yml down
```

Compose da prioridad a las variables de la terminal sobre las del archivo. La validación usa `config --quiet` para conservar los secretos fuera de la salida de la consola. Los volúmenes de Caddy conservan sus certificados entre arranques.

### Evidencia local del bloque A

Verificado el 18 de noviembre de 2026 en Windows con Docker Desktop, contenedores Linux y las imágenes Node 24. Las imágenes de prueba llevan la etiqueta `99a5dd7-production-check`; contienen cambios locales posteriores a ese commit.

- Construcción de las dos imágenes y arranque de los tres servicios completados.
- Cinco pruebas automatizadas de configuración JWT aprobadas. Comprobado también el rechazo de un secreto corto dentro de la imagen de producción.
- Compose rechazó por separado DATABASE_URL, DIRECT_URL, JWT_SECRET, APP_DOMAIN y RELEASE_TAG vacíos.
- HTTP redirigió a HTTPS. El cliente validó el certificado de localhost confiando expresamente en la autoridad de prueba de Caddy.
- Frontend, recarga de rutas React, API y recursos de modelos/WASM accesibles por HTTPS. Una ruta protegida devolvió 401 sin token.
- Socket.IO recibió una conexión mediante WebSocket seguro a través de Caddy y rechazó el acceso sin token. Los flujos autenticados completos quedan para el bloque D.
- DATABASE_URL y DIRECT_URL consultaron Supabase desde la API contenedorizada dentro de transacciones de solo lectura. No se ejecutaron migraciones ni semillas.
- Verificados puertos internos, reinicio `unless-stopped`, registros con límite de 10 MB y tres archivos, y persistencia de la autoridad al recrear Caddy.
- Los contenedores y volúmenes temporales de comprobación se retiraron al terminar. Las imágenes y el archivo privado permanecen disponibles en el equipo.

La autoridad local todavía no está instalada como confiable en el navegador. La prueba de cámara en navegador, la disponibilidad de la base y el cierre ordenado siguen pendientes. No se han creado ni modificado recursos AWS en este bloque.

La especificación y las comprobaciones del incremento están en [configuración de producción](../openspec/changes/configurar-produccion-supabase/tasks.md). Este avance y el plan compartido forman parte de la entrega del bloque A en `main`.

## Bloque B · Salud y cierre ordenado

- [x] Terminar el arranque con un error si falla la conexión inicial con PostgreSQL.
- [x] Agregar `GET /api/health/live` con respuesta 200 mientras el proceso funciona.
- [x] Agregar `GET /api/health/ready` con respuesta 200 si la consulta funciona y 503 si falla o supera 2,5 segundos.
- [x] Conservar el contrato existente de `GET /api`.
- [x] Configurar la comprobación de disponibilidad y las dependencias. Validar el archivo con `docker compose config --quiet`.
- [x] Habilitar el cierre ordenado ante SIGTERM y SIGINT y verificar sus manejadores en un proceso de prueba.
- [x] Detener el watchdog y liberar conexiones al cerrar la aplicación.
- [x] Ejecutar las suites correspondientes sin `--forceExit`.
- [x] Reconstruir la imagen y verificar `service_healthy`, recuperación y señales reales en el Compose de producción.
- [x] Confirmar el arranque de la API contenedorizada con Supabase y consultar su disponibilidad en modo de solo lectura.
- [x] Publicar el avance del bloque B en `main` con el commit `feat(deploy): verificar salud y cierre de la API`.

El 19 de noviembre de 2026 pasaron las 25 pruebas de las cinco suites, sin `--forceExit` y con detección de recursos abiertos. Se usó Node 22 en Windows con PostgreSQL 17 desechable. Con la API compilada se verificó que sale con código 1 ante credenciales inválidas y que la disponibilidad pasa de 200 a 503 y vuelve a 200 al reiniciar la base, mientras el proceso sigue respondiendo 200. También se comprobó que los manejadores de SIGTERM y SIGINT ejecutan el cierre y desconectan Prisma. Las pruebas usaron datos de prueba locales.

Tras reiniciar Windows, Docker Desktop volvió a responder y se reconstruyó la imagen de producción con Node 24. Con el Compose de producción y PostgreSQL 16 desechable se verificó que el frontend y Caddy esperan a que la API esté `healthy`. Una contraseña inválida hizo que la API terminara con código 1. Al pausar PostgreSQL, la disponibilidad devolvió 503 en unos 2,6 segundos y el proceso siguió respondiendo 200. Docker pasó a `unhealthy` y volvió a `healthy` al reanudar la base, sin reiniciar la API. SIGTERM y SIGINT cerraron la conexión a PostgreSQL antes de terminar el contenedor.

Con la imagen actualizada y las variables privadas se verificó aparte el arranque con Supabase. `GET /api/health/ready` devolvió 200 después de la consulta de solo lectura. La comprobación no aplicó cambios de esquema ni cargó datos.

La especificación y las evidencias del bloque están en [salud y cierre de la API](../openspec/changes/preparar-salud-cierre/tasks.md).

## Bloque C · HTTPS y comunicaciones

- [x] Configurar Caddy para gestionar HTTPS.
- [x] Usar localhost durante las pruebas y permitir configurar el dominio público posteriormente.
- [x] Encauzar /api y /api/* directamente al backend.
- [x] Encauzar /socket.io/* conservando las conexiones WebSocket.
- [x] Conservar las rutas del frontend al recargar una página.
- [x] Compartir la política de orígenes permitidos entre HTTP y Socket.IO.
- [x] Verificar el protocolo y la dirección del cliente detrás del proxy.
- [x] Comprobar HTTPS local confiando expresamente en la autoridad de prueba de Caddy.
- [x] Publicar el avance del bloque C en `main` con el commit `feat(deploy): proteger orígenes y confianza en Caddy`.

Compose de producción deriva el origen permitido de `https://${APP_DOMAIN}` y configura Express para confiar en el salto de Caddy. Caddy publica la entrada HTTPS y establece el protocolo y la dirección que observa en la conexión entrante. El Compose de desarrollo conserva los orígenes locales y permite ajustar `WEB_ALLOWED_ORIGINS` si se usa otra dirección. La confianza en el proxy debe revisarse si se agrega un balanceador por delante de Caddy.

El 19 de noviembre de 2026 se comprobaron por HTTPS la navegación React, el preflight, la API y Socket.IO autenticado por polling y WebSocket. El sitio configurado funcionó y los orígenes externos se rechazaron. Una conexión sin token también se rechazó. Un cliente dentro de la red Docker confirmó que Express reconoce su IP y HTTPS cuando Caddy recibe cabeceras alteradas. El flujo de consentimiento guardó la IP observada en una base PostgreSQL desechable.

Pasaron las seis suites de regresión con PostgreSQL temporal, sin `--forceExit`. También pasaron las nueve pruebas específicas de comunicaciones después de comprobar un formato adicional de URL inválida. La verificación con dominio público y cámara en un navegador queda para las etapas siguientes. Los detalles están en [comunicaciones de producción](../openspec/changes/preparar-comunicaciones-produccion/tasks.md).

## Bloque D · Verificación final

- [ ] Reconstruir e iniciar el conjunto completo siguiendo las instrucciones compartidas.
- [ ] Verificar Supabase mediante consultas de solo lectura desde la API contenedorizada.
- [ ] Probar navegación, cámara, modelos y WASM mediante HTTPS.
- [ ] Probar autenticación, consentimiento, supervisión y reportes con datos aislados.
- [ ] Comprobar el rechazo de orígenes externos.
- [ ] Comprobar el arranque con variables ausentes y conexión inválida.
- [ ] Probar indisponibilidad y recuperación de la base mediante la ruta de salud.
- [ ] Verificar reinicios, cierre ordenado y persistencia de certificados.
- [ ] Probar actualización y recuperación de una imagen anterior.
- [ ] Repetir la auditoría de dependencias y registrar su fecha y resultado.

## Bloque E · Entrega y publicación posterior

- [ ] Completar la guía de configuración, construcción, arranque, registros, salud, parada y recuperación.
- [ ] Registrar los commits de cada bloque y los problemas abiertos.
- [ ] Comprobar que otro integrante puede reproducir el arranque siguiendo la guía.
- [ ] Planificar con el equipo el servicio AWS, su tamaño, dominio, presupuesto de créditos y accesos necesarios.

AWS es obligatorio para el proyecto y se prioriza aprovechar los beneficios gratuitos de la cuenta. El saldo y el periodo disponible se volverán a consultar antes de elegir recursos. La instancia case-platform-server pertenece a otro proyecto y requiere evaluar su carga y almacenamiento antes de decidir su aprovechamiento.

Las credenciales se conservan en archivos privados o en el entorno. Este documento contiene los nombres de las variables y los procedimientos para obtenerlas.

La preparación se considerará terminada cuando el conjunto funcione localmente con Docker y HTTPS, sus verificaciones estén registradas y otro integrante pueda reproducir el arranque.
