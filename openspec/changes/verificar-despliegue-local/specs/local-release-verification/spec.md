## ADDED Requirements

### Requirement: Verificación del entorno local

La versión SHALL validarse con las imágenes de producción y HTTPS antes de elegir los recursos de despliegue.

#### Scenario: Validación con datos aislados

- **WHEN** el equipo comprueba los flujos que generan datos o simulan la caída de PostgreSQL
- **THEN** las operaciones usan un entorno desechable y las comprobaciones de Supabase son de solo lectura.

#### Scenario: Recuperación de versión

- **WHEN** cambia la etiqueta de las imágenes y se vuelve a la versión anterior
- **THEN** el servicio recupera la disponibilidad y conserva los certificados en sus volúmenes.

### Requirement: Liberación de periféricos del postulante

El portal SHALL liberar las pistas de cámara y micrófono de la prueba de periféricos cuando el usuario sale.

#### Scenario: La solicitud sigue pendiente al cerrar sesión

- **WHEN** el postulante sale antes de que el navegador resuelva la solicitud de captura
- **THEN** el portal detiene las pistas entregadas tarde y descarta el resultado. Si la solicitud se rechaza, el portal omite el segundo intento.
