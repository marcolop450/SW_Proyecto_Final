# Design

## Context
Ver motivación y problema en [proposal.md](proposal.md). Se requiere una arquitectura modular en NestJS (backend) y React 19 (frontend) conectada a PostgreSQL mediante Prisma ORM en Supabase, erradicando código monolítico, eliminando emojis y jerarquías visuales sobrecargadas, y garantizando observabilidad con envelope de errores y credenciales de rastreo.

## Goals / Non-Goals

**Goals:**
- Implementar módulos desacoplados en NestJS: `AuthModule`, `OrganizacionesModule`, `UsuariosModule`, `ConsentimientoModule`, `SuscripcionesModule`.
- Implementar `AllExceptionsFilter` global para unificar todas las respuestas de error (400, 401, 403, 404, 409, 422, 429, 500) con envelope estándar y credencial de rastreo `errorReference`.
- Implementar `JwtAuthGuard` con Passport y `RolesGuard` basado en metadata `@Roles(...)`.
- Implementar `ConsentGuard` para validar autorización explícita antes de cualquier sesión.
- Establecer Prisma Client tipado con filtros obligatorios `organizationId`.
- Arquitectura de frontend Impeccable: páginas divididas en submódulos `< 250 líneas`, lazy loading con `React.lazy()` y Suspense.
- Diseño visual sin cajas anidadas ("cuadros dentro de cuadros"), iconografía profesional (`lucide-react`, sin emojis), cero meta-contexto académico (look 100% corporativo) y código anti-AISLOP.
- Preparar los puntos de enlace (hooks) para los Sprints 2, 3 y 4.

**Non-Goals:**
- Inferencia MediaPipe con Web Workers (reservado para Sprint 2).
- Algoritmo PnP y anti-cheat (reservado para Sprint 3).
- Generación de reportes PDF/Excel con PDFKit/ExcelJS y WebSocket Mosaico (reservado para Sprint 4).

## Decisions

### 1. Autenticación con Passport JWT y Bcrypt vs. Decodificación Manual Base64
- **Decisión**: Usar `@nestjs/passport` y `passport-jwt` con validación estricta de firma y expiración. Contraseñas protegidas con `bcryptjs` con salt rounds = 12.
- **Alternativa descartada**: Decodificar payloads en base64 sin firma (`Buffer.from(...)`), lo cual originó la vulnerabilidad crítica en la versión anterior.

### 2. Multi-tenancy por Aislamiento Lógico en Prisma con Scoping de Consultas
- **Decisión**: Toda entidad organizacional (`UsuarioOrganizacion`, `Departamento`, `Subscription`) mantiene clave foránea `organizacionId`. Los servicios reciben el usuario autenticado del token y aplican `where: { organizacionId: req.user.organizationId }`.
- **Alternativa descartada**: Multi-tenancy por esquemas separados de Postgres o filtrado en memoria (inseguro).

### 3. Filtro Global de Excepciones y Credencial de Rastreo (`errorReference`)
- **Decisión**: Registrar un `AllExceptionsFilter` global en NestJS. Cada error genera un identificador único (ej: `ERR-7F3B9A12`), registra el stack trace técnico completo en la consola del servidor con dicho identificador y retorna al cliente un JSON estandarizado:
  ```json
  {
    "statusCode": 403,
    "errorCode": "ERR_CONSENT_REQUIRED",
    "message": "Se requiere consentimiento informado vigente antes de acceder al servicio de telemetría.",
    "errorReference": "ERR-7F3B9A12",
    "timestamp": "2026-10-25T14:15:00.000Z"
  }
  ```
- **Alternativa descartada**: Dejar que NestJS arroje respuestas genéricas de Express o exponer trazas de base de datos al cliente.

### 4. Estándar de Frontend Impeccable (Cero Cuadros Anidados, Cero Emojis, Cero Meta-Contexto)
- **Decisión**:
  - **Jerarquía Visual Plana con Capas**: Se prohíbe anidar tarjetas con borde sobre tarjetas con borde. Se usan fondos contrastantes sutiles (`bg-slate-900/40`), líneas divisorias tenues (`border-slate-800/60`) y suficiente espacio en blanco.
  - **Iconos Vectoriales Exclusivos**: Uso estricto de `lucide-react`. Prohibido el uso de emojis en cualquier componente de la aplicación.
  - **Cero Meta-Contexto**: La interfaz es 100% de producto SaaS para empresas de ciberseguridad y SST. No se muestran identificadores de casos de uso ("CU01"), ni nombres de asignaturas o universidades en pantallas de usuario.
  - **Componentes < 250 líneas y Code-Splitting**: Modularización estricta y carga dinámica mediante `React.lazy()` en `AppRoutes.tsx`.
- **Alternativa descartada**: Monolitos de 1,100 líneas con emojis y textos académicos del repositorio anterior.

### 5. Estándar de Código Anti-AISLOP
- **Decisión**: Código limpio, fuertemente tipado en TypeScript, autoexplicativo por sus nombres y sin comentarios triviales de IA.
- **Alternativa descartada**: Comentar cada línea obvia con explicaciones redundantes.

## Cross-Sprint Dependencies & Re-adjustment Hooks

| Caso de Uso Origen (Sprint 1) | Caso de Uso Destino (Futuro) | Punto de Enlace (Hook) en Sprint 1 | Tarea de Reajuste al Implementar el Sprint Futuro |
|---|---|---|---|
| **CU03** (Consentimiento) | **CU06 / CU07** (Calibración y Sesión RULA - Sprint 2) | Interfaz `ConsentGuard` y endpoint `GET /api/consentimiento/estado` listos para inyectar en controladores de sesión. | Al crear `ErgonomicSessionController` en Sprint 2, decorar con `@UseGuards(JwtAuthGuard, ConsentGuard)` y registrar IP/User-Agent en el inicio de calibración. |
| **CU04 / CU05** (Planes y Cobros) | **CU17** (Supervisión Externa - Sprint 3) | Campos `examsAllocated` y `examsUsed` en tabla `Subscription`. | Al crear la generación de códigos temporales en Sprint 3 (CU17), restar cuota en `Subscription` y bloquear si `examsUsed >= examsAllocated`. |
| **CU01 / CU02** (Auth y RBAC) | **CU26** (Bitácora Inmutable WORM - Sprint 4) | Emisión de eventos de auditoría base en `AuditLog` en cada login y cambio de rol. | Al implementar el encadenamiento criptográfico SHA-256 en Sprint 4, actualizar el servicio de auditoría para recalcular hashes sobre los logs de Sprint 1. |

## Risks / Trade-offs

- **[Riesgo de Latencia en Consultas de Consentimiento]** → El guard consulta PostgreSQL en cada petición protegida. *Mitigación*: Incluir flag `hasActiveConsent` en el payload del JWT con expiración corta (15 min) o caché en memoria en NestJS.
- **[Riesgo de Reintentos de Pago Duplicados]** → Webhook de pasarela sandbox ejecutado múltiples veces. *Mitigación*: Idempotencia mediante clave única `transactionId` en la tabla `Invoice`.
