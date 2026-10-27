# Spec Delta

## ADDED Requirements

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
