# ADR-001: Inferencia de Visión Artificial en el Borde (Edge AI) mediante Web Workers

## Estado
Aceptado

## Contexto
El sistema ErgoCheck AI requiere procesar flujos continuos de video desde la cámara web del usuario para estimar la pose corporal (33 articulaciones) y la malla facial (478 puntos) con una frecuencia mínima de 15 FPS. Existen dos alternativas arquitectónicas fundamentales:
1. Transmitir el video por WebRTC o WebSockets hacia un clúster de servidores de inferencia con GPUs.
2. Ejecutar los modelos de red neuronal localmente en el navegador del cliente mediante WebAssembly (WASM) y aceleración por hardware (WebGL / WebGPU).

## Decisión
Se decide ejecutar la inferencia de visión artificial **100% en el borde (Edge AI)** utilizando **Google MediaPipe Tasks Vision (PoseLandmarker y FaceLandmarker)** compilado a WebAssembly y ejecutado dentro de un **Web Worker** dedicado.

## Consecuencias
### Positivas
- **Privacidad Absoluta (Privacy by Design):** Los fotogramas de video residen efímeramente en la memoria RAM del dispositivo y se destruyen inmediatamente tras el cómputo. No existe transmisión de video por red ni almacenamiento en el servidor, eliminando riesgos de filtración de datos biométricos.
- **Cero Costo de GPU en el Servidor:** La infraestructura central no requiere costosos servidores equipados con tarjetas gráficas ni procesadores de video en tiempo real.
- **Baja Latencia de Detección:** El cálculo de ángulos articulares y orientación de la cabeza se realiza en tiempo real sin verse afectado por fluctuaciones del ancho de banda de red.
- **Fluidez de la Interfaz:** Al aislar la ejecución en un Web Worker con `OffscreenCanvas`, el hilo principal de la aplicación web permanece liberado, garantizando una interacción a 60 FPS.

### Negativas / Mitigaciones
- **Dependencia del Hardware Cliente:** Equipos con procesadores muy antiguos o sin aceleración por hardware pueden experimentar caída de FPS.  
  *Mitigación:* Se implementa degradación elegante reduciendo la tasa de inferencia a 10 FPS o alternando frames entre pose y rostro.
- **Variabilidad en Modelos de Navegador:** Se requiere soporte de WebAssembly y Web Workers.  
  *Mitigación:* Se restringe la compatibilidad a navegadores modernos basados en Chromium y Gecko (Chrome, Edge, Firefox $\ge 120$).
