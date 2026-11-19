## 1. Imágenes

- [x] 1.1 Actualizar las etapas Node a Node 24 LTS sobre Debian slim.
- [x] 1.2 Conservar OpenSSL, dumb-init y el usuario node en la API.
- [x] 1.3 Excluir archivos de entorno, cachés y cobertura.

## 2. Verificación

- [x] 2.1 Construir las dos imágenes desde sus contextos normales.
- [x] 2.2 Comprobar Node, usuario y funcionamiento del cliente Prisma.
- [x] 2.3 Comprobar conexión de solo lectura con Supabase desde la imagen.
- [x] 2.4 Arrancar los dos servicios y comprobar navegación, API y recursos de visión.
- [x] 2.5 Comprobar tamaños, exclusión de archivos privados y limpieza de los contenedores de prueba.

## Resultados del 18 de noviembre de 2026

- Ambas imágenes se construyeron con los archivos de bloqueo existentes. La API ejecutó Node 24.22.3 con UID 1000 y sin TypeScript instalado en su imagen final.
- DATABASE_URL y DIRECT_URL permitieron consultas Prisma dentro de transacciones de solo lectura en Supabase.
- Nginx entregó las rutas /login y /mi-ergonomia, el paquete JavaScript, ambos modelos y el archivo WASM. El proxy devolvió el estado de la API y rechazó una consulta protegida sin JWT.
- La conexión WebSocket atravesó Nginx y recibió el rechazo esperado por falta de autenticación.
- Las imágenes finales excluyen los archivos .env. El backend ocupó 630,0 MiB y el frontend 158,7 MiB.
- La prueba retiró sus contenedores y su red temporal.
- La auditoría inicial de las dependencias de producción del backend reportó 15 vulnerabilidades, de las cuales 7 eran altas y 8 moderadas. Su corrección y verificación se documentan en el cambio corregir-vulnerabilidades-backend.
