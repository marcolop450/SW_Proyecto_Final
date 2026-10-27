# ADR-003: Motor de Correlación de Incidentes Basado en Reglas Declarativas

## Estado
Aceptado

## Contexto
En el modo de evaluación y proctoring, el sistema debe cruzar múltiples eventos asíncronos (p. ej. `QUESTION_SHOWN`, `GAZE_DOWN_SUSTAINED`, `WINDOW_BLUR`) para determinar si amerita alertar al evaluador sobre una posible conducta deshonesta. Se evaluó el uso de modelos opacos de Machine Learning versus un motor determinista basado en reglas declarativas.

## Decisión
Se decide implementar un **motor de correlación basado en reglas declarativas (YAML / JSON)** evaluadas sobre una cola en memoria con ventana temporal deslizante en el backend FastAPI. Los incidentes producidos se consideran **indicios para auditoría humana** y no veredictos automáticos.

## Consecuencias
### Positivas
- **Explicabilidad Total (Explainable AI / XAI):** Cada incidente emitido incluye la lista exacta de eventos que lo dispararon y una justificación en lenguaje natural, facilitando la defensa del postulante o la auditoría del docente.
- **Parametrización por Tenant:** Las instituciones pueden ajustar ponderaciones, tiempos de tolerancia y umbrales de severidad sin necesidad de reentrenar modelos ni modificar código fuente.
- **Bajo Costo Computacional:** Evaluación en $O(N)$ sobre buffers pequeños de eventos por sesión activa.

### Negativas / Mitigaciones
- **Rigidez Inicial:** Reglas estáticas pueden requerir afinamiento para evitar falsos positivos (p. ej. estudiantes que miran sus hojas de apuntes en exámenes de desarrollo matemático).  
  *Mitigación:* Se provee en el dashboard una función de "Desestimar Incidente" para el evaluador humano, alimentando un registro de calibración de reglas.
