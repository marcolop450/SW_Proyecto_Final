# Spec Delta

## Purpose

Define y estandariza los endpoints y componentes de telemetría postural ergonómica en tiempo real para empleados, consumiendo registros y métricas de sesiones biométricas reales almacenadas en PostgreSQL.

## ADDED Requirements

### Requirement: Real Database Session Aggregation for Personal Telemetry
The platform SHALL compute and render personal ergonomic telemetry using persisted session records from PostgreSQL, providing authentic aggregated metrics (average RULA, total sessions, alert counts) and clear empty states when zero sessions have been recorded.

#### Scenario: Employee views personal telemetry with recorded sessions
- **WHEN** an authenticated employee with existing database sessions accesses their personal ergonomics view
- **THEN** the interface renders real calculated posture health indices, session counts, and alignment angles derived from database records.

#### Scenario: Employee views view with zero recorded sessions
- **WHEN** an employee without previous ergonomic sessions accesses their view
- **THEN** the interface displays an authentic initial state ("0 sesiones registradas hoy") with prompts to initiate workstation calibration.
