# Guía de entrega y operación de ErgoCheck AI

El punto de partida verificado es el commit `c6f62f4` de `main`. Docker Compose ejecuta la API, el frontend y Caddy. Supabase conserva PostgreSQL. El procedimiento de AWS sigue en [el plan para la demo](PLAN_INFRAESTRUCTURA_AWS.md) y el avance en [el plan de despliegue](PLAN_DESPLIEGUE_AWS.md).

## Reproducir el arranque desde GitHub

Se necesita Git, Docker con contenedores Linux y Docker Compose v2. En Windows, iniciar Docker Desktop con WSL 2 y comprobar `docker version` y `docker compose version`. Liberar los puertos 80 y 443 si ya los usa otro servicio.

```powershell
git clone --branch main --single-branch https://github.com/marcolop450/SW_Proyecto_Final.git
cd SW_Proyecto_Final
git checkout --detach c6f62f4
Copy-Item .env.production.example .env.production
git check-ignore .env.production
```

Si ya existe un clon con trabajo local, usar otra carpeta para el ensayo. Para preparar otra versión, sustituir `c6f62f4` por el commit que el equipo acuerde desplegar. Editar `.env.production` en privado.

| Variable | Valor para el ensayo |
| --- | --- |
| `APP_DOMAIN` | `localhost` |
| `BIND_ADDRESS` | `127.0.0.1` |
| `RELEASE_TAG` | `c6f62f4` o el commit seleccionado |
| `DATABASE_URL`, `DIRECT_URL` | Conexiones privadas al mismo proyecto, base y esquema |
| `JWT_SECRET` | Secreto aleatorio distinto para cada entorno, de al menos 32 caracteres |
| `JWT_EXPIRES_IN` | `7d` en la plantilla |

Para las dos conexiones, en Supabase abrir **Connect → Session pooler** y usar la URI de PostgreSQL en el puerto 5432. Incorporar la contraseña de base de datos, codificar sus caracteres reservados para URL y conservar `sslmode=require` y `connect_timeout=20` en las opciones. Pedir acceso al proyecto al responsable de Supabase. [Conexión a PostgreSQL en Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).

En PowerShell se puede generar el secreto para copiarlo al archivo privado mediante `$bytes = New-Object byte[] 32; $rng = [Security.Cryptography.RandomNumberGenerator]::Create(); $rng.GetBytes($bytes); $rng.Dispose(); [BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()`. En Linux, usar `openssl rand -hex 32`. Compose da prioridad al entorno de la terminal. Si hay variables del mismo nombre en la sesión, quitarlas o abrir una terminal limpia antes de usar el archivo.

```powershell
docker compose --env-file .env.production -f compose.production.yml config --quiet
docker compose --env-file .env.production -f compose.production.yml build
docker compose --env-file .env.production -f compose.production.yml up -d --no-build --wait --wait-timeout 90
docker compose --env-file .env.production -f compose.production.yml ps
```

