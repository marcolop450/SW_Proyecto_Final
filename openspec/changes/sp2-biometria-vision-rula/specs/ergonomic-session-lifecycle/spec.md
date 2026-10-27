# Spec Delta: ergonomic-session-lifecycle

## Purpose

Gestiona el ciclo de vida de sesiones de monitoreo ergonómico en el servidor NestJS, asegurando validación ineludible de consentimiento digital y persistencia de métricas agregadas en PostgreSQL.

## ADDED Requirements

### Requirement: Consent-Guarded Session Initiation
The server SHALL require authenticated JWT tokens and active digital legal consent prior to initializing an ergonomic monitoring session.

#### Scenario: Authorized user initializes session
- **WHEN** an authenticated user with verified consent calls POST /api/ergonomia/sesion/iniciar
- **THEN** the server returns HTTP 201 with a newly created session entity in active status and records session start timestamp.

#### Scenario: Unconsented user attempts session start
- **WHEN** a user with revoked or unconfirmed legal consent attempts to call POST /api/ergonomia/sesion/iniciar
- **THEN** ConsentGuard rejects the request with HTTP 403 and error code ERR_CONSENT_REQUIRED, preventing session initialization.

### Requirement: Session Finalization and Metric Aggregation
The server SHALL finalize active sessions upon user request or logout, persisting average RULA, total alerts, and duration.

#### Scenario: User ends active monitoring session
- **WHEN** the client submits POST /api/ergonomia/sesion/:id/finalizar with aggregated sample data
- **THEN** the server computes final session duration, writes average RULA and alert counts to the database, and returns the consolidated session summary.
