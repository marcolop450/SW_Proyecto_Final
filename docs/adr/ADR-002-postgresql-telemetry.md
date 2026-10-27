# ADR-002: Almacenamiento de Telemetría Relacional y Series Temporales en PostgreSQL 16

## Estado
Aceptado

## Contexto
El sistema ErgoCheck AI requiere almacenar tanto entidades transaccionales (usuarios, sesiones, roles, consentimientos, exámenes) como un flujo continuo de telemetría por segundo (muestras de postura RULA y eventos de actividad). Se evaluó el uso de bases de datos NoSQL dedicadas a series temporales versus utilizar **PostgreSQL 16** con particionamiento nativo por rangos de tiempo.

## Decisión
Se decide adoptar **PostgreSQL 16** como motor unificado de base de datos, empleando **particionamiento declarativo por rangos de fecha (`PARTITION BY RANGE`)** para la tabla `metric_samples` e índices B-Tree/BRIN sobre marcas temporales y `session_id`.

## Consecuencias
### Positivas
- **Simplicidad de Infraestructura:** Una sola base de datos gestionada (AWS RDS, Azure Database for PostgreSQL o Google Cloud SQL) reduce la complejidad de despliegue y costos en la nube.
- **Integridad Referencial Estricta:** Mantiene claves foráneas y restricciones relacionales entre usuarios, sesiones y telemetría.
- **Consultas Eficientes:** El planificador de PostgreSQL realiza poda de particiones (*partition pruning*), escaneando únicamente el mes relevante en consultas de auditoría.
- **Soporte Nativo de JSONB:** Permite almacenar estructuras de calibración y payloads variables de eventos sin sacrificar rendimiento.

### Negativas / Mitigaciones
- **Mantenimiento de Particiones:** Requiere crear con antelación las particiones mensuales o trimestrales.  
  *Mitigación:* Se implementa un script de migración automática con TypeORM / Knex o extensiones de gestión de particiones (`pg_partman`).
