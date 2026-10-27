# Spec Delta

## ADDED Requirements

### Requirement: Consola de Ingresos y Facturación Global para Super Administrador
The platform SHALL display a consolidated SaaS revenue and financial overview (global MRR, active paying clients, plan distribution, and platform-wide invoice history) exclusively when the authenticated user holds the `SUPER_ADMINISTRADOR` role, while strictly omitting subscription purchase or sandbox hire buttons for this master administrative role.

#### Scenario: Super Administrator views financial console
- **WHEN** a user with role `SUPER_ADMINISTRADOR` navigates to `/suscripciones`
- **THEN** the system displays the global MRR breakdown, total platform seats, and consolidated client invoice ledger, without showing subscription checkout or seat purchase buttons.

#### Scenario: Organization Administrator views plan procurement
- **WHEN** a user with role `ADMIN_ORGANIZACION` navigates to `/suscripciones`
- **THEN** the system displays the organization's current plan, the interactive seat quote slider, and buttons to hire or renew their tenant's subscription.
