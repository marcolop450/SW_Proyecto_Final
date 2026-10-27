import React from 'react';
import { Building2, Users, FolderTree, CreditCard, Calendar, Hash, ShieldCheck } from 'lucide-react';
import { Insignia } from '../../components/ui/Insignia';

interface Props {
  organizaciones: any[];
}

export const DirectorioClientesSuperAdmin: React.FC<Props> = ({ organizaciones }) => {
  const totalUsuarios = organizaciones.reduce(
    (acc, org) => acc + (org._count?.membresias || 0),
    0
  );
  const totalSuscripcionesActivas = organizaciones.filter(
    (org) => org.suscripciones && org.suscripciones.length > 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Resumen Global SaaS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-1 animate-fade-up">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Empresas Clientes</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">{organizaciones.length}</p>
          <span className="inline-block text-[11px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Tenants en Plataforma
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-1 animate-fade-up stagger-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Usuarios Registrados</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">{totalUsuarios}</p>
          <span className="inline-block text-[11px] text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            Colaboradores Totales
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-1 animate-fade-up stagger-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Planes SaaS Activos</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">{totalSuscripcionesActivas}</p>
          <span className="inline-block text-[11px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Contratos Vigentes
          </span>
        </div>
      </div>

      {/* Directorio de Empresas Clientes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Directorio Global Multi-Tenant</h3>
            <p className="text-xs text-slate-500">
              Vista centralizada exclusiva para el Super Administrador de la plataforma
            </p>
          </div>
          <Insignia variante="marca">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Control Maestro</span>
          </Insignia>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizaciones.map((org, idx) => {
            const plan = org.suscripciones?.[0];
            return (
              <div
                key={org.id}
                className={`bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs hover:shadow-md transition-all animate-fade-up stagger-${
                  (idx % 5) + 1
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{org.nombre}</h4>
                      <p className="text-[11px] font-mono text-slate-400">slug: {org.slug}</p>
                    </div>
                  </div>
                  <Insignia variante="exito">Activo</Insignia>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                      <Hash className="w-3.5 h-3.5 text-slate-400" /> NIT / Fiscal:
                    </span>
                    <span className="font-mono text-slate-800 font-medium">
                      {org.identificacionFiscal || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <FolderTree className="w-3.5 h-3.5 text-slate-400" /> Departamentos:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {org.departamentos?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> Miembros Asignados:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {org._count?.membresias || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Plan Suscrito:
                    </span>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {plan ? plan.planType.replace('_', ' ') : 'SIN PLAN'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" /> Alta: {new Date(org.creadoEn).toLocaleDateString()}
                  </span>
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    Tenant ID: {org.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
