# Seguimiento del despliegue en AWS

Proyecto ErgoCheck AI. Estado revisado el 18 de noviembre de 2026.

- Rama de trabajo `main`.
- Base publicada anterior al bloque A: `99a5dd7`.
- Bloque A implementado, verificado localmente y publicado en `main` con este documento.
- Commit de esta entrega: `build(deploy): configurar producción con Supabase y seguimiento` (consultable con `git log --oneline -- compose.production.yml`).
- Siguiente bloque **B · Salud y cierre ordenado**.
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

Las suites heredadas de supervisión se ejecutaron con `--forceExit` porque el watchdog conserva un temporizador después de cerrar la aplicación. El bloque B incluye su corrección.

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

- [ ] Terminar el arranque con un error si la conexión inicial con Supabase falla.
- [ ] Agregar GET /api/health/live con respuesta 200 mientras el proceso funciona.
- [ ] Agregar GET /api/health/ready con respuesta 200 si una consulta breve funciona y 503 si falla.
- [ ] Conservar el contrato existente de GET /api.
- [ ] Configurar la comprobación de disponibilidad en Docker y sus dependencias.
- [ ] Habilitar el cierre ordenado ante SIGTERM y SIGINT.
- [ ] Detener el watchdog y liberar conexiones al cerrar la aplicación.
- [ ] Ejecutar las suites correspondientes sin `--forceExit`.

## Bloque C · HTTPS y comunicaciones

- [x] Configurar Caddy para gestionar HTTPS.
- [x] Usar localhost durante las pruebas y permitir configurar el dominio público posteriormente.
- [x] Encauzar /api y /api/* directamente al backend.
- [x] Encauzar /socket.io/* conservando las conexiones WebSocket.
- [x] Conservar las rutas del frontend al recargar una página.
- [ ] Compartir la política de orígenes permitidos entre HTTP y Socket.IO.
- [ ] Verificar el protocolo y la dirección del cliente detrás del proxy.
- [x] Comprobar HTTPS local confiando expresamente en la autoridad de prueba de Caddy.

La entrada base de Caddy se prepara junto al bloque A porque el conjunto necesita una entrada funcional para sus comprobaciones. La cámara en navegador y la política de orígenes se verificarán en las tareas posteriores.

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
