## Why

La imagen de producción del backend reportó 15 paquetes vulnerables, con 7 de severidad alta y 8 moderada. El árbol instalado incluye versiones afectadas de body-parser, multer, lodash, js-yaml, file-type, qs, uuid y componentes de NestJS.

## What Changes

- Actualizar los módulos de NestJS a versiones compatibles de la rama 11 y las bibliotecas auxiliares correspondientes.
- Regenerar el archivo de bloqueo y revisar el árbol completo de dependencias.
- Actualizar de manera acotada el uuid que utiliza ExcelJS y probar su uso de la API v4.
- Verificar la compatibilidad HTTP, JWT, WebSockets y de los reportes con las versiones corregidas.
- Probar la regresión de peticiones comprimidas malformadas sobre un entorno aislado.
- Conservar los estados HTTP 400, 413 y 415 de los errores de procesamiento del cuerpo en el formato global de errores.

## Capabilities

### New Capabilities
- `backend-dependency-security`: dependencias verificadas del backend para el despliegue.

### Modified Capabilities

## Impact

Cambian el manifiesto y el archivo de bloqueo del backend. La migración a NestJS 11 incorpora Express 5. La verificación debe conservar los contratos actuales y se realizará con una base temporal independiente de Supabase.
