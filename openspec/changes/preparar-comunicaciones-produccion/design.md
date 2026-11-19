## Decisions

- Producción usa `https://${APP_DOMAIN}` como origen web. El Compose de desarrollo conserva los accesos locales por Nginx y Vite. La API directa acepta los orígenes locales de desarrollo y puede recibir una lista explícita en WEB_ALLOWED_ORIGINS.
- Las rutas HTTP rechazan con 403 un origen explícito fuera de la lista. Socket.IO consulta la misma política en CORS y en `allowRequest`, que también se aplica al inicio de una conexión WebSocket directa.
- Las solicitudes sin Origin siguen disponibles para las sondas, los clientes nativos y los clientes del mismo sitio que omiten esa cabecera. La autenticación y la autorización siguen aplicándose a los recursos protegidos.
- Express confía en un salto solo cuando el Compose de producción activa TRUST_CADDY_PROXY. Caddy es el único servicio que publica puertos y reemplaza las cabeceras reenviadas recibidas del cliente. El Compose de desarrollo y el arranque directo conservan el comportamiento sin confianza en el proxy.
- La dirección que Express registra es la que Caddy observa en su conexión entrante. Docker Desktop puede mostrar la dirección de su pasarela. Si AWS incorpora un balanceador adicional, se debe volver a comprobar la cadena de confianza.

## Hook de Reajuste

El bloque D repetirá la comprobación de orígenes y verificará cámara, consentimiento y supervisión por HTTPS en el conjunto final.
