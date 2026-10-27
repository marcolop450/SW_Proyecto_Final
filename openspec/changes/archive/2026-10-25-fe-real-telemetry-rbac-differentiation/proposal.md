# Proposal

## Why

El usuario ha identificado tres áreas críticas de mejora tras la revisión visual: (1) las notificaciones toast persistían indefinidamente en pantalla solapando encabezados; (2) existían desalineaciones responsivas (rotura de línea en insignias de planes y caracteres extraños en migas de pan); (3) `PaginaMiErgonomia` mostraba métricas posturales fijas simuladas en lugar de consumir sesiones reales de la base de datos; y (4) no existía una distinción arquitectónica clara en la interfaz entre `SUPER_ADMINISTRADOR` (administrador maestro de la plataforma SaaS) y `ADMIN_ORGANIZACION` (administrador exclusivo de su propio tenant).

## What Changes

- **Auto-cierre de Notificaciones Toast:** Configuración de temporizador automático de 4 segundos con animación de salida suave en el sistema de feedback.
- **Correcciones Responsivas y de Alineación:**
  - Inclusión de `whitespace-nowrap` y `shrink-0` en `Insignia.tsx` para evitar que insignias como "Plan Activo" se desalineen o separen su punto de estado del texto.
  - Reemplazo del separador tipográfico en `BarraNavegacion.tsx` por un icono vectorial SVG limpio (`ChevronRight`) que previene caracteres rotos.
- **Diferenciación Estricta de Roles Administrativos (RBAC Real):**
  - **`SUPER_ADMINISTRADOR` (Nivel Plataforma SaaS):** Acceso al Directorio Global de Empresas Cliente, Registro Forense de Auditoría de toda la plataforma (`AuditLog`) y Métricas Globales de Negocio.
  - **`ADMIN_ORGANIZACION` (Nivel Tenant Aislado):** Acceso restringido exclusivamente al perfil de su propia empresa, sus departamentos internos, su equipo de colaboradores y su suscripción corporativa.
- **Telemetría Ergonómica Real desde Base de Datos:**
  - Implementación de endpoint y servicio de resumen ergonómico conectado a la tabla `ErgonomicSession` en Supabase.
  - Visualización de datos reales acumulados por usuario o estado vacío auténtico ("0 sesiones registradas hoy") cuando no existan capturas previas.

## Capabilities

### New Capabilities
- `ergonomic-telemetry`: Provee endpoints y componentes para consumir sesiones de postura ergonómica reales de la base de datos PostgreSQL.

### Modified Capabilities
- `identity-access`: Segmenta las interfaces y permisos entre Super Administrador de Plataforma y Administrador de Organización.
- `design-system`: Introduce temporizadores de auto-cierre en notificaciones y blindaje contra desbordamientos tipográficos en badges e insignias.

## Impact

- Frontend: `ContextoNotificacion.tsx`, `NotificacionError.tsx`, `Insignia.tsx`, `BarraNavegacion.tsx`, `BarraLateral.tsx`, `PaginaMiErgonomia.tsx`, `PaginaOrganizaciones.tsx`, `AppRoutes.tsx`.
- Backend: Módulo ergonómico para consulta de sesiones de usuario (`/api/ergonomia/resumen`).
