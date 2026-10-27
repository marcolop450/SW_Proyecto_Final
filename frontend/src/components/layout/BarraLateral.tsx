import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  ShieldCheck,
  LogOut,
  X,
  Video,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/ContextoAutenticacion';
import { LogoErgoCheck } from '../ui/LogoErgoCheck';

interface Props {
  abiertoEnMovil?: boolean;
  alCerrarMovil?: () => void;
}

interface ItemNavegacion {
  to: string;
  label: string;
  icono: React.ComponentType<{ className?: string }>;
  roles: string[];
}

export const BarraLateral: React.FC<Props> = ({ abiertoEnMovil, alCerrarMovil }) => {
  const { usuario, cerrarSesion } = useAuth();
  const esSuperAdmin = usuario?.rol === 'SUPER_ADMINISTRADOR';

  const todosLosEnlaces: ItemNavegacion[] = [
    {
      to: '/portal-evaluacion',
      label: esSuperAdmin ? 'Simulador de Evaluación' : 'Sala de Evaluación',
      icono: Video,
      roles: ['POSTULANTE', 'SUPER_ADMINISTRADOR'],
    },
    {
      to: '/mi-ergonomia',
      label: esSuperAdmin ? 'Consola de Ergonomía' : 'Mi Ergonomía',
      icono: Activity,
      roles: ['EMPLEADO', 'SUPERVISOR', 'ADMIN_ORGANIZACION', 'SUPER_ADMINISTRADOR'],
    },
    {
      to: '/dashboard',
      label: esSuperAdmin
        ? 'Métricas Globales SaaS'
        : usuario?.rol === 'SUPERVISOR'
        ? 'Monitoreo SST'
        : 'Panel General SST',
      icono: LayoutDashboard,
      roles: ['SUPERVISOR', 'ADMIN_ORGANIZACION', 'SUPER_ADMINISTRADOR'],
    },
    {
      to: '/organizaciones',
      label: esSuperAdmin ? 'Directorio de Clientes' : 'Mi Organización',
      icono: Building2,
      roles: ['ADMIN_ORGANIZACION', 'SUPER_ADMINISTRADOR'],
    },
    {
      to: '/usuarios',
      label: esSuperAdmin ? 'Gestión Global de Usuarios' : 'Equipo y Puestos',
      icono: Users,
      roles: ['ADMIN_ORGANIZACION', 'SUPER_ADMINISTRADOR'],
    },
    {
      to: '/suscripciones',
      label: esSuperAdmin ? 'Ingresos y Planes SaaS' : 'Mi Plan y Facturación',
      icono: CreditCard,
      roles: ['ADMIN_ORGANIZACION', 'SUPER_ADMINISTRADOR'],
    },
  ];

  const enlacesVisibles = todosLosEnlaces.filter((item) =>
    usuario?.rol ? item.roles.includes(usuario.rol) : false
  );

  const contenido = (
    <div className="flex flex-col justify-between h-full p-4 select-none">
      <div className="space-y-6">
        {/* Marca Oficial B2B */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-2xs">
              <LogoErgoCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">ErgoCheck AI</h1>
              <p className="text-[10px] text-slate-500 font-mono">Telemetría SST & Vigilancia</p>
            </div>
          </div>

          {alCerrarMovil ? (
            <button
              type="button"
              onClick={alCerrarMovil}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          ) : null}
        </div>

        {/* Navegación Filtrada por Rol con Animación Suave sin Desplazamiento */}
        <nav className="space-y-1">
          {enlacesVisibles.map((item) => {
            const Icono = item.icono;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={alCerrarMovil}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150 border ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200/90 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border-transparent'
                  }`
                }
              >
                <Icono className="w-4 h-4 shrink-0 text-emerald-600/80" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Perfil Inferior y Cierre de Sesión */}
      <div className="pt-4 border-t border-slate-200/80 space-y-3">
        <div className="px-2">
          <p className="text-xs font-bold text-slate-800 truncate">
            {usuario?.nombre} {usuario?.apellido}
          </p>
          <p className="text-[11px] text-slate-500 truncate">{usuario?.correo}</p>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 font-mono">
            <ShieldCheck className="w-3 h-3" />
            <span className="uppercase">{usuario?.rol ? usuario.rol.replace('_', ' ') : 'USUARIO'}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={cerrarSesion}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Barra de escritorio */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/80 border-r border-slate-200/80 backdrop-blur-md h-screen sticky top-0 shrink-0">
        {contenido}
      </aside>

      {/* Menú móvil con animación deslizante suave */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          abiertoEnMovil ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          onClick={alCerrarMovil}
        />
        <aside
          className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
            abiertoEnMovil ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {contenido}
        </aside>
      </div>
    </>
  );
};
