## Decisions

Un interceptor proporciona al servicio la identidad autenticada de la solicitud, incluido el ámbito validado por JWT. La bitácora conserva la organización que originó el evento en los detalles del registro, incluida en el cálculo del hash. Las lecturas filtran únicamente por ese valor persistido, no por parámetros de consulta ni por la membresía actual del autor. El historial sin organización atribuible sigue disponible para el superadministrador. Los eventos previos con organización registrada conservan su visibilidad.

Los administradores consultan la integridad de sus propios bloques y reciben un resumen local. Como la cadena se mantiene global, se comprueba internamente la existencia de ancestros válidos. Se ocultan las referencias a bloques previos ajenos en vistas y exportaciones de organización. El superadministrador conserva la vista y verificación globales. No se reescriben registros existentes.

## Hook de Reajuste

La publicación en AWS espera una prueba con dos organizaciones y una cuenta global contra PostgreSQL desechable. Supabase conserva su esquema y sus registros.
