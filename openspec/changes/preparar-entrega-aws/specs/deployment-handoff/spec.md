## ADDED Requirements

### Requirement: Entrega reproducible

La guía SHALL permitir reconstruir una versión publicada y comprobar su disponibilidad sin divulgar credenciales.

#### Scenario: Arranque desde un clon nuevo

- **WHEN** un integrante clona el commit y completa sus variables privadas
- **THEN** puede construir las imágenes, iniciar el Compose y comprobar el frontend y la salud por HTTPS.

### Requirement: Propuesta de infraestructura

El plan SHALL identificar infraestructura, estimación de costes, requisitos de acceso y recuperación antes de crear recursos.

#### Scenario: Preparación de la demo

- **WHEN** el equipo aprueba un despliegue
- **THEN** dispone de pasos para elegir el paquete, verificar créditos, configurar DNS, desplegar y retirar los recursos.
