## Why

Las imágenes actuales usan Node 20, que terminó su soporte. La preparación para AWS requiere comprobar una versión mantenida y evitar que las variantes de archivos de entorno entren en los contextos Docker.

## What Changes

- Construir ambas aplicaciones con Node 24 LTS sobre Debian slim.
- Ejecutar la API con Node 24, OpenSSL y dumb-init como usuario node.
- Conservar únicamente las dependencias de producción en la imagen de la API.
- Excluir archivos de entorno, cachés y cobertura de ambos contextos.
- Construir las imágenes y verificar su ejecución, el cliente Prisma, el proxy y las rutas de React.

## Capabilities

### New Capabilities
- `deployment-images`: imágenes verificadas para preparar el despliegue en AWS.

### Modified Capabilities

## Impact

Cambian los Dockerfiles y sus exclusiones. Las imágenes usan el esquema Prisma existente. Las comprobaciones de Supabase consultan datos en modo de solo lectura.
