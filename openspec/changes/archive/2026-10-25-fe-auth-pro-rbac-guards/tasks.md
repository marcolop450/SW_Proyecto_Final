# Tasks

## 1. Componente de Seguridad de Enrutamiento y Guard de Roles

- [x] 1.1 Crear `RutaProtegidaPorRol.tsx` en `frontend/src/auth/components/` para verificar los roles permitidos y redirigir usuarios no autorizados a su vista predeterminada según rol
- [x] 1.2 Actualizar `frontend/src/routes/AppRoutes.tsx` para proteger `/organizaciones`, `/usuarios` y `/suscripciones` exclusivamente para `ADMIN_ORGANIZACION` y `SUPER_ADMINISTRADOR`, e incorporar rutas `/portal-evaluacion` y `/mi-ergonomia`

## 2. Adaptación de Navegación Lateral por Rol

- [x] 2.1 Modificar `frontend/src/components/layout/BarraLateral.tsx` para filtrar los enlaces del menú según el rol activo del usuario (`POSTULANTE`, `EMPLEADO`, `SUPERVISOR`, `ADMIN_ORGANIZACION`, `SUPER_ADMINISTRADOR`)
- [x] 2.2 Verificar que el usuario no visualice módulos ajenos a sus permisos en el menú lateral ni en el pie de página de la navegación

## 3. Vistas de Portales Especializados por Rol

- [x] 3.1 Implementar `PaginaPortalPostulante.tsx` en `frontend/src/features/evaluaciones/` con verificación de sala de espera para evaluaciones, comprobación de cámara y estado de convocatoria
- [x] 3.2 Implementar `PaginaMiErgonomia.tsx` en `frontend/src/features/ergonomia/` con panel personal de telemetría postural, calibración de puesto de trabajo y pausas activas para empleados

## 4. Rediseño Visual Split-Card de Autenticación

- [x] 4.1 Crear `IlustracionAuth.tsx` en `frontend/src/auth/components/` con ilustración vectorial SVG de puesto de trabajo ergonómico, telemetría biométrica e insignias de seguridad
- [x] 4.2 Rediseñar `frontend/src/auth/pages/PaginaInicioSesion.tsx` en formato split-card moderno con control de visibilidad de contraseña (ojo interactivo), recordatorio de sesión y selector rápido de roles QA sin botón de Google
- [x] 4.3 Rediseñar `frontend/src/auth/pages/PaginaRegistro.tsx` en formato split-card consistente con validación visual, selector de perfiles e integración de identidad de marca

## 5. Verificación de Calidad QA, Límites de Líneas y Auditoría de Seguridad

- [x] 5.1 Verificar que todos los archivos modificados o creados cumplan estrictamente con el límite de 250 líneas y cero emojis
- [x] 5.2 Ejecutar suite de pruebas de frontend y backend (`qa-runner.js`) validando que la autenticación, roles y enrutamiento operen con 100% de éxito

## Workflow follow-up

- Archivar la propuesta tras aprobación y validación exitosa de todas las tareas.
