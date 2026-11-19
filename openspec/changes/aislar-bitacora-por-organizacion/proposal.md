## Why

La bitácora acepta administradores de organización pero sus lecturas y exportaciones carecen de un filtro de pertenencia. El despliegue reutilizará una base con datos de varias organizaciones.

## What Changes

- Identificar la organización de cada nuevo evento HTTP desde la sesión autenticada.
- Filtrar registros, estadísticas y exportaciones por organización para ADMIN_ORGANIZACION.
- Conservar la vista global para SUPER_ADMINISTRADOR y mantener el historial existente sin migración.

## Capabilities

### New Capabilities

- `tenant-audit-access`: acceso aislado a la bitácora por organización.
