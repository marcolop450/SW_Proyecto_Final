# Proposal

## Why
El proyecto de vigilancia y salud ergonómica ErgoCheck AI requiere una base fundacional con seguridad de grado de producción, arquitectura multi-tenant estricta y cumplimiento de consentimiento legal informado (CU01–CU05). La versión previa del repositorio contenía credenciales quemadas en texto plano, tokens JWT decodificados en Base64 sin validación criptográfica, monolitos de más de 1,000 líneas y falta de observabilidad de errores. Esta propuesta refactoriza desde cero la base del sistema con NestJS, Prisma ORM conectado a Supabase, Guards reales (`JwtAuthGuard`, `RolesGuard`, `ConsentGuard`), un sistema de trazabilidad de errores con credenciales de incidente (`errorReference`), y una interfaz modular en React 19 comercial B2B SaaS bajo el estándar Impeccable (cero monolitos, sin cuadros dentro de cuadros, sin emojis, sin meta-contexto académico y con código limpio anti-AISLOP).

## What Changes
- **Arquitectura de Base y Multi-tenancy**:
  - Modelado de base de datos relacional en PostgreSQL (Supabase) con Prisma ORM para Organizaciones, Departamentos, Usuarios y Membresías RBAC (`SUPER_ADMINISTRADOR`, `ADMIN_ORGANIZACION`, `SUPERVISOR`, `EVALUADOR`, `EMPLEADO`, `POSTULANTE`).
  - Scoping obligatorio de consultas por `organizationId` para garantizar aislamiento estricto de tenants.
- **Autenticación y Seguridad DevSecOps**:
  - Hash seguro de contraseñas con `bcryptjs` (cost factor 12) sin usuarios en memoria ni claves fijas.
  - Autenticación JWT con firma criptográfica, soporte de refresh tokens y `JwtAuthGuard` global con decorador `@Public()`.
  - Autorización basada en roles mediante `@Roles(...)` y `RolesGuard` verificando permisos organizacionales.
- **Consentimiento Informado Digital**:
  - Registro de aceptación de consentimiento con IP, User-Agent, tipo y versión legal.
  - Implementación de `ConsentGuard` que intercepta y bloquea con 403 `ERR_CONSENT_REQUIRED` cualquier acceso a sesiones o telemetría si no existe consentimiento vigente.
- **Manejo Global de Errores con Credencial de Rastreo**:
  - Filtro global de excepciones en NestJS que estandariza todas las respuestas (400, 401, 403, 404, 409, 422, 429, 500) en un envelope JSON con `statusCode`, `errorCode`, `message`, `errorReference` (UUID/Hash único para logs de auditoría) y `timestamp`.
  - Frontend con notificaciones amigables que informan el error sin exponer trazas técnicas crudas, entregando el `errorReference` para soporte.
- **Suscripciones y Facturación SaaS**:
  - Catálogo de planes (Por Puesto, Pay-Per-Exam, Enterprise Custom) con previsualización dinámica de costo y vigencia.
  - Integración de pasarela de pago en modo sandbox con webhook idempotente, reintentos de cobro y emisión de comprobantes digitales.
- **Frontend Modular Impeccable (React 19 + Tailwind CSS v4)**:
  - Rutas separadas mediante `React.lazy()` y `Suspense` en `AppRoutes.tsx`.
  - Componentes atómicos desacoplados en `< 250 líneas` por archivo.
  - Jerarquía visual limpia: prohibido anidar tarjetas con bordes ("cuadros dentro de cuadros"); se usa profundidad por capas de fondo (`bg-slate-900/50`).
  - Iconografía 100% vectorial con `lucide-react` (estrictamente prohibido usar emojis en la interfaz).
  - Cero meta-contexto: prohibido mostrar menciones académicas ("CU01", "Sprint", "UAGRM", "SW1"); apariencia de plataforma corporativa real.
- **Estándar de Código Anti-AISLOP**:
  - Código autoexplicativo y conciso, sin comentarios redundantes de IA que inflen artificialmente las líneas de archivo.

## Capabilities

### New Capabilities
- `identity-access`: Cubre el registro, autenticación segura con JWT/Bcrypt (CU01), gestión de perfiles, organizaciones multi-tenant, RBAC granular con roles y departamentos (CU02) y envelope de errores estandarizado con credencial de rastreo.
- `legal-consent`: Cubre la gestión, registro inmutable y verificación de consentimiento informado digital con bloqueo `ConsentGuard` (CU03).
- `subscription-billing`: Cubre el catálogo de planes, cotización dinámica, contratación de suscripción, procesamiento de pagos sandbox y comprobantes digitales (CU04, CU05).

### Modified Capabilities
<!-- No existen capacidades previas en openspec/specs/. Todas son nuevas capacidades fundacionales. -->

## Impact
- **Backend**: Scaffolding limpio en NestJS con Prisma 6 conectado a Supabase PostgreSQL y filtro global de excepciones.
- **Frontend**: Scaffolding de React 19 + TypeScript + Vite + Tailwind CSS v4 con división modular de páginas y diseño Impeccable B2B.
- **Base de Datos**: Creación de tablas relacionales en Supabase (`usuarios`, `organizaciones`, `departamentos`, `usuarios_organizaciones`, `legal_consents`, `subscriptions`, `invoices`, `audit_logs`).
- **Observabilidad**: Trazabilidad completa entre errores de frontend y servidor mediante `errorReference`.
