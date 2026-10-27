import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ApiErrorEnvelope, extraerErrorApi } from '../api/client';
import { NotificacionError, NotificacionItem } from '../components/ui/NotificacionError';

interface ContextoNotificacionTipo {
  notificacion: NotificacionItem | null;
  mostrarError: (err: unknown, titulo?: string) => void;
  mostrarExito: (mensaje: string, titulo?: string) => void;
  cerrar: () => void;
}

const ContextoNotificacion = createContext<ContextoNotificacionTipo>({} as any);

export const ProveedorNotificacion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificacion, setNotificacion] = useState<NotificacionItem | null>(null);

  const mostrarError = useCallback((err: unknown, titulo = 'Atención') => {
    const errorEnv: ApiErrorEnvelope = extraerErrorApi(err);
    setNotificacion({
      id: Math.random().toString(36).slice(2),
      tipo: 'error',
      titulo: `${titulo} (${errorEnv.statusCode})`,
      mensaje: errorEnv.message,
      errorReference: errorEnv.errorReference,
      statusCode: errorEnv.statusCode,
    });
  }, []);

  const mostrarExito = useCallback((mensaje: string, titulo = 'Operación Exitosa') => {
    setNotificacion({
      id: Math.random().toString(36).slice(2),
      tipo: 'exito',
      titulo,
      mensaje,
    });
  }, []);

  const cerrar = useCallback(() => {
    setNotificacion(null);
  }, []);

  useEffect(() => {
    if (!notificacion) return;
    const tiempoMs = notificacion.tipo === 'error' ? 6000 : 4000;
    const temporizador = setTimeout(() => {
      setNotificacion(null);
    }, tiempoMs);
    return () => clearTimeout(temporizador);
  }, [notificacion]);

  return (
    <ContextoNotificacion.Provider value={{ notificacion, mostrarError, mostrarExito, cerrar }}>
      {children}
      <NotificacionError notificacion={notificacion} alCerrar={cerrar} />
    </ContextoNotificacion.Provider>
  );
};

export const useNotificacion = () => useContext(ContextoNotificacion);
