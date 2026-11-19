# Diseño

Se reutiliza SupervisionSession: el endpoint de jornada activa filtra usuario, organización y estado; el progreso guarda contadores de la jornada activa con esos mismos límites. El navegador restaura el último avance confirmado. No se estima actividad durante intervalos sin seguimiento; una pausa activa se recupera solo en el navegador donde fue iniciada. El WebSocket vincula la sesión del usuario y envía latidos.

La duración real de la pausa se registra al reanudar o finalizar. La presencia genera eventos solo en transiciones. Un fallo de cámara muestra estado no disponible. Los tiempos son aproximados y no miden actividad fuera de la página.

# Jornada personalizada

La meta de 4, 6 u 8 horas se guarda como evento de configuración asociado a la sesión. El avance usa los contadores disponibles y excluye descansos; la hora de salida se estima sin asumir pausas futuras. El control de privacidad detiene la cámara sin registrar ausencia y se conserva en el navegador de la sesión. El cierre requiere confirmación y puede guardar una nota opcional con la jornada. Un comprobante PDF se genera solo para la jornada finalizada del usuario autenticado y su organización.
