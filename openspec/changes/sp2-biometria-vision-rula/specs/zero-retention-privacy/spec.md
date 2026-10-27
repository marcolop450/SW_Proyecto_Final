# Spec Delta: zero-retention-privacy

## Purpose

Garantiza la arquitectura Zero-Image y el cumplimiento estricto de privacidad biométrica (CU09), destruyendo inmediatamente los fotogramas en memoria RAM tras cada inferencia y verificando cero almacenamiento o transmisión de imágenes.

## ADDED Requirements

### Requirement: Ephemeral RAM Frame Processing and Instant Deallocation
The vision pipeline SHALL process webcam frames strictly in local volatile memory, invoking ImageBitmap.close() immediately upon inference completion to prevent memory leaks and unapproved retention.

#### Scenario: Frame processed and closed in RAM
- **WHEN** an ImageBitmap frame completes landmark inference in the Web Worker
- **THEN** the system immediately calls close() on the bitmap object, discarding pixels from memory.

### Requirement: Zero Video Network Transmission Verification
The platform SHALL certify that network transmissions consist exclusively of numeric telemetry JSON payloads, transmitting 0 bytes of binary or base64 image data.

#### Scenario: Network payload verification during live session
- **WHEN** telemetry is transmitted to the backend server
- **THEN** the payload contains solely numeric angles, timestamps, and RULA indices with no image data, passing automated zero-leak network tests.
