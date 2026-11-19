## Context

Los Dockerfiles de Node 24 y las correcciones de dependencias están publicados hasta 99a5dd7. La conexión al Session pooler de Supabase ya fue comprobada. La salud, el cierre del watchdog y la restricción de orígenes siguen pendientes del plan.

## Goals / Non-Goals

Preparar una configuración que el equipo pueda iniciar con sus variables privadas, manteniendo las rutas y el diseño de la aplicación.

## Decisions

- Usar tres servicios en una red Docker compartida. Caddy recibe HTTP y HTTPS; el frontend y la API usan puertos internos.
- Vincular los puertos a 127.0.0.1 por defecto para las pruebas locales. La publicación posterior en AWS configurará BIND_ADDRESS=0.0.0.0 y su dominio.
- Identificar las imágenes con RELEASE_TAG y conservar volúmenes propios para datos y configuración de Caddy.
- Solicitar las variables mediante interpolación obligatoria de Compose y validar la longitud del secreto JWT dentro del backend.
- Usar localhost con la autoridad certificadora local de Caddy para comprobar HTTPS. El cliente de prueba confiará expresamente en esa autoridad.
- Conservar los archivos de entorno fuera de Git y de los contextos de las imágenes.

## Risks / Trade-offs

El Compose arranca los servicios con condition=service_started hasta que se implementen las comprobaciones de disponibilidad del bloque B. La política de orígenes y las pruebas de cámara en navegador corresponden a las siguientes tareas del plan. La configuración se considera una preparación local hasta completar esas verificaciones.

## Hook de Reajuste

La entrada Caddy y sus rutas se incluyen ahora porque el Compose necesita una entrada funcional para validar la API y el frontend. La siguiente etapa agregará las rutas de salud, el cierre ordenado y la política de orígenes usando este conjunto.
