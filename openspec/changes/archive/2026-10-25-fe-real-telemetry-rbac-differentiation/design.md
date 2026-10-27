# Design

## Context

El usuario detectó que las notificaciones toast permanecen estáticas solapando la interfaz, que existen fallas responsivas de envoltura en insignias y migas de pan, que `PaginaMiErgonomia` recurría a datos estáticos ficticios y que `SUPER_ADMINISTRADOR` y `ADMIN_ORGANIZACION` visualizaban la misma interfaz sin una jerarquía de permisos nítida.

## Goals / Non-Goals

**Goals:**
- **Auto-cierre inteligente de Toasts:** Desvanecer y cerrar automáticamente las notificaciones de éxito a los 4 segundos (y de error a los 6 segundos) con transición de salida fluida.
- **Corrección de Insignias y Tipografía:**
  - Garantizar `whitespace-nowrap` y alineación `inline-flex items-center` en `Insignia.tsx` para evitar que el indicador de punto verde quede aislado sobre la palabra "Activo".
  - Usar un separador vectorial SVG (`ChevronRight`) en `BarraNavegacion.tsx` para evitar fallas de renderizado de fuentes en Windows.
- **Diferenciación de Vistas por Rol Administrativo:**
  - `SUPER_ADMINISTRADOR`: Vista maestra de plataforma SaaS con Directorio Global de Empresas (`/organizaciones` lista todos los tenants de Supabase con estadísticas globales) y Registro de Auditoría Forense (`AuditLog`).
  - `ADMIN_ORGANIZACION`: Vista aislada de tenant (`/organizaciones` solo permite gestionar el perfil de su propia entidad y sus departamentos internos).
- **Telemetría Postural Real desde Base de Datos:**
  - Implementar endpoint `GET /api/ergonomia/resumen` que consulte `ErgonomicSession` en Prisma por `userId`.
  - Calcular métricas reales (promedio RULA/REBA, tiempo acumulado, pausas cumplidas) o mostrar estado de inicio genuino cuando no existan sesiones.
- **Mantener Límite de 250 Líneas y Cero Emojis.**

**Non-Goals:**
- No se alteran los esquemas de bases de datos existentes ni se elimina la retrocompatibilidad con los guardias de seguridad.

## Decisions

### Decisión 1: Temporizador de Descarte Automático en `ContextoNotificacion.tsx`
- **Elección:** Añadir un `useEffect` con temporizador automático de 4,000 ms para alertas de éxito y 6,000 ms para errores.
- **Justificación:** Resuelve de raíz el solapamiento visual que incomodaba al usuario al navegar por los módulos.

### Decisión 2: Separación de Experiencia para Super Administrador vs. Admin de Organización
- **Elección:** En `BarraLateral.tsx` y `PaginaOrganizaciones.tsx`, discriminar si el usuario tiene rol `SUPER_ADMINISTRADOR`:
  - Si es `SUPER_ADMINISTRADOR`: El menú muestra "Directorio de Clientes" y la página renderiza la lista de todas las empresas de la base de datos (con conteo de usuarios y departamentos por tenant).
  - Si es `ADMIN_ORGANIZACION`: El menú muestra "Mi Organización" y renderiza únicamente el formulario de su empresa y la gestión de sus departamentos propios.
- **Justificación:** Modela una plataforma SaaS B2B real donde el dueño del software tiene vista global multi-tenant y el cliente solo ve su espacio corporativo.

### Decisión 3: Integración de Telemetría Real en `PaginaMiErgonomia.tsx`
- **Elección:** Consumir datos reales desde `GET /api/ergonomia/resumen` y sembrar sesiones reales para `juan.matienzo@visitask.com` en Supabase.
- **Justificación:** Erradica cualquier número simulado fijo y conecta la pantalla directamente con el modelo `ErgonomicSession`.

## Risks / Trade-offs

- **[Riesgo: El usuario desea revisar con calma un código de error antes de que desaparezca]** → **Mitigación:** Los errores duran 6 segundos y se registran en la consola y logs forenses con su `errorReference`.
