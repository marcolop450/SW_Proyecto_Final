# Manual de Usuario — ErgoCheck AI

Plataforma empresarial multi-tenant de **Seguridad y Salud en el Trabajo (SST)**, **Telemetría Biomecánica Edge AI (ISO 11226 / RULA)** y **Supervisión Conductual Anti-Cheat** con privacidad **Zero-Image Retention**.

---

## 1. Acceso al Sistema y Requisitos Previos

### 1.1 Requisitos del Navegador y Hardware
- **Navegador recomendado:** Google Chrome, Microsoft Edge o Brave (versión actualizada con soporte WebAssembly y WebGL).
- **Periféricos:** Cámara web funcional (720p o superior) y conexión estable a internet.
- **Privacidad garantizada:** Todo el procesamiento de video (detección postural y facial con MediaPipe) ocurre **100% en la memoria RAM local del navegador**. Nunca se graban ni se envían imágenes o videos al servidor.

### 1.2 Inicio de Sesión y Registro
1. Ingresa a la página principal (`/`) para conocer la plataforma y haz clic en **Iniciar Sesión** (`/login`) o **Crear Cuenta** (`/registro`).
2. Introduce tu **correo electrónico** y **contraseña**.
3. Si tu usuario aún no tiene un **Consentimiento Informado Digital** vigente (o fue revocado), el sistema te mostrará automáticamente la pantalla de **Autorización Legal** antes de acceder a cualquier módulo:
   - Lee los términos de procesamiento local Edge AI.
   - Marca la casilla de aceptación y confirma para registrar tu firma digital auditada (con fecha, hora e IP).
   - *Nota:* Puedes revocar tu consentimiento en cualquier momento desde el indicador **Consentimiento: Vigente** en la barra superior.

---

## 2. Guía por Rol de Usuario

### 2.1 Postulante (`/portal-evaluacion`)
Diseñado para candidatos que rinden evaluaciones o entrevistas supervisadas:
1. **Verificación de Periféricos:** Pulsa **Iniciar Prueba de Periféricos** para validar cámara web, micrófono y latencia antes del examen.
2. **Ingreso con Código Temporal:** Introduce el **código de acceso** entregado por tu evaluador (ejemplo: `EXAM-XXXXXX`) para abrir el cuestionario externo dentro del visor supervisado.
3. **Reglas durante la Evaluación:**
   - Mantén **pantalla completa** activa y no cambies de pestaña (`WINDOW_BLUR` queda auditado).
   - Los atajos de copiado, pegado e inspección (`Ctrl+C`, `Ctrl+V`, `F12`, `PrintScreen`, clic derecho) se bloquean y registran automáticamente.
   - Mantén tu rostro centrado e iluminado (la ausencia > 5s o presencia de múltiples rostros genera alertas).

### 2.2 Empleado (`/mi-ergonomia` y `/teletrabajo`)
#### A. Monitoreo Postural en Tiempo Real (`/mi-ergonomia`)
1. Pulsa **Iniciar Calibración** y mantén una postura erguida frente a la cámara durante **3 segundos** para capturar tu postura neutra (*baseline* de cuello, tronco e iluminación).
2. Durante la jornada, el sistema calcula tu puntaje **RULA (1 a 7)** en tiempo real:
   - **Verde (1–2):** Postura óptima.
   - **Ámbar (3–4):** Atención recomendada.
   - **Naranja / Rojo (5–7):** Riesgo ergonómico; el sistema emite alertas anti-fatiga con enfriamiento inteligente.
3. **Pausas Activas (ErgoBreak):** Si permaneces inmóvil por más de 60 segundos, se activa la recomendación de estiramiento guiado.
4. **Modo Discreto:** Puedes ocultar la vista previa de video mientras la telemetría continúa funcionando localmente.
5. **Mi Historial:** Consulta tus sesiones anteriores, promedio RULA y alertas en la pestaña **Mi Historial**.

#### B. Consola de Teletrabajo (`/teletrabajo`)
1. Haz clic en **Iniciar Jornada** para activar el control de dedicación efectiva (tiempo activo vs. ocioso > 3 min) y presencia.
2. Utiliza **Solicitar Descanso / Pausa** para registrar pausas justificadas (almuerzo, pausa activa, hidratación) sin afectar tus métricas de productividad.
3. Al terminar el turno, pulsa **Finalizar Jornada** para consolidar tu resumen diario en el historial.

