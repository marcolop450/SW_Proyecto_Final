## 1. Validación

- [x] 1.1 Reconstruir las imágenes y comprobar el arranque con Supabase en modo de lectura.
- [x] 1.2 Probar autenticación, consentimiento, cámara simulada, supervisión y reportes en un entorno aislado.
- [x] 1.3 Verificar orígenes, fallos de arranque, recuperación, señales y certificados.
- [x] 1.4 Probar actualización y reversión con imágenes etiquetadas.
- [x] 1.5 Resolver el hallazgo en la dependencia transitiva del frontend, repetir auditorías y actualizar el plan.
- [x] 1.6 Corregir y comprobar la liberación de periféricos cuando la solicitud se resuelve después de salir.

## Resultados

El 19 de noviembre de 2026 se construyeron las imágenes en Docker Desktop. La aplicación inició por HTTPS con Supabase, verificando las dos conexiones en transacciones de solo lectura. Con PostgreSQL 16 desechable se probó autenticación, comunicación en vivo por WebSocket, lectura de las hojas del XLSX y firma del PDF. En Edge y Chromium, una pista de cámara con video sintético permitió comprobar la pantalla de calibración, la carga de MediaPipe y WASM, el procesamiento de fotogramas y la liberación de la pista.

Compose rechazó las variables obligatorias vacías. Credenciales incorrectas detuvieron la API. Se comprobó la degradación y recuperación de disponibilidad, el cierre por SIGTERM y SIGINT y la persistencia de la autoridad de Caddy tras recrear el contenedor. La aplicación mantuvo el estado de consentimiento al cambiar las imágenes de la candidata del bloque D a las del bloque B y volver a la candidata.

El archivo de bloqueo actualizó `follow-redirects` de 1.16.1 a 1.16.3. Las auditorías del frontend y del backend reportaron 0 vulnerabilidades en ambos alcances. El estado se registra en [el plan de despliegue](../../../docs/PLAN_DESPLIEGUE_AWS.md).

Sobre la base `45b22dd` se reconstruyó el frontend de producción con la corrección de periféricos. En Chromium por HTTPS y con PostgreSQL de prueba se comprobó que cerrar sesión antes de resolver la captura termina las pistas de audio y video entregadas tarde. Un rechazo tardío no abre una segunda solicitud. También pasaron la vista previa normal, la liberación de una captura activa al salir y la alternativa de solo video cuando el portal sigue abierto.
