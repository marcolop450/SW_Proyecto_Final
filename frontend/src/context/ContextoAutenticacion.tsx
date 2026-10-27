import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export interface UsuarioSesion {
  id: string;
  correo: string;
  nombre: string;
  apellido: string;
  rol: string;
  organizationId: string;
  organizationName: string;
  departamentoId?: string | null;
  departamentoNombre?: string | null;
}

interface ContextoAutenticacionTipo {
  usuario: UsuarioSesion | null;
  token: string | null;
  cargando: boolean;
  tieneConsentimiento: boolean;
  iniciarSesion: (correo: string, clave: string) => Promise<UsuarioSesion>;
  registrar: (datos: {
    correo: string;
    clave: string;
    nombre: string;
    apellido: string;
    organizacionNombre?: string;
  }) => Promise<UsuarioSesion>;
  cerrarSesion: () => void;
  actualizarEstadoConsentimiento: () => Promise<void>;
  revocarConsentimiento: () => Promise<void>;
}

const ContextoAutenticacion = createContext<ContextoAutenticacionTipo>({} as any);

export const ProveedorAutenticacion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ergocheck_token'));
  const [tieneConsentimiento, setTieneConsentimiento] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true);

  const actualizarEstadoConsentimiento = async () => {
    try {
      const resp = await api.get('/consentimiento/estado');
      setTieneConsentimiento(Boolean(resp.data?.tieneConsentimiento));
    } catch {
      setTieneConsentimiento(false);
    }
  };

  const revocarConsentimiento = async () => {
    try {
      await api.post('/consentimiento/revocar');
      setTieneConsentimiento(false);
    } catch {
      setTieneConsentimiento(false);
    }
  };

  useEffect(() => {
    const cargarPerfil = async () => {
      const tokenGuardado = localStorage.getItem('ergocheck_token');
      if (!tokenGuardado) {
        setCargando(false);
        return;
      }
      try {
        const [respPerfil, respConsent] = await Promise.all([
          api.get('/auth/perfil'),
          api.get('/consentimiento/estado'),
        ]);
        setTieneConsentimiento(Boolean(respConsent.data?.tieneConsentimiento));
        setUsuario(respPerfil.data.usuario);
      } catch {
        cerrarSesion();
      } finally {
        setCargando(false);
      }
    };
    cargarPerfil();
  }, []);

  const iniciarSesion = async (correo: string, clave: string): Promise<UsuarioSesion> => {
    const resp = await api.post('/auth/login', { correo, clave });
    const { token: nuevoToken, usuario: datosUsuario } = resp.data;
    localStorage.setItem('ergocheck_token', nuevoToken);

    let estadoConsentimiento = false;
    try {
      const respConsent = await api.get('/consentimiento/estado', {
        headers: { Authorization: `Bearer ${nuevoToken}` },
      });
      estadoConsentimiento = Boolean(respConsent.data?.tieneConsentimiento);
    } catch {
      estadoConsentimiento = false;
    }

    setToken(nuevoToken);
    setTieneConsentimiento(estadoConsentimiento);
    setUsuario(datosUsuario);
    return datosUsuario;
  };

  const registrar = async (datos: any): Promise<UsuarioSesion> => {
    const resp = await api.post('/auth/registro', datos);
    const { token: nuevoToken, usuario: datosUsuario } = resp.data;
    localStorage.setItem('ergocheck_token', nuevoToken);

    let estadoConsentimiento = false;
    try {
      const respConsent = await api.get('/consentimiento/estado', {
        headers: { Authorization: `Bearer ${nuevoToken}` },
      });
      estadoConsentimiento = Boolean(respConsent.data?.tieneConsentimiento);
    } catch {
      estadoConsentimiento = false;
    }

    setToken(nuevoToken);
    setTieneConsentimiento(estadoConsentimiento);
    setUsuario(datosUsuario);
    return datosUsuario;
  };

  const cerrarSesion = () => {
    localStorage.removeItem('ergocheck_token');
    setToken(null);
    setUsuario(null);
    setTieneConsentimiento(false);
  };

  return (
    <ContextoAutenticacion.Provider
      value={{
        usuario,
        token,
        cargando,
        tieneConsentimiento,
        iniciarSesion,
        registrar,
        cerrarSesion,
        actualizarEstadoConsentimiento,
        revocarConsentimiento,
      }}
    >
      {children}
    </ContextoAutenticacion.Provider>
  );
};

export const useAuth = () => useContext(ContextoAutenticacion);
