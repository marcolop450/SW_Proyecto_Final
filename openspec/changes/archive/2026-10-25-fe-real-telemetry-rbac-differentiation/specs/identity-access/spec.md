# Spec Delta

## ADDED Requirements

### Requirement: Segregación Estricta entre Administrador de Plataforma y Administrador de Tenant
The system SHALL differentiate navigation and access between platform-wide Super Administrators and tenant-scoped Organization Administrators, granting Super Administrators cross-tenant visibility and platform audit logs while restricting Organization Administrators strictly to their isolated tenant workspace.

#### Scenario: Super Administrator views platform directory
- **WHEN** an authenticated user with role `SUPER_ADMINISTRADOR` accesses the organizations view
- **THEN** the interface renders the Global Client Organization Directory with multi-tenant stats and platform-wide audit access.

#### Scenario: Organization Administrator views single tenant
- **WHEN** an authenticated user with role `ADMIN_ORGANIZACION` accesses the organization view
- **THEN** the interface renders exclusively their own company profile, internal departments, and collaborators, without cross-tenant directories or foreign billing data.
