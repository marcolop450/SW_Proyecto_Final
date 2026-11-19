## 1. Seguimiento

- [x] 1.1 Guardar el plan compartido con el estado verificado y las tareas pendientes.

## 2. Configuración de producción

- [x] 2.1 Crear Compose con Supabase, API, frontend y entrada Caddy.
- [x] 2.2 Incorporar plantilla privada, variables obligatorias y etiquetas de imagen.
- [x] 2.3 Configurar puertos internos, registros con rotación, reinicios y volúmenes.
- [x] 2.4 Validar el secreto JWT de producción.

## 3. Verificación

- [x] 3.1 Comprobar validación de variables vacías y secreto corto.
- [x] 3.2 Construir e iniciar el conjunto con el Compose nuevo.
- [x] 3.3 Verificar HTTPS local, rutas React y API con la autoridad de Caddy.
- [x] 3.4 Verificar conexiones a Supabase en modo de solo lectura y puertos publicados.
- [x] 3.5 Comprobar exclusión de secretos, registros y reinicios.

## Resultados

Verificado el 18 de noviembre de 2026 en Docker Desktop con contenedores Linux y Node 24:

- Cinco pruebas de configuración JWT aprobadas; rechazo del secreto corto también comprobado dentro de la imagen.
- Construcción y arranque de API, frontend y Caddy con `compose.production.yml` y variables privadas.
- Rechazo individual de las cinco variables obligatorias vacías mediante `config --quiet`.
- HTTP 308 hacia HTTPS, certificado validado con la autoridad local, rutas React, API y archivos de visión accesibles.
- Conexión Socket.IO por WebSocket seguro y rechazo del cliente sin token.
- Ambas conexiones Prisma comprobadas dentro de transacciones de solo lectura en Supabase.
- Solo Caddy publica puertos; los tres servicios usan reinicio automático y registros limitados.
- Autoridad persistente después de recrear Caddy. Retirados los recursos temporales de comprobación.
- `.env.production` excluido de Git y archivos `.env*` excluidos de ambos contextos Docker.

La salud, el cierre ordenado, la política de orígenes y las pruebas finales permanecen pendientes en [el plan compartido](../../../docs/PLAN_DESPLIEGUE_AWS.md).
