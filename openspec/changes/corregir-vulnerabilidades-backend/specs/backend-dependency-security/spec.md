## ADDED Requirements

### Requirement: Dependencias verificadas
El backend SHALL construir e instalar dependencias compatibles con su archivo de bloqueo y revisar los avisos de seguridad de npm.

#### Scenario: Auditoría de producción
- **WHEN** se instala el árbol corregido y se ejecuta la auditoría de producción
- **THEN** se comprueba la resolución de los avisos detectados y se documenta cualquier aviso restante.

### Requirement: Compatibilidad del backend
La actualización SHALL conservar el comportamiento de autenticación, autorización, HTTP, WebSockets y reportes.

#### Scenario: Datos de evaluación aislados
- **WHEN** se ejecutan las pruebas de integración de la actualización
- **THEN** se utiliza una base temporal y se comprueban las respuestas de los contratos existentes.

### Requirement: Manejo de peticiones comprimidas
La API SHALL gestionar las peticiones comprimidas malformadas conservando la disponibilidad del proceso.

#### Scenario: Contenido gzip inválido
- **WHEN** llega una petición comprimida con contenido adicional inválido
- **THEN** la API responde con un error y continúa atendiendo solicitudes.

#### Scenario: Formato global de los errores del cuerpo
- **WHEN** el procesador del cuerpo rechaza contenido inválido, demasiado grande o con codificación incompatible
- **THEN** el filtro global conserva respectivamente los estados 400, 413 y 415 y entrega la referencia de error habitual.
