import React, { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  CreditCard,
  ShieldCheck,
  Activity,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/ContextoAutenticacion';
import { api } from '../../api/client';
import { Insignia } from '../../components/ui/Insignia';

export const PaginaDashboard: React.FC = () => {
  const { usuario } = useAuth();
  const [metricas, setMetricas] = useState({
    totalMiembros: 0,
    totalDepartamentos: 0,
    planNombre: 'Cargando...',
    estadoPlan: 'TRIAL',
  });

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        const [orgRes, deptosRes, subRes] = await Promise.all([
          api.get('/organizaciones/mi-organizacion'),
          api.get('/organizaciones/departamentos'),
          api.get('/suscripciones/actual'),
        ]);

        setMetricas({
          totalMiembros: orgRes.data._count?.membresias || 1,
          totalDepartamentos: deptosRes.data.length || 0,
          planNombre: subRes.data?.suscripcion?.planType || 'Sin Plan Activo',
          estadoPlan: subRes.data?.suscripcion?.status || 'TRIAL',
        });
      } catch {
        // Fallback silencioso con defaults
      }
    };
    cargarResumen();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida Editorial sin Cajas Repetitivas */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-up">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700">
              Vigilancia Ocupacional & Telemetría
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">Consola Operativa</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">
            {usuario?.rol === 'SUPER_ADMINISTRADOR'
              ? 'Métricas Globales de Plataforma'
              : `Panel de Control: ${usuario?.organizationName || 'Organización'}`}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sesión activa para {usuario?.nombre} {usuario?.apellido} ({usuario?.rol ? usuario.rol.replace('_', ' ') : 'Usuario'}).
          </p>
        </div>
      </div>

      {/* Tarjetas de Métricas - Flat Layered Depth con Staggered Reveal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs hover:shadow-md transition-all animate-fade-up stagger-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Colaboradores</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {metricas.totalMiembros}
          </p>
          <p className="text-[11px] text-slate-400">Miembros en la organización</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs hover:shadow-md transition-all animate-fade-up stagger-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Departamentos</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {metricas.totalDepartamentos}
          </p>
          <p className="text-[11px] text-slate-400">Áreas organizacionales</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs hover:shadow-md transition-all animate-fade-up stagger-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Estado de Plan</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900 font-mono truncate">
            {metricas.planNombre}
          </p>
          <p className="text-[11px] text-slate-400">Estado: {metricas.estadoPlan}</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-2xs hover:shadow-md transition-all animate-fade-up stagger-4">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Consentimiento</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 font-mono tracking-tight">
            Activo
          </p>
          <p className="text-[11px] text-slate-400">Cámara y telemetría autorizadas</p>
        </div>
      </div>

      {/* Servicios Complementarios de la Suite */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-2 shadow-2xs hover:shadow-md transition-all animate-fade-up stagger-5">
          <div className="flex items-center gap-2.5 text-slate-800 font-bold text-sm">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
            <span>Motor Ergonómico y Postura RULA</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Canal de telemetría biométrica con inferencia local de alta eficiencia y destrucción segura de buffers en memoria para máxima privacidad.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-2 shadow-2xs hover:shadow-md transition-all animate-fade-up stagger-6">
          <div className="flex items-center gap-2.5 text-slate-800 font-bold text-sm">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Eye className="w-4 h-4" />
            </div>
            <span>Supervisión y Proctoring Digital</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Evaluaciones y entrevistas certificadas con control de integridad, validación de presencia y auditoría bajo consentimiento informado.
          </p>
        </div>
      </div>
    </div>
  );
};