La API debe aparecer `healthy`, el frontend y Caddy en ejecución. Para comprobar HTTPS local, extraer el certificado público de la autoridad local de Caddy y pasarlo a curl en cada llamada. El curl de Windows con Schannel puede necesitar `--ssl-revoke-best-effort` porque esta autoridad de prueba carece de puntos de distribución de revocación. La CA y el nombre del servidor se siguen validando. En Linux usar `mkdir -p .cache`, `curl` y `/dev/null` en lugar de los comandos de Windows, y omitir la opción de Schannel. [Manual de curl](https://curl.se/docs/manpage.html#--ssl-revoke-best-effort).

```powershell
New-Item -ItemType Directory -Force .cache | Out-Null
docker compose --env-file .env.production -f compose.production.yml cp caddy:/data/caddy/pki/authorities/local/root.crt .cache/caddy-local.crt
curl.exe --fail --show-error --ssl-revoke-best-effort --cacert .cache/caddy-local.crt https://localhost/api/health/live
curl.exe --fail --show-error --ssl-revoke-best-effort --cacert .cache/caddy-local.crt https://localhost/api/health/ready
curl.exe --fail --show-error --ssl-revoke-best-effort --cacert .cache/caddy-local.crt https://localhost/mi-ergonomia -o NUL -w 'HTTP %{http_code}'
```

`live` debe devolver HTTP 200 con `{"estado":"activo"}`. `ready` debe devolver 200 con `{"estado":"disponible"}`, o 503 si PostgreSQL no responde. `/mi-ergonomia` comprueba que Caddy y Nginx sirven una ruta React. Para probar cámara en navegador local, usar un perfil de prueba que confíe en la autoridad local extraída. Para las pruebas que escriben (registro, consentimiento, reportes o supervisión), usar una base desechable y verificar su destino antes de cargar datos. [HTTPS automático de Caddy](https://caddyserver.com/docs/automatic-https).

## Registros, parada y diagnóstico

```powershell
docker compose --env-file .env.production -f compose.production.yml logs --tail 100 backend caddy
docker compose --env-file .env.production -f compose.production.yml stop
docker compose --env-file .env.production -f compose.production.yml down
```

`stop` permite volver a iniciar los contenedores. `down` retira contenedores y red, conservando los volúmenes de Caddy. Al operar un servicio que debe conservar sus certificados, omitir `--volumes`. Revisar los registros antes de compartirlos.

| Síntoma | Comprobación |
| --- | --- |
| El puerto ya está ocupado | Ejecutar `docker ps` y comprobar quién usa 80 o 443. |
| La API no arranca | Consultar los registros y verificar URI, contraseña, destino y secreto JWT. |
| `live` responde y `ready` devuelve 503 | Revisar la disponibilidad de Supabase y la conexión de salida al Session pooler. |
| El navegador rechaza el certificado local | Usar la autoridad del proyecto actual en el perfil de prueba. El dominio público usará su certificado público. |
| La conexión WebSocket se rechaza | Comparar protocolo, host y puerto del sitio con el origen derivado de `APP_DOMAIN`. |

## Actualizar y volver a la versión anterior

1. Guardar la etiqueta activa de ambas imágenes y la versión de `compose.production.yml` y `deploy/Caddyfile`. Conservar las imágenes, los archivos de configuración y los volúmenes de Caddy.
2. Construir o importar ambas imágenes con la etiqueta nueva. Seleccionarla con `RELEASE_TAG` y ejecutar `config --quiet` y `up -d --no-build --wait --wait-timeout 90`.
3. Comprobar el frontend, `live`, `ready` y una operación de lectura. Revisar los registros.
4. Si falla, usar los archivos de la versión anterior y su `RELEASE_TAG`, conservando el mismo nombre de proyecto Compose. Volver a ejecutar `up -d --no-build --wait --wait-timeout 90` y repetir las comprobaciones. Si una versión cambia el esquema, comprobar compatibilidad y respaldo antes de cambiar imágenes.

## Registro de entrega

| Bloque | Commit o referencia |
| --- | --- |
| Preparación de imágenes | `843d229` |
| Corrección de dependencias del backend | `99a5dd7` |
| A · Producción con Supabase | `033921b` |
| B · Salud y cierre | `51ae697` |
| C · HTTPS y comunicaciones | `35f6ec0` |
| D · Verificación local y liberación de periféricos | `c6f62f4`, que incorpora la base `45b22dd` |
| E · Entrega | Evidencia en el plan de despliegue |

Para que otra persona del equipo confirme la entrega, debe clonar desde GitHub en su propio equipo, configurar sus variables privadas y registrar el commit, la fecha, la versión de Docker y el resultado de `ps`, `live`, `ready` y la ruta web. Basta con compartir los estados y mensajes. Quedan pendientes esa reproducción independiente, la validación del dominio público, una prueba con cámara física y el despliegue en AWS.

La revisión de preparación también identificó que [la consulta de la bitácora](../backend/src/modules/supervision/supervision-sp4.controller.ts) admite al administrador de organización y llama a [un servicio](../backend/src/modules/supervision/services/bitacora-inmutable.service.ts) sin pasar un filtro de organización. La demo debe usar datos sintéticos en un proyecto aislado. Antes de usar datos reales de varias organizaciones, verificar y corregir, si procede, el aislamiento de la bitácora.
