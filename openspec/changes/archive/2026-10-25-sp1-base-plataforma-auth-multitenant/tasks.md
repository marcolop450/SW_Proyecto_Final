# Tasks

## 1. Setup, Infraestructura y Observabilidad de Errores

- [x] 1.1 Inicializar estructura limpia de monorepo en `backend` (NestJS) y `frontend` (React 19 + Vite) y verificar que ambos proyectos compilen sin errores.
- [x] 1.2 Configurar `schema.prisma` con modelos de Sprint 1 (`Usuario`, `Organizacion`, `Departamento`, `UsuarioOrganizacion`, `LegalConsent`, `Subscription`, `Invoice`) y ejecutar `npx prisma db push` contra Supabase verificando la creación de tablas.
- [x] 1.3 Crear script de seed `prisma/seed.ts` con contraseñas hasheadas en `bcryptjs` (salt 12) para los 6 roles institucionales y verificar que se inserten correctamente en Supabase.
- [x] 1.4 Implementar `AllExceptionsFilter` global en NestJS que capture todas las excepciones (400, 401, 403, 404, 409, 422, 429, 500), genere un `errorReference` único (ej: `ERR-A1B2C3D4`) y retorne el envelope JSON estándar verificando el registro de la credencial en logs.

## 2. Backend: Identidad, Seguridad y Multi-tenancy RBAC (CU01, CU02)

- [x] 2.1 Implementar `AuthModule` con endpoints `/api/auth/login`, `/api/auth/registro`, `/api/auth/perfil` y verificar que las contraseñas se comparen exclusivamente con `bcrypt.compare`.
- [x] 2.2 Configurar `JwtStrategy`, `JwtAuthGuard` global y decorador `@Public()` verificando con tests unitarios que peticiones sin token o con token alterado retornen 401 Unauthorized con `errorReference`.
- [x] 2.3 Implementar `OrganizacionesModule` y `UsuariosModule` con control `@Roles(...)` y `RolesGuard` verificando que un `ADMIN_ORGANIZACION` solo pueda listar y modificar usuarios de su propia organización.
- [x] 2.4 Implementar invitaciones de miembros y asignación de departamentos verificando que un usuario sin rol asignado reciba 403 Forbidden con envelope estándar.

## 3. Backend: Consentimiento Informado Digital y Guard (CU03)

- [x] 3.1 Implementar `ConsentimientoModule` con endpoints para consultar estado (`GET /api/consentimiento/estado`) y registrar firma digital (`POST /api/consentimiento/firmar`) capturando IP y User-Agent.
- [x] 3.2 Desarrollar `ConsentGuard` en NestJS y verificar mediante prueba automatizada que un endpoint protegido rechace con HTTP 403 `ERR_CONSENT_REQUIRED` y `errorReference` si no hay consentimiento activo.

## 4. Backend: Suscripciones y Facturación Sandbox (CU04, CU05)

- [x] 4.1 Implementar `SuscripcionesModule` con catálogo de planes (Por puesto, Pay-per-exam, Enterprise) y previsualización de costos prorrateados.
- [x] 4.2 Desarrollar endpoint de procesamiento de pagos en sandbox con webhook idempotente (`transactionId`) y emisión de comprobante digital numerado.
- [x] 4.3 Implementar política de reintentos y actualización de estado de suscripción (`ACTIVE`, `PAST_DUE`).

## 5. Frontend Modular Impeccable (React 19 + Tailwind CSS v4)

- [x] 5.1 Configurar `AppRoutes.tsx` con `React.lazy()` y `Suspense` para todas las rutas principales garantizando code-splitting.
- [x] 5.2 Implementar sistema de diseño Impeccable (Dark Tech: `#0B1020`, `#C6F432`, `emerald-500`, `rose-500`), prohibiendo cajas dentro de cajas y usando fondos contrastantes sutiles con componentes atómicos menores a 150 líneas.
- [x] 5.3 Implementar librería de iconos vectoriales con `lucide-react` en toda la aplicación, verificando la ausencia total de emojis y la eliminación de cualquier texto meta-contextual académico ("CUxx", "Sprint").
- [x] 5.4 Implementar componente global de Notificación y Modal de Error que consuma el envelope de error de la API, mostrando el mensaje amigable, código HTTP y un botón para copiar la credencial `errorReference`.
- [x] 5.5 Implementar `PaginaInicioSesion.tsx` y `PaginaRegistro.tsx` conectadas al backend real mediante `ContextoAutenticacion`.
- [x] 5.6 Implementar `PaginaOrganizaciones.tsx` y `PaginaUsuarios.tsx` con tablas responsivas fluidas (cero overflow horizontal) y modales desacoplados en archivos individuales de menos de 200 líneas.
- [x] 5.7 Implementar `ModalConsentimiento.tsx` que intercepte y bloquee la navegación si el usuario no tiene consentimiento vigente.
- [x] 5.8 Implementar `PaginaSuscripciones.tsx` con catálogo interactivo, cotizador en tiempo real y modal de pago sandbox.

## 6. Lista de Tareas de Reajuste para Sprints Futuros (Cross-Sprint Hooks)

- [x] 6.1 **[Hook para Sprint 2 - Calibración y Visión]**: Registrar en `tasks.md` de Sprint 2 la tarea de inyectar `ConsentGuard` en el controlador de calibración ergonómica y asociar la sesión de postura con el usuario autenticado.
- [x] 6.2 **[Hook para Sprint 3 - Anti-cheat y Cuotas]**: Registrar en `tasks.md` de Sprint 3 la validación de cuotas (`examsUsed` < `examsAllocated`) en `Subscription` antes de generar códigos temporales de examen.
- [x] 6.3 **[Hook para Sprint 4 - Auditoría WORM]**: Registrar en `tasks.md` de Sprint 4 la tarea de migrar y sellar con hash SHA-256 encadenado todos los eventos de auditoría generados en los logins y pagos del Sprint 1.

## 7. Pruebas de Integración y Cierre de Sprint 1

- [x] 7.1 Ejecutar suite de pruebas de autenticación y multi-tenant verificando aislamiento total entre dos organizaciones de prueba.
- [x] 7.2 Probar los escenarios de error HTTP (400, 401, 403, 404, 500) y comprobar que la consola registre la traza técnica vinculada al `errorReference` emitido al usuario.
- [x] 7.3 Auditar que ningún archivo del proyecto supere las 250 líneas de código, que no haya emojis en los archivos del frontend y que el código esté libre de comentarios AISLOP redundantes.
