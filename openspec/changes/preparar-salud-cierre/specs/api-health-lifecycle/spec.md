## ADDED Requirements

### Requirement: Salud de la API

La API SHALL exponer comprobaciones públicas del proceso y de PostgreSQL y mantener el contrato de GET /api.

#### Scenario: Base de datos no disponible después de arrancar

- **WHEN** la API sigue activa y PostgreSQL no responde dentro del plazo de comprobación
- **THEN** GET /api/health/live devuelve 200 y GET /api/health/ready devuelve 503 sin detalles de conexión.

#### Scenario: Base de datos disponible

- **WHEN** PostgreSQL responde dentro del plazo
- **THEN** ambas comprobaciones devuelven 200 y Compose puede iniciar los servicios dependientes.

### Requirement: Inicio y cierre de la API

La API SHALL rechazar un arranque sin conexión inicial y cerrar los recursos de forma ordenada.

#### Scenario: Fallo inicial de PostgreSQL

- **WHEN** Prisma no puede establecer una conexión durante el arranque
- **THEN** la API termina con código distinto de cero antes de escuchar peticiones.

#### Scenario: Interrupción del proceso

- **WHEN** la API recibe SIGTERM o SIGINT
- **THEN** detiene el watchdog y cierra el servidor y Prisma antes de terminar.
