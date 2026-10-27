import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/ContextoAutenticacion';

export const obtenerRutaPorDefecto = (rol?: string): string => {
  switch (rol) {
    case 'POSTULANTE':
      return '/portal-evaluacion';
    case 'EMPLEADO':
      return '/mi-ergonomia';
    case 'SUPERVISOR':
      return '/dashboard';
    case 'ADMIN_ORGANIZACION':
    case 'SUPER_ADMINISTRADOR':
      return '/dashboard';
    default:
      return '/login';
  }
};

interface Props {
  rolesPermitidos: string[];
  children?: React.ReactNode;
}

export const RutaProtegidaPorRol: React.FC<Props> = ({ rolesPermitidos, children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-slate-400">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  const tieneAcceso = rolesPermitidos.includes(usuario.rol);

  if (!tieneAcceso) {
    const destino = obtenerRutaPorDefecto(usuario.rol);
    return <Navigate to={destino} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
