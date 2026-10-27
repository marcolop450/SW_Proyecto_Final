# Spec Delta: rula-engine

## Purpose

Implementa el motor de inferencia matemática y biomecánica en Web Worker (CU07) para calcular ángulos articulares normalizados sobre 33 nodos de MediaPipe y calificar el nivel de riesgo ergonómico continuo bajo el método RULA cada segundo.

## ADDED Requirements

### Requirement: Local Geometric Angle Calculation
The system SHALL calculate anatomical angles for neck flexion, trunk deviation, and shoulder elevation in Web Worker memory using 33 MediaPipe pose landmark coordinates without blocking the main UI thread.

#### Scenario: Continuous trigonometric calculation
- **WHEN** landmark streams are received at 15 to 30 FPS in worker memory
- **THEN** the system calculates neck flexion angle ($\theta_{\text{cuello}}$), trunk inclination angle ($\theta_{\text{tronco}}$) and arm abduction using the arc-cosine vector dot product.

### Requirement: Continuous RULA Risk Scoring
The system SHALL evaluate continuous posture samples against RULA scoring tables and ISO 11226 thresholds, emitting an updated RULA score (1 to 7) every second.

#### Scenario: Low risk optimal posture detected
- **WHEN** neck flexion is between 0° and 20° and trunk is aligned vertically
- **THEN** the RULA score is rated between 1 and 2, displaying green status and accumulating optimal ergonomics time.

#### Scenario: High risk poor posture detected
- **WHEN** neck flexion exceeds 20° and trunk deviation exceeds 20°
- **THEN** the RULA score increases to 5 or higher, triggering a warning state in the monitoring view.
