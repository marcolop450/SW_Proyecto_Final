## ADDED Requirements

### Requirement: Política de orígenes compartida

HTTP y Socket.IO SHALL aplicar los mismos orígenes configurados y conservar la autenticación de las rutas protegidas.

#### Scenario: Origen externo explícito

- **WHEN** un cliente presenta un origen ajeno a la lista en una solicitud HTTP o una conexión inicial a Socket.IO
- **THEN** el servicio rechaza la solicitud antes de ejecutar la lógica del recurso.

#### Scenario: Origen permitido o sin cabecera Origin

- **WHEN** un cliente presenta un origen permitido u omite Origin
- **THEN** la solicitud pasa a la autenticación o al recurso público que corresponda.

### Requirement: Metadatos del proxy

La API SHALL usar la dirección y el protocolo reenviados por Caddy en la topología de producción.

#### Scenario: Caddy recibe cabeceras reenviadas del cliente

- **WHEN** un cliente realiza una solicitud HTTPS a Caddy e incluye sus propias cabeceras de reenvío
- **THEN** Express usa la dirección observada por Caddy y el protocolo HTTPS establecidos por el proxy.
