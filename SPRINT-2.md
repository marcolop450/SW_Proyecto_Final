# Sprint 2 — Visión Artificial en el Borde (Edge AI), Telemetría Biomecánica RULA y Prevención Ergonómica

**Estado:** 100% Completado y Verificado en QA  
**Casos de Uso:** CU06–CU10  
**Módulos del Sistema:**
- Módulo 3: Visión Computacional y Biometría Local (Edge AI)
- Módulo 4: Prevención e Intervención Postural

---

## 1. Resumen Ejecutivo y Objetivo

El objetivo del Sprint 2 consistió en construir e integrar un subsistema de visión computacional y análisis postural en tiempo real ejecutado al 100% en el navegador del cliente (Edge AI), implementando la metodología ergonómica internacional RULA (Rapid Upper Limb Assessment, ISO 11226). 

Bajo el contrato estricto **Zero-Image Retention (CU09)**, la plataforma procesa los fotogramas en memoria volátil de forma efímera, destruyéndolos de inmediato sin almacenar archivos de video en disco ni transmitir secuencias visuales por la red. La comunicación con el backend se limita a vectores numéricos de telemetría de menos de 150 bytes.

---

## 2. Casos de Uso Implementados y Arquitectura de Ingeniería

| ID | Caso de Uso | Prioridad | Puntos | Estado | Resumen Técnico de Implementación |
|---|---|---|---|---|---|
| **CU06** | Calibración Dinámica de Postura Neutra y Entorno | Alta | 5 | **Completado** | Pipeline neuronal local con MediaPipe Pose Landmarker Lite (`/wasm` y `/models/pose_landmarker_lite.task`). Evaluación de iluminación, retícula dinámica Clean Tech en canvas sin máscaras fijas, detección de cara, vista y oclusión por manos, con captura del vector baseline de 3 segundos ($\theta_{\text{cuello}}, \theta_{\text{tronco}}$, luminancia). |
| **CU07** | Inferencia Articular 1:1 y Evaluación Ergonómica RULA | Alta | 13 | **Completado** | Seguimiento articular biomecánico en tiempo real a 200 ms. Cero esqueletos mock o inventados; renderizado reactivo verde/rojo según puntaje RULA (1 a 7 en 4 niveles de acción). Ingesta periódica de telemetría numérica en PostgreSQL (`POST /api/ergonomia/sesion/:id/muestra`). |
| **CU08** | Detección de Sobrecarga Estática e Intervención ErgoBreak | Media | 8 | **Completado** | Algoritmo acumulativo de inmovilidad muscular sostenida (> 60 segundos sin micromovimientos). Integración del reproductor interactivo de Pausa Activa (`ReproductorPausaActiva.tsx`) con rutinas guiadas de estiramiento y temporizador de recuperación. |
| **CU09** | Contrato Estricto Zero-Image Retention | Alta | 3 | **Completado** | Procesamiento exclusivo en la RAM del navegador (`ImageBitmap.close()`). Cero persistencia o transmisión de imágenes; verificación automatizada de payloads < 150 bytes. Modo Discreto de Privacidad para oficinas compartidas (oculta el video mientras mantiene la inferencia). |
| **CU10** | Motor de Alertas Anti-Fatiga y Consolidación de Sesión | Alta | 8 | **Completado** | Sistema de histéresis y enfriamiento (cooldown de 8s en [`useProcesadorAlertas.ts`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/features/ergonomia/hooks/useProcesadorAlertas.ts)) que previene la saturación de alertas, umbrales personalizables en UI, finalización formal de sesión (`POST /api/ergonomia/sesion/:id/finalizar`) con promedio ponderado e impacto en el historial de base de datos. |

---

## 3. Desglose de Ingeniería y Soluciones a Desafíos Complejos

### 3.1 Pipeline Local Edge AI (MediaPipe Pose Landmarker Lite)
- **Despliegue Local sin Dependencias Externas:** Los binarios WebAssembly y el modelo neuronal oficial `pose_landmarker_lite.task` (5.77 MB) fueron alojados localmente en `frontend/public/wasm/` y `frontend/public/models/`. Esto elimina fallas por desconexión a internet, bloqueos de cortafuegos corporativos o latencias de CDNs externas.
- **Detector Singleton con Respaldo CPU Transparente ([`detectorPose.ts`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/features/ergonomia/services/detectorPose.ts)):**  
  Intenta aceleración GPU por hardware; ante fallas de WebGL o controladores gráficos, conmuta automáticamente a CPU SIMD. Incluye la función quirúrgica `reiniciarDetectorPose()` para destruir texturas WebGL al cambiar de vistas.

### 3.2 Fórmulas Trigonométricas y Biomecánica Real ([`calculadorAngulosPose.ts`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/features/ergonomia/utils/calculadorAngulosPose.ts))
A partir de los 33 landmarks tridimensionales de MediaPipe, se calculan vectores articulares puros:
1. **Flexión de Cuello ($\theta_{\text{cuello}}$):**
   $$\theta_{\text{cuello}} = \arctan\left(\frac{|\Delta X_{\text{cabeza-hombros}}|}{|\Delta Y_{\text{cabeza-hombros}}|}\right) \times \frac{180}{\pi}$$
   Incluye ajuste por compresión vertical cefálica cuando el mentón se aproxima al esternón.
