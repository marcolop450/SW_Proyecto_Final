# Spec Delta: static-posture

## Purpose

Detecta situaciones de inmovilidad postural prolongada y sobrecarga muscular acumulativa (CU08) aplicando penalizaciones ergonómicas cuando una postura forzada se mantiene por más de 60 segundos.

## ADDED Requirements

### Requirement: Static Posture and Muscle Fatigue Detection
The system SHALL monitor posture variation and apply an incremental static load penalty (+1) when the user maintains the same body angle without significant movement ($\pm 3^\circ$) for more than 60 seconds.

#### Scenario: User remains stationary in forced posture for over 60 seconds
- **WHEN** the user's joint angles remain within a $\pm 3^\circ$ threshold for 60 consecutive seconds
- **THEN** the system increments the static load score by +1, elevates the RULA risk tier, and records a muscle fatigue warning event.

#### Scenario: User performs compensatory body movement
- **WHEN** the user moves, stretches, or changes posture with an angular variation exceeding $5^\circ$
- **THEN** the static posture timer is reset to zero and the temporary load penalty is cleared.
