# Design

## Context

La auditoría de seguridad del frontend identificó que el router de la aplicación (`AppRoutes.tsx`) permitía a cualquier usuario autenticado navegar hacia `/organizaciones`, `/usuarios` o `/suscripciones`, lo que representa una falla de Broken Access Control (OWASP Top 10 A01:2021). Usuarios con roles como `POSTULANTE` o `EMPLEADO` no deben acceder a opciones de configuración del tenant, facturación ni lista de colaboradores. Adicionalmente, el diseño de inicio de sesión y registro debe elevarse a un formato split-card profesional con ilustración técnica SVG en el panel izquierdo (adaptada a SST, telemetría y proctoring), control de visibilidad de contraseña (ojo interactivo) y recordación de credenciales.

## Goals / Non-Goals

**Goals:**
- Implementar `RutaProtegidaPorRol.tsx` como guard de navegación para restringir el acceso a vistas según los roles institucionales del token JWT.
- Redirigir automáticamente a cada usuario a su vista principal correspondiente:
  - `POSTULANTE` → `/portal-evaluacion` (Portal de examen y verificación de cámara).
  - `EMPLEADO` → `/mi-ergonomia` (Portal personal de postura y pausas activas).
  - `SUPERVISOR` → `/dashboard` (Monitoreo ergonómico de equipo y reportes SST).
  - `ADMIN_ORGANIZACION` & `SUPER_ADMINISTRADOR` → `/dashboard` (Control total de organización, usuarios y planes).
- Adaptar dinámicamente los enlaces de la `BarraLateral.tsx` para mostrar exclusivamente las herramientas autorizadas para cada rol.
- Rediseñar `PaginaInicioSesion.tsx` y `PaginaRegistro.tsx` adoptando el patrón split-card (tarjeta dividida en 2 columnas):
  - Panel izquierdo: `IlustracionAuth.tsx` con gráficos vectoriales SVG de telemetría y ergonomía en el puesto de trabajo, insignia flotante ("Cifrado TLS 1.3 & Inferencia en RAM") y fondo suave.
  - Panel derecho: Formulario de alta conversión con icono de ojo para mostrar/ocultar contraseña, checkbox "Recordarme", enlace a recuperación y selector rápido de roles para pruebas QA.
- Mantener estrictamente el límite de 250 líneas por archivo, cero emojis y observabilidad unificada.

**Non-Goals:**
- No se implementa botón ni proveedor de Google OAuth (se respeta la instrucción explícita del usuario de no incorporar botones sin autenticación backend configurada).
- No se alteran los esquemas de Prisma ni la lógica de controladores del backend.

## Decisions

### Decisión 1: Guard de Rutas por Rol (`RutaProtegidaPorRol.tsx`)
- **Elección:** Envolver rutas privadas con `<RutaProtegidaPorRol rolesPermitidos={[Rol.ADMIN_ORGANIZACION, Rol.SUPER_ADMINISTRADOR]} />`.
- **Justificación:** Si un postulante o empleado intenta navegar manualmente a `/usuarios` o `/suscripciones`, el guard intercepta la solicitud y lo redirige a su portal legítimo (`/portal-evaluacion` o `/mi-ergonomia`), previniendo fugas de información interna de la empresa.

### Decisión 2: Desacoplamiento de `IlustracionAuth.tsx`
- **Elección:** Crear un componente independiente `IlustracionAuth.tsx` que aloje el SVG vectorial y las capas decorativas para el panel lateral de autenticación.
- **Justificación:** Previene que `PaginaInicioSesion.tsx` supere el límite de 250 líneas y permite reutilizar la misma identidad visual en `PaginaRegistro.tsx`.

### Decisión 3: Menú Lateral Dinámico por Rol
- **Elección:** Definir una matriz de permisos de navegación en `BarraLateral.tsx`:
  - Los postulantes solo visualizan: "Portal de Examen" y "Mis Evaluaciones".
  - Los empleados solo visualizan: "Mi Ergonomía", "Historial de Postura".
  - Los supervisores visualizan: "Panel General", "Monitoreo SST".
  - Los administradores visualizan: "Panel General", "Organización", "Equipo y Roles", "Planes y Facturación".
- **Justificación:** Reduce drásticamente la carga cognitiva y garantiza que el usuario solo interactúe con las herramientas correspondientes a su perfil.

## Risks / Trade-offs

- **[Riesgo: Navegación directa por URL en el navegador]** → **Mitigación:** `RutaProtegidaPorRol` valida la sesión y el rol en cada renderizado de ruta antes de montar el componente hijo.
- **[Riesgo: Desbordamiento en pantallas móviles en el diseño split-card]** → **Mitigación:** En pantallas menores a `lg:` (1024px), el panel decorativo izquierdo se oculta limpiamente y el formulario ocupa el 100% del ancho disponible sin overflow.
