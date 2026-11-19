## ADDED Requirements

### Requirement: Configuración explícita de producción
El conjunto SHALL iniciar la API, el frontend y la entrada HTTPS con conexiones de base de datos proporcionadas por el operador.

#### Scenario: Variables obligatorias ausentes
- **WHEN** falta una conexión, el secreto JWT, el dominio o la etiqueta de imagen
- **THEN** Compose rechaza la configuración indicando el nombre de la variable.

### Requirement: Secreto JWT de producción
El backend SHALL exigir un secreto JWT de al menos 32 caracteres al ejecutarse en producción.

#### Scenario: Secreto demasiado corto
- **WHEN** la API inicia en producción con un secreto de menos de 32 caracteres
- **THEN** el arranque falla con un mensaje que permite corregir la configuración.

### Requirement: Entrada del conjunto
La entrada SHALL entregar el frontend y encaminar las rutas de API y Socket.IO al backend.

#### Scenario: Comprobación local de HTTPS
- **WHEN** el conjunto se inicia con localhost y el cliente confía en la autoridad local de Caddy
- **THEN** el cliente puede consultar el frontend y la API mediante HTTPS.
