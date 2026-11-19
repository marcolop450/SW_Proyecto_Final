## Why

El Compose existente inicia PostgreSQL local y hace depender de ese servicio al backend. El despliegue acordado requiere Supabase y una configuración privada, reproducible y verificable desde otro equipo.

## What Changes

- Incorporar un Compose independiente con API, frontend Nginx y entrada HTTPS Caddy.
- Solicitar explícitamente las conexiones, el secreto JWT, el dominio y la etiqueta de las imágenes.
- Conservar un archivo de variables privado y una plantilla compartida.
- Exigir al menos 32 caracteres para el secreto JWT de producción.
- Configurar registros con rotación, reinicios y volúmenes para certificados.
- Centralizar el plan de seguimiento con tareas completadas, pendientes y evidencias.

## Capabilities

### New Capabilities
- `production-configuration`: configuración del conjunto de producción con Supabase.

### Modified Capabilities

## Impact

La nueva configuración se selecciona mediante compose.production.yml. Las primeras pruebas se vinculan a la interfaz local y consultan Supabase en modo de solo lectura. La entrada Caddy anticipa las rutas necesarias para comprobar este Compose.
