# ADR-004: Ecosistema Unificado Full-Stack en TypeScript (Nest.js + React + React Native)

## Estado
Aceptado

## Contexto
El proyecto ErgoCheck AI requiere desarrollar tres frentes de software interconectados:
1. Una aplicación web para visores de trabajo/examen y dashboard de supervisión.
2. Un backend de alta concurrencia para ingesta de telemetría y lógica de negocio.
3. Una aplicación móvil nativa para recepción de alertas push y pausas activas.

Mantener lenguajes heterogéneos (ej. Python en backend, Dart en móvil y TypeScript en frontend) aumenta la fricción cognitiva del equipo de 5 estudiantes, fragmenta los modelos de dominio y duplica el esfuerzo de tipado.

## Decisión
Se decide unificar el 100% de las capas de desarrollo bajo el lenguaje **TypeScript**, utilizando:
- **Backend:** Nest.js (Node.js) con arquitectura modular e inyección de dependencias.
- **Frontend Web:** React 18+ con Hooks y gestión de estado con Zustand.
- **Móvil:** React Native para despliegue multiplataforma nativo (Android e iOS).

## Consecuencias
### Positivas
- **Compartición de Modelos y Tipos:** Se pueden compartir interfaces y DTOs de telemetría (muestras RULA, eventos, reglas) entre el cliente web, la app móvil y el servidor.
- **Curva de Aprendizaje Acelerada:** El equipo trabaja bajo un único paradigma sintáctico y herramientas comunes (ESLint, Prettier, Jest).
- **Consistencia en WebSockets y REST:** Mapeo directo de payloads JSON con tipado estricto extremo a extremo.

### Negativas / Mitigaciones
- **Bibliotecas de Generación de Reportes:** Python cuenta con ReportLab; en Node.js se debe utilizar alternativas maduras como `pdfmake`, `puppeteer` o `exceljs`.  
  *Mitigación:* Se adopta `pdfmake` y `exceljs` para la generación programática de reportes forenses en el backend Nest.js.
