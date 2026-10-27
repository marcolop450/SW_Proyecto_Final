# Spec Delta: posture-calibration

## Purpose

Define y estandariza el procedimiento de calibración inicial de la postura neutra de trabajo y evaluación del entorno lumínico (CU06) previo al monitoreo ergonómico.

## ADDED Requirements

### Requirement: Environmental Lighting Assessment
The system SHALL evaluate ambient lighting conditions from the webcam video feed before calibration, alerting the user if low light or severe glare impairs biometric landmark detection.

#### Scenario: Adequate lighting detected
- **WHEN** average frame luminance is within optimal operational range (30% to 85%)
- **THEN** the calibration interface displays a green lighting confirmation indicator and enables the baseline capture countdown.

#### Scenario: Sub-optimal lighting detected
- **WHEN** average frame luminance drops below 30% or exceeds 85%
- **THEN** the interface warns the user to adjust room lighting or reposition the webcam, preventing false biometric calibration.

### Requirement: Neutral Posture Baseline Calibration
The system SHALL capture and average user alignment angles during a 3-second neutral sitting calibration period before initiating live ergonomic telemetry.

#### Scenario: User successfully completes 3-second calibration
- **WHEN** the user aligns with the visual guide silhouette and remains in neutral posture for 3 seconds
- **THEN** the system computes the baseline angles for neck, trunk, and head pitch, persisting the calibration in memory and enabling the start of the ergonomic monitoring session.

#### Scenario: Calibration interrupted by loss of landmarks
- **WHEN** the user moves out of camera frame during the 3-second calibration countdown
- **THEN** the system pauses the countdown, displays a re-alignment alert, and prompts the user to center themselves before restarting the countdown.
