# Diseño

La pantalla mantiene el flujo existente de detección y muestra instrucciones junto al visor. La cuenta regresiva se interrumpe si la persona deja de estar centrada. El visor permanece montado para permitir reintentar el acceso a la cámara.

## Revisión de funcionamiento

- La referencia inicial se calcula con muestras válidas durante la cuenta regresiva; se detiene si se pierde la detección.
- El envío periódico usa la medición más reciente sin reiniciar el temporizador en cada fotograma.
- Una sesión sin mediciones no recibe un puntaje inicial ficticio. Al cerrar se conservan los datos registrados.
- La referencia solo se conserva durante la sesión en el navegador; el servidor aún no la almacena ni el indicador la utiliza como ajuste. El indicador es una heurística orientativa y no una evaluación RULA completa.
