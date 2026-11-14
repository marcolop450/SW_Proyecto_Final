## Decisiones

- Las restricciones únicas de PostgreSQL resuelven conflictos de registro bajo concurrencia. Prisma revierte la transacción y traduce la colisión a una respuesta 409.
- La organización del token determina la membresía consultada. En el login se elige la membresía activa más antigua si hay varias.
- El cambio de rol aplica la protección del rol global en el filtro de la propia escritura. La invitación crea la cuenta y la membresía con una escritura anidada.
- El alcance conserva el esquema de datos. Antes de desplegar en un entorno compartido, revisar las membresías privilegiadas, configurar un secreto JWT nuevo y solicitar a los usuarios que inicien sesión de nuevo.
