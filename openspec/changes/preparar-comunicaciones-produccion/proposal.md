## Why

La API y Socket.IO tienen configuraciones de origen abiertas. Express tampoco usa los metadatos de Caddy para reconocer el protocolo exterior y la dirección que registra el flujo de consentimiento.

## What Changes

- Aplicar la misma lista de orígenes a HTTP, a las consultas de Socket.IO y a las conexiones WebSocket.
- Derivar el origen de producción del dominio de Caddy y conservar los orígenes locales usados para desarrollo.
- Leer el protocolo y la dirección que reenvía Caddy al usar el Compose de producción.

## Capabilities

### New Capabilities

- `proxied-communications`: política de orígenes y confianza en el proxy.

## Impact

Afecta la entrada HTTP y Socket.IO. Se conserva la autenticación existente y se mantienen las rutas de frontend, API y supervisión.
