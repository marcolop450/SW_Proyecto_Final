import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PlantillaPrivada } from '../components/layout/PlantillaPrivada';
import { RutaProtegidaPorRol, obtenerRutaPorDefecto } from '../auth/components/RutaProtegidaPorRol';
import { useAuth } from '../context/ContextoAutenticacion';

const PaginaInicioSesion = lazy(() =>
  import('../pages/auth/PaginaInicioSesion').then((m) => ({ default: m.PaginaInicioSesion }))
);
const PaginaRegistro = lazy(() =>
  import('../pages/auth/PaginaRegistro').then((m) => ({ default: m.PaginaRegistro }))
);
const PaginaDashboard = lazy(() =>
  import('../pages/dashboard/PaginaDashboard').then((m) => ({ default: m.PaginaDashboard }))
);
const PaginaOrganizaciones = lazy(() =>
  import('../pages/organizaciones/PaginaOrganizaciones').then((m) => ({ default: m.PaginaOrganizaciones }))
);
const PaginaUsuarios = lazy(() =>
  import('../pages/usuarios/PaginaUsuarios').then((m) => ({ default: m.PaginaUsuarios }))
);
const PaginaSuscripciones = lazy(() =>
  import('../pages/suscripciones/PaginaSuscripciones').then((m) => ({ default: m.PaginaSuscripciones }))
);
const PaginaPortalPostulante = lazy(() =>
  import('../features/evaluaciones/PaginaPortalPostulante').then((m) => ({ default: m.PaginaPortalPostulante }))
);
const PaginaMiErgonomia = lazy(() =>
  import('../features/ergonomia/PaginaMiErgonomia').then((m) => ({ default: m.PaginaMiErgonomia }))
);

const RedireccionRaiz: React.FC = () => {
  const { usuario } = useAuth();
  return <Navigate to={obtenerRutaPorDefecto(usuario?.rol)} replace />;
};

const CargadorRuta = () => (
  <div className="h-full w-full flex items-center justify-center p-12 text-slate-400">
    <div className="flex flex-col items-center gap-2.5">
      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono">Cargando módulo seguro...</span>
    </div>
  </div>
);

export const AppRoutes: React.FC = () => {
  const rolesAdmin = ['ADMIN_ORGANIZACION', 'SUPER_ADMINISTRADOR'];
  const rolesSst = ['SUPERVISOR', 'ADMIN_ORGANIZACION', 'SUPER_ADMINISTRADOR'];
  const rolesEmpleado = ['EMPLEADO', 'SUPERVISOR', 'ADMIN_ORGANIZACION', 'SUPER_ADMINISTRADOR'];
  const rolesPostulante = ['POSTULANTE', 'SUPER_ADMINISTRADOR'];

  return (
    <Suspense fallback={<CargadorRuta />}>
      <Routes>
        <Route path="/login" element={<PaginaInicioSesion />} />
        <Route path="/registro" element={<PaginaRegistro />} />

        <Route element={<PlantillaPrivada />}>
          <Route path="/" element={<RedireccionRaiz />} />

          {/* Portal Postulante */}
          <Route element={<RutaProtegidaPorRol rolesPermitidos={rolesPostulante} />}>
            <Route path="/portal-evaluacion" element={<PaginaPortalPostulante />} />
          </Route>

          {/* Portal Empleado */}
          <Route element={<RutaProtegidaPorRol rolesPermitidos={rolesEmpleado} />}>
            <Route path="/mi-ergonomia" element={<PaginaMiErgonomia />} />
          </Route>

          {/* Panel Supervisión SST y Dashboard */}
          <Route element={<RutaProtegidaPorRol rolesPermitidos={rolesSst} />}>
            <Route path="/dashboard" element={<PaginaDashboard />} />
          </Route>

          {/* Módulos Administrativos de Tenant */}
          <Route element={<RutaProtegidaPorRol rolesPermitidos={rolesAdmin} />}>
            <Route path="/organizaciones" element={<PaginaOrganizaciones />} />
            <Route path="/usuarios" element={<PaginaUsuarios />} />
            <Route path="/suscripciones" element={<PaginaSuscripciones />} />
          </Route>
        </Route>

        <Route path="*" element={<RedireccionRaiz />} />
      </Routes>
    </Suspense>
  );
};
