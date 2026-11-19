## Decisions

- Mantener dos proyectos Compose temporales. El primero toma las variables privadas y consulta Supabase. El segundo usa PostgreSQL desechable para credenciales, consentimiento, supervisión, reportes, fallos y recuperación.
- Usar un navegador Chromium aislado y video sintético para probar HTTPS, permisos y carga de MediaPipe sin capturar imágenes personales.
- Probar actualización y reversión con la etiqueta de una versión anterior verificada y el mismo volumen de certificados. Las pruebas de escritura usan solo el entorno desechable.
- Actualizar únicamente la dependencia transitiva afectada en el archivo de bloqueo del frontend y repetir las auditorías sin forzar actualizaciones mayores.
- Invalidar la solicitud de periféricos al desmontar el portal, al iniciar el examen o al reemplazarla. Si el navegador entrega la captura después, detener sus pistas sin mostrar la vista previa. Un rechazo tardío tampoco debe abrir una segunda solicitud.

## Hook de Reajuste

El bloque E usará las evidencias para la entrega al equipo. La validación de un dominio público y los límites de recursos corresponden al despliegue posterior en AWS.
