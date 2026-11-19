## Context

El backend usa NestJS 10, Prisma 5 y ExcelJS 4.4.0. La imagen Docker ya usa Node 24. Las pruebas de identidad y multi-tenancy requieren una base con datos de demostración.

## Goals / Non-Goals

Corregir los avisos conocidos de las dependencias conservando la autenticación, la autorización, las rutas HTTP, el canal de supervisión y la generación de reportes.

## Decisions

- Mantener TypeScript 5 y actualizar NestJS de manera coordinada a 11.2.11, con Config 4.0.4, Swagger 11.4.8 y los módulos JWT y Passport compatibles.
- Usar el uuid corregido de la rama 11 únicamente dentro de ExcelJS. ExcelJS utiliza uuid.v4 en el formato condicional. Se verificará la escritura y lectura de XLSX, incluyendo ese recorrido.
- Actualizar glob únicamente dentro del CLI de NestJS a la rama 14 corregida. Esa rama incluye minimatch 11 y se comprobará mediante la compilación normal del backend.
- Conservar los archivos de bloqueo para construir con npm ci. La auditoría verificará tanto producción como el árbol completo.
- Conservar los estados 400, 413 y 415 de los errores expuestos por el parser HTTP dentro del filtro global, junto con su formato y referencia de error.
- Ejecutar las pruebas que escriben datos en PostgreSQL temporal y probar Supabase mediante consultas de solo lectura.

## Risks / Trade-offs

Express 5 modifica el análisis de consultas y el registro de ciertas rutas. Se comprobarán los filtros HTTP y el proxy existente. Las anulaciones de uuid y glob cruzan las versiones declaradas por sus paquetes principales y requieren pruebas de compatibilidad específicas.

## Hook de Reajuste

La configuración de producción y las rutas de salud continúan en los siguientes bloques del plan de despliegue.
