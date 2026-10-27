# Spec Delta: ergonomic-telemetry

## MODIFIED Requirements

### Requirement: Real Database Session Aggregation for Personal Telemetry
The platform SHALL compute and render personal ergonomic telemetry using persisted session records from PostgreSQL, providing authentic aggregated metrics (average RULA, total sessions, alert counts), live telemetry feeds during active sessions, and clear empty states when zero sessions have been recorded.

#### Scenario: Employee views personal telemetry with recorded sessions
- **WHEN** an authenticated employee with existing database sessions accesses their personal ergonomics view
- **THEN** the interface renders real calculated posture health indices, session counts, and alignment angles derived from database records.

#### Scenario: Employee views view with zero recorded sessions
- **WHEN** an employee without previous ergonomic sessions accesses their view
- **THEN** the interface displays an authentic initial state ("0 sesiones registradas hoy") with prompts to initiate workstation calibration.

## ADDED Requirements

### Requirement: Real-time In-session Telemetry Streaming
The platform SHALL stream real-time posture indicators and risk warnings to the employee dashboard during an active monitoring session without blocking the user interface.

#### Scenario: Active session streams posture telemetry
- **WHEN** a monitoring session is in progress
- **THEN** the ergonomics view updates the live RULA gauge and postural alignment indicators once per second.
