# identity-access Specification

## Purpose
Provee capacidades de identidad digital, autenticación criptográfica segura, gestión de perfiles y control de acceso basado en roles (RBAC) con aislamiento multi-tenant estricto y envelope de errores estandarizado.

## Requirements

### Requirement: Autenticación de Usuario con Credenciales Criptográficas
El sistema SHALL autenticar usuarios mediante credenciales seguras compuestas por correo electrónico y contraseña validada contra un hash Bcrypt, emitiendo un token JWT firmado criptográficamente y un refresh token.

#### Scenario: Inicio de sesión exitoso
- **WHEN** el usuario envía correo y contraseña correctos a `/api/auth/login`
- **THEN** el sistema retorna HTTP 200 con el token de acceso firmado criptográficamente, datos del usuario y membresía activa.

#### Scenario: Rechazo de contraseña inválida con envelope estándar
- **WHEN** el usuario envía una contraseña incorrecta o un correo inexistente
- **THEN** el sistema retorna HTTP 401 con `errorCode: "ERR_INVALID_CREDENTIALS"`, un mensaje amigable y una credencial de rastreo `errorReference`.

### Requirement: Validación Estricta de Firma y Expiración de JWT
El sistema SHALL interceptar cada solicitud a rutas protegidas mediante un guard de autenticación que verifique obligatoriamente la firma criptográfica del JWT y su fecha de expiración antes de conceder acceso.

#### Scenario: Intento de bypass con token manipulado
- **WHEN** un cliente envía un header `Authorization: Bearer <token>` con payload alterado o firma inválida
- **THEN** el sistema rechaza la petición con HTTP 401, `errorCode: "ERR_UNAUTHORIZED"` y credencial `errorReference`.

### Requirement: Aislamiento Multi-Tenant y Control de Acceso por Roles (RBAC)
El sistema SHALL restringir la visibilidad y mutación de recursos de manera que un usuario perteneciente a la Organización A no pueda acceder bajo ninguna circunstancia a los registros ni membresías de la Organización B.

#### Scenario: Acceso restringido por rol y organización
- **WHEN** un usuario con rol `EMPLEADO` de la Organización A intenta acceder a endpoints administrativos de la Organización B
- **THEN** el sistema deniega el acceso con HTTP 403 Forbidden, `errorCode: "ERR_FORBIDDEN_ORGANIZATION"`, genera un `errorReference` y audita el incidente.

#### Scenario: Consulta scoped por organización
- **WHEN** un `ADMIN_ORGANIZACION` consulta la lista de usuarios o departamentos
- **THEN** el sistema retorna exclusivamente los usuarios pertenecientes a su `organizationId`.

### Requirement: Manejo Global de Errores con Credencial de Incidente
El sistema SHALL interceptar todas las excepciones no controladas y errores de validación, formateándolos en un envelope JSON estándar con `statusCode`, `errorCode`, `message`, `errorReference` y `timestamp`, registrando la traza técnica completa en los logs del servidor.

#### Scenario: Error interno de servidor o base de datos
- **WHEN** ocurre una excepción no controlada o fallo de conexión en una petición
- **THEN** el sistema retorna HTTP 500 con un mensaje general seguro, un `errorReference` para soporte y no expone volcados de memoria ni credenciales de base de datos.

### Requirement: Segregación de Rutas y Vistas por Rol en el Frontend (Client RBAC)
The frontend SHALL intercept navigation to administrative or restricted views using route guards that check the authenticated user's role, prohibiting non-administrative roles from accessing tenant configuration, member directories, and subscription billing.

#### Scenario: Postulante or Empleado attempts access to restricted admin route
- **WHEN** a user with role `POSTULANTE` or `EMPLEADO` attempts to navigate to `/organizaciones`, `/usuarios`, or `/suscripciones`
- **THEN** the system blocks rendering of the restricted view and redirects the user to their designated role portal with a notification banner.

#### Scenario: Navigation links adapt to active role
- **WHEN** any authenticated user views the sidebar navigation menu
- **THEN** the sidebar displays exclusively the links and tools authorized for that user's specific institutional role.

### Requirement: Portales Especializados por Rol de Usuario
The frontend SHALL provide dedicated views tailored to non-administrative roles, including candidate exam check-in for `POSTULANTE` and personal ergonomic telemetry for `EMPLEADO`.

#### Scenario: Candidate enters portal
- **WHEN** a user with role `POSTULANTE` logs into the platform
- **THEN** the application presents the Candidate Exam Portal with device verification, exam instructions, and consent status.

### Requirement: Segregación Estricta entre Administrador de Plataforma y Administrador de Tenant
The system SHALL differentiate navigation and access between platform-wide Super Administrators and tenant-scoped Organization Administrators, granting Super Administrators cross-tenant visibility and platform audit logs while restricting Organization Administrators strictly to their isolated tenant workspace.

#### Scenario: Super Administrator views platform directory
- **WHEN** an authenticated user with role `SUPER_ADMINISTRADOR` accesses the organizations view
- **THEN** the interface renders the Global Client Organization Directory with multi-tenant stats and platform-wide audit access.

#### Scenario: Organization Administrator views single tenant
- **WHEN** an authenticated user with role `ADMIN_ORGANIZACION` accesses the organization view
- **THEN** the interface renders exclusively their own company profile, internal departments, and collaborators, without cross-tenant directories or foreign billing data.
