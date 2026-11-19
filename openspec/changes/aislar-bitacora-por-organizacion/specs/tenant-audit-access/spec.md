## ADDED Requirements

### Requirement: Bitácora por organización

La bitácora SHALL limitar las consultas, estadísticas, comprobaciones y exportaciones de un administrador al ámbito de su organización autenticada.

#### Scenario: Dos administradores de organizaciones distintas

- **WHEN** un administrador consulta o exporta la bitácora
- **THEN** solo recibe los eventos atribuidos a su organización, sin importar los filtros proporcionados.

#### Scenario: Registros históricos sin organización

- **WHEN** el registro carece de una organización atribuible en sus detalles
- **THEN** se conserva en la bitácora global y no aparece en vistas de organización.

#### Scenario: Comprobación de la bitácora global

- **WHEN** un superadministrador solicita la comprobación de la cadena
- **THEN** el servicio verifica los registros globales y mantiene el contrato de respuesta.