### 2.3 Supervisor SST / Evaluador (`/dashboard`, `/cuestionarios`, `/consola-supervision`, `/reportes`)
1. **Dashboard SST (`/dashboard`):** Resumen ejecutivo de métricas ergonómicas y actividad organizacional.
2. **Gestión de Cuestionarios (`/cuestionarios`):**
   - Crea evaluaciones vinculadas a formularios externos (ej. Google Forms), define duración y fecha de expiración.
   - Genera y copia **códigos temporales de acceso** para los postulantes y configura preguntas de control para entrevistas.
3. **Consola de Supervisión en Tiempo Real (`/consola-supervision`):**
   - **Mosaico Semáforo en Vivo:** Visualiza todos los puestos activos en 5 estados:
     - **Verde:** Postura y foco óptimos.
     - **Amarillo:** Desvío de mirada o ventana inactiva.
     - **Naranja:** Riesgo ergonómico elevado (RULA ≥ 5).
     - **Rojo:** Anomalía crítica (múltiples rostros, sospecha de dispositivo oculto).
     - **Gris:** Puesto desconectado (watchdog > 15 segundos sin latido).
   - **Motor de Correlación y Línea de Tiempo:** Selecciona una sesión para ejecutar el análisis de reglas multidimensionales, revisar las señales explicativas (`signals`) y **auditar cada incidente** como **Confirmado**, **Desestimado** o **Falso Positivo** con justificación técnica.
   - **Cierre de Sesión e Índices:** Cierra sesiones para calcular automáticamente el **Índice de Integridad** (0–100) y el **Índice de Bienestar Ergonómico** (0–100).
4. **Centro de Reportes (`/reportes`):**
   - **Reporte Ergonómico Corporativo (`.xlsx`):** Descarga archivo Excel multi-pestaña con distribución RULA y detalle de eventos.
   - **Dictamen Forense Individual (`.pdf`):** Descarga informe pericial con línea de tiempo, índices y **sello criptográfico SHA-256**.

### 2.4 Administrador de Organización (`/organizaciones`, `/usuarios`, `/suscripciones`, `/bitacora`)
- **Organización y Departamentos (`/organizaciones`):** Gestiona la estructura interna de áreas y departamentos de tu empresa.
- **Usuarios y Roles (`/usuarios`):** Invita colaboradores, asigna departamentos y administra roles (`EMPLEADO`, `SUPERVISOR`, `POSTULANTE`, `ADMIN_ORGANIZACION`).
- **Planes y Facturación (`/suscripciones`):** Cotiza puestos adicionales, cambia de plan y descarga comprobantes de pago.
- **Bitácora Inmutable WORM (`/bitacora`):**
  - Consulta el historial de auditoría agrupado por categorías (**Eventos Técnicos**, **Accesos a Datos**, **Cambios de Políticas**).
  - Verifica la integridad matemática de la cadena **SHA-256** (detección de alteraciones).
  - Exporta registros filtrados en formato **Excel (`.xlsx`)**.

### 2.5 Super Administrador (`/suscripciones` y administración global)
- Opera la **Consola Financiera de Ingresos Globales SaaS** (MRR consolidado, clientes activos y facturación global de toda la plataforma) y supervisa organizaciones multi-tenant.

---

## 3. Aplicación Móvil (`movil/` - Expo / React Native)
- Disponible para iOS/Android con autenticación por rol:
  - **Empleado:** Consulta semáforo postural, bandeja de alertas, registro y justificación de pausas activas con feedback háptico.
  - **Supervisor:** Mosaico de puestos en vivo y auditoría rápida de incidentes desde el móvil.
  - **Admin / SuperAdmin:** Panel de salud ocupacional y estado global SaaS.

---

## 4. Solución de Problemas Frecuentes
- **La cámara no inicia:** Verifica que el navegador tenga permisos de cámara concedidos para `localhost` o el dominio HTTPS y que ninguna otra aplicación (Zoom, Teams, OBS) esté bloqueando el dispositivo.
- **Error `403 ERR_CONSENT_REQUIRED`:** Tu consentimiento informado no está vigente o fue revocado; vuelve a aceptarlo desde la pantalla de autorización.
- **El puesto aparece en Gris en el Mosaico:** El evaluado perdió conexión o superó los 15 segundos sin enviar *heartbeat*; al reconectar su sesión volverá a estado activo automáticamente.
