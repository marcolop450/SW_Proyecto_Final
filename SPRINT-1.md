# Sprint 1 — Base de Plataforma, Identidad Multi-Tenant, Suscripciones SaaS y Consentimiento Legal

**Estado:** 100% Completado y Verificado en QA  
**Casos de Uso:** CU01–CU05  
**Módulos del Sistema:**
- Módulo 1: Identidad, Seguridad y Aislamiento Multi-Tenant
- Módulo 2: Suscripción y Facturación SaaS

---

## 1. Resumen Ejecutivo y Objetivo

El objetivo del Sprint 1 consistió en establecer la base fundacional de ErgoCheck AI con arquitectura de grado empresarial: autenticación robusta mediante tokens criptográficos, aislamiento riguroso multi-tenant para empresas clientes, control de acceso basado en roles (RBAC), flujo legal de consentimiento informado digital obligatorio antes de activar cualquier dispositivo biométrico, y el motor de contratación y facturación SaaS con integración de pasarela en entorno sandbox.

---

## 2. Casos de Uso Implementados y Arquitectura de Ingeniería

| ID | Caso de Uso | Prioridad | Puntos | Estado | Resumen Técnico de Implementación |
|---|---|---|---|---|---|
| **CU01** | Autenticación y Gestión de Perfil | Alta | 5 | **Completado** | Autenticación mediante Passport JWT (`JwtAuthGuard`), hash de contraseñas con `bcryptjs` (salt rounds = 12), endpoints de registro, login, refresh tokens, perfil y auditoría. |
| **CU02** | Administración de Organizaciones y Usuarios (RBAC) | Alta | 8 | **Completado** | Aislamiento multi-tenant a nivel de base de datos (`where: { organizationId }`), estructura jerárquica con departamentos, decorador `@Roles()` y roles diferenciados (`SUPER_ADMINISTRADOR`, `ADMIN_ORGANIZACION`, `SUPERVISOR_SST`, `EVALUADOR_SALUD`, `EMPLEADO`, `POSTULANTE`). |
| **CU03** | Gestión de Consentimiento Informado Digital | Alta | 5 | **Completado** | `ConsentGuard` que intercepta y bloquea toda ruta de telemetría si no existe consentimiento vigente en BD. Post-login gating obligatorio (`PantallaConsentimientoPrevio`) y acción de revocación voluntaria en UI. |
| **CU04** | Contratación y Cambio de Plan de Suscripción | Alta | 5 | **Completado** | Catálogo SaaS multi-modal (Seat-Based, Pay-Per-Candidate, Enterprise). Cotizador interactivo en tiempo real con previsualización de costos, impuestos y vigencia. |
| **CU05** | Procesamiento de Pago y Comprobante Digital | Alta | 8 | **Completado** | Integración de pasarela de pago sandbox con idempotencia transaccional, reintentos automáticos, emisión de comprobantes digitales descargables y Consola Financiera Global de MRR para el Super Administrador. |

---

## 3. Desglose Técnico por Capas

### 3.1 Backend (NestJS + Prisma ORM + PostgreSQL)
- **Módulo `auth`:**
  - Implementación de `AuthService` y `AuthController` con endpoints para registro, inicio de sesión, renovación de tokens y cierre de sesión.
  - Firma y verificación criptográfica de JWT con secreto en variables de entorno y caducidad configurada.
  - Cifrado unidireccional de contraseñas mediante `bcryptjs` con 12 rondas de salting.
  - Interceptor global de manejo de excepciones que retorna el envelope estándar de observabilidad:
    ```json
    {
      "statusCode": 403,
      "errorCode": "ERR_CONSENT_REQUIRED",
      "message": "Se requiere consentimiento informado vigente antes de acceder al servicio de telemetría.",
      "errorReference": "ERR-8F4A19B2",
      "timestamp": "2026-10-27T10:00:00.000Z"
    }
    ```
- **Módulo `organizaciones` y RBAC:**
  - Esquema Prisma multi-inquilino (`Organization`, `Department`, `User`, `Membership`).
  - `RolesGuard` validando metadatos declarados con `@Roles(...)` contra el payload criptográfico del token.
  - Aislamiento estricto: toda consulta sobre recursos corporativos filtra obligatoriamente por `organizationId`.
- **Módulo `consentimiento`:**
  - Entidad `ConsentLog` con hash de versión de términos legales, dirección IP auditada, User-Agent y timestamp ISO.
  - `ConsentGuard` activo en todas las rutas de telemetría ergonómica y hardware, retornando código unificado `403 ERR_CONSENT_REQUIRED` ante ausencias o revocaciones.
- **Módulo `suscripciones` y Facturación:**
  - Motor de cálculo dinámico de puestos según volumen de licencias contratadas.
  - Generador de comprobantes digitales correlativos con hash de verificación.
  - Consola consolidada de ingresos SaaS para el rol `SUPER_ADMINISTRADOR` (MRR global, churn, desglose por plan).

### 3.2 Frontend (React 19 + TypeScript + Tailwind CSS + Lucide)
- **Diseño Clean Tech B2B SaaS:** Paleta cromática profesional (`#F8FAFC`, `#0B1020`, `#C6F432`, `emerald-500`, `rose-500`, `amber-500`), tipografía *Plus Jakarta Sans* y *JetBrains Mono*, cero emojis (iconografía puramente vectorial SVG de `lucide-react`).
- **Arquitectura Anti-Monolito:** Todos los archivos de código estrictamente por debajo de **250 líneas**, organizados en subcarpetas modulares (`components/`, `hooks/`, `services/`, `types/`).
- **Code-Splitting y Rendimiento:** Carga diferida obligatoria con `React.lazy()` y `Suspense` con skeleton loaders en `AppRoutes.tsx`.
- **Gating Post-Login Obligatorio:** Si un usuario autenticado carece de consentimiento digital vigente, la aplicación bloquea la navegación y renderiza [`PantallaConsentimientoPrevio`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/features/consentimiento/PantallaConsentimientoPrevio.tsx).
- **Consola de Administración y Facturación:** Vistas diferenciadas según rol administrativo (Consola Financiera SaaS para Super Admin vs. Checkout/Cotizador para Admin de Organización).

---

## 4. Definición de Terminado (DoD) — Cumplimiento al 100%

- [x] Autenticación JWT completa con emisión, verificación criptográfica y cierre de sesión.
- [x] Contraseñas protegidas mediante `bcryptjs` con 12 rondas de sal (cero contraseñas en texto plano).
- [x] Multi-tenancy validado: Las consultas de la Organización A son totalmente invisibles para la Organización B.
- [x] `ConsentGuard` activo: Todo intento de acceder a la cámara o telemetría sin consentimiento retorna error 403.
- [x] Cotizador dinámico de suscripción con desglose antes de la confirmación.
- [x] Pasarela sandbox operativa con generación de comprobante digital y activación de estado.
- [x] Separación de roles: El Super Administrador visualiza la Consola Financiera de MRR sin flujos de compra para sí mismo.
- [x] Documentación interactiva de la API disponible y operativa en `/api/docs` (Swagger OpenAPI).
- [x] Suite de pruebas automatizadas y compilación de producción en verde (`npm run build`).