# Proposal

## Why

La auditoría de seguridad y control de acceso (OWASP A01:2021 — Broken Access Control) ha identificado que el frontend actual expone todas las rutas y opciones de menú a todos los usuarios autenticados sin distinción de rol. Un postulante o un empleado operativo puede acceder a la configuración de la organización, ver el listado de miembros o intentar contratar suscripciones. Asimismo, las pantallas de autenticación requieren evolucionar hacia una presentación visual split-card de nivel empresarial inspirada en el estándar de diseño corporativo moderno (ilustración SVG técnica en panel lateral, control de visibilidad de contraseña y navegación fluida).

## What Changes

- **Rediseño Profesional de Autenticación (Split-Card Modal):**
  - Implementación de un diseño de tarjeta dividida en dos columnas para `PaginaInicioSesion` y `PaginaRegistro`.
  - Panel izquierdo: Ilustración SVG distintiva de telemetría y ergonomía en el puesto de trabajo, insignia flotante de certificación criptográfica ("TLS 1.3 & Biometría Local"), encabezado de marca y atmósfera visual suave.
  - Panel derecho: Formulario de alta fidelidad con inputs limpios, selector de visualización de contraseña (ojo interactivo show/hide), checkbox "Recordarme", enlace "¿Olvidaste tu contraseña?", botón principal de acción y selector de roles para pruebas rápidas sin botones innecesarios de proveedores externos.
- **Segregación Estricta de Roles en el Frontend (RBAC Guard & Dynamic Routing):**
  - Creación del componente protector `RutaProtegidaPorRol.tsx` que valida `usuario.rol` antes de renderizar cualquier vista sensible.
  - Si un usuario con rol no autorizado (ej: `POSTULANTE` o `EMPLEADO`) intenta ingresar a `/organizaciones`, `/usuarios` o `/suscripciones`, es redirigido automáticamente a su portal correspondiente o recibe una vista de acceso denegado con código de incidente `ERR_FORBIDDEN_ROLE`.
- **Navegación Dinámica por Rol en `BarraLateral.tsx`:**
  - Los enlaces de navegación se filtran dinámicamente según el rol institucional:
    - **`ADMIN_ORGANIZACION` & `SUPER_ADMINISTRADOR`:** Panel General, Organización, Equipo y Roles, Planes y Facturación.
    - **`SUPERVISOR`:** Monitoreo Ergonómico de Equipo, Reportes SST y Panel General.
    - **`EMPLEADO`:** Mi Ergonomía y Postura, Historial de Sesiones y Consentimiento Digital.
    - **`POSTULANTE`:** Portal de Evaluación Supervisada, Verificación de Dispositivos y Consentimiento.
- **Portales Específicos para Roles No Administrativos:**
  - Creación de vistas base para `PaginaPortalPostulante.tsx` (sala de espera y verificación de cámara para examen) y `PaginaMiErgonomia.tsx` (portal individual del colaborador con telemetría de postura).

## Capabilities

### New Capabilities
- `auth-experience`: Interfaz de autenticación profesional split-card con ilustración técnica SVG, controles avanzados de contraseña y feedback de estado.

### Modified Capabilities
- `identity-access`: Incorporación de segregación estricta de rutas y componentes por rol en la capa de presentación (RBAC client-side guard).

## Impact

- **Frontend:** Modificación de `frontend/src/routes/AppRoutes.tsx`, `frontend/src/components/layout/BarraLateral.tsx`, `frontend/src/pages/auth/PaginaInicioSesion.tsx`, `frontend/src/pages/auth/PaginaRegistro.tsx`.
- **Nuevos Componentes:** `RutaProtegidaPorRol.tsx`, `IlustracionAuth.tsx`, `PaginaPortalPostulante.tsx`, `PaginaMiErgonomia.tsx`.
- **Backend:** Cero cambios destructivos; se aprovechan los roles existentes (`Rol` enum en Prisma) y la firma JWT.
