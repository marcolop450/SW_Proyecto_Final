# subscription-billing Specification

## Purpose
Gestiona la monetización SaaS, catálogo de planes por puesto o candidato, procesamiento de pagos en entorno sandbox y emisión de comprobantes digitales.

## Requirements

### Requirement: Catálogo y Previsualización Dinámica de Costos
El sistema SHALL exponer el catálogo de planes disponibles y permitir calcular dinámicamente el costo prorrateado y fecha de vigencia antes de confirmar cualquier cambio de suscripción.

#### Scenario: Previsualización de cambio de plan
- **WHEN** un administrador de organización solicita calcular el cambio de plan indicando número de puestos
- **THEN** el sistema retorna el monto total, periodicidad y desglose de cuotas sin aplicar el cobro.

### Requirement: Procesamiento de Pagos Sandbox y Facturación
El sistema SHALL procesar transacciones en entorno sandbox, manejar respuestas de éxito o falla con reintentos automáticos, y emitir un comprobante digital con estado de suscripción actualizado.

#### Scenario: Pago exitoso en sandbox
- **WHEN** se envía una transacción válida al endpoint de pago
- **THEN** el sistema registra la factura como `PAID`, activa la suscripción y emite el comprobante digital con número de factura único.

#### Scenario: Reintento ante cobro fallido
- **WHEN** la pasarela retorna un error en el cobro
- **THEN** el sistema marca la factura como `FAILED`, programa la política de reintentos y mantiene el plan en estado `PAST_DUE`.

### Requirement: Consola de Ingresos y Facturación Global para Super Administrador
The platform SHALL display a consolidated SaaS revenue and financial overview (global MRR, active paying clients, plan distribution, and platform-wide invoice history) exclusively when the authenticated user holds the `SUPER_ADMINISTRADOR` role, while strictly omitting subscription purchase or sandbox hire buttons for this master administrative role.

#### Scenario: Super Administrator views financial console
- **WHEN** a user with role `SUPER_ADMINISTRADOR` navigates to `/suscripciones`
- **THEN** the system displays the global MRR breakdown, total platform seats, and consolidated client invoice ledger, without showing subscription checkout or seat purchase buttons.

#### Scenario: Organization Administrator views plan procurement
- **WHEN** a user with role `ADMIN_ORGANIZACION` navigates to `/suscripciones`
- **THEN** the system displays the organization's current plan, the interactive seat quote slider, and buttons to hire or renew their tenant's subscription.