2. **Inclinación de Tronco ($\theta_{\text{tronco}}$):**
   Calculado entre el punto medio escapular (hombros 11 y 12) y el centro pélvico (caderas 23 y 24) respecto a la vertical gravitacional.
3. **Elevación de Brazos ($\theta_{\text{brazo}}$):**
   Mide el desplazamiento vertical del codo respecto al plano del hombro.
4. **Motor RULA ([`motorRula.ts`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/features/ergonomia/utils/motorRula.ts)):**  
   Mapea los vectores articulares a tablas ergonómicas normalizadas:
   - *Puntaje 1–2:* Nivel 1 (Aceptable / Óptimo, color verde esmeralda).
   - *Puntaje 3–4:* Nivel 2 (Investigación necesaria, color ámbar).
   - *Puntaje 5–6:* Nivel 3 (Modificación pronta requerida, color naranja).
   - *Puntaje 7:* Nivel 4 (Intervención y cambio inmediato, color rojo carmesí).

### 3.3 Erradicación de Monigotes Ficticios y Máscaras Rígidas
- **Esqueleto Articular Real ([`dibujadorEsqueleto.ts`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/features/ergonomia/utils/dibujadorEsqueleto.ts)):**  
  Se eliminaron por completo las coordenadas de respaldo fijas (*fallback mock points*). Si el usuario sale de cuadro o la visibilidad de los hombros/nariz es inferior a $0.40$, el canvas ejecuta `ctx.clearRect()` instantáneamente sin dibujar siluetas artificiales.
- **HUD Clean Tech Reactivo ([`dibujadorReticulaFacial.ts`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/features/ergonomia/utils/dibujadorReticulaFacial.ts)):**  
  Se eliminó el óvalo estático SVG de calibración. Ahora se dibuja una retícula dinámica con esquinas de seguimiento (*corner brackets*) que siguen la caja delimitadora facial del sujeto y puntos de mira sobre los ojos reales.

### 3.4 Motor de Detección de Oclusión y Manos ([`detectorFacialOclusion.ts`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/features/ergonomia/utils/detectorFacialOclusion.ts))
- **Mano en el Rostro:** Mide la distancia euclidiana entre las falanges y muñecas (landmarks 15 al 22) y el centro facial (landmarks 0, 2 y 5). Si la distancia es menor a $0.14$, alerta de inmediato: *"Rostro cubierto con la mano — Mantén tu vista libre"*.
- **Cámara Tapada:** Evalúa la luminancia en un micro-canvas de $16 \times 12$ píxeles. Si el promedio de brillo es inferior a 25, dispara: *"Cámara totalmente obstruida o tapada"*.

### 3.5 Arquitectura Anti-Fatiga de Alertas (Debounce de 8s)
- **Problema Detectado:** Al correr a 5 FPS, una postura incorrecta generaba 5 alertas por segundo (105 alertas en 90 segundos).
- **Solución ([`useProcesadorAlertas.ts`](file:///c:/Users/dell/Desktop/SW1/Principal/frontend/src/features/ergonomia/hooks/useProcesadorAlertas.ts)):** Se implementó una ventana de enfriamiento de 8 segundos. Si la condición de riesgo persiste, el banner visual se mantiene activo continuamente para educar al trabajador, pero el contador de incidentes y el tono acústico no se repiten hasta cumplido el período de histéresis.

### 3.6 Corrección Quirúrgica de Ciclo de Vida React en Streaming
- **Problema:** La cámara se encendía, se apagaba y volvía a encenderse quedando congelada. Se debía a que el estado `sessionId` estaba incluido en el arreglo de dependencias del efecto de la cámara, provocando que la respuesta asíncrona de la API ejecutara el cleanup del stream y cancelara el `requestAnimationFrame` del bucle de inferencia.
- **Solución:** Se separó la inicialización del hardware (`[]`, montaje único) del registro asíncrono en backend con bandera guardián (`sesionIniciadaRef`), garantizando streaming continuo y permanente sin parpadeos ni bloqueos.

---

## 4. Definición de Terminado (DoD) — Cumplimiento al 100%

- [x] Inferencia local ejecutada al 100% en el navegador del cliente con MediaPipe Pose Landmarker Lite.
- [x] Calibración dinámica neutra en 3 segundos con validación de iluminación, rostro y vista centrada.
- [x] Cálculo trigonométrico en tiempo real de ángulos de flexión de cuello, tronco y brazos.
- [x] Categorización de postura bajo el estándar ergonómico internacional RULA (Puntajes 1 a 7).
- [x] Detección de postura estática (> 60 segundos) con penalización de carga estática.
- [x] Cumplimiento absoluto del contrato Zero-Image Retention: payloads numéricos estrictamente < 150 bytes.
- [x] Módulo interactivo de Pausa Activa ErgoBreak con rutinas físicas compensatorias.
- [x] Motor de alertas anti-fatiga con cooldown de 8 segundos y retroalimentación sonora suave.
- [x] Finalización formal de sesión con cálculo de promedios e impacto consolidado en base de datos.
- [x] Regla Anti-Monolito cumplida: Todos los archivos de código tienen estrictamente menos de 250 líneas.
- [x] Suite de pruebas automatizadas aprobada al 100% (`qa-sprint2-ergonomia.js` y `test-cu09-zero-image-retention.js`).