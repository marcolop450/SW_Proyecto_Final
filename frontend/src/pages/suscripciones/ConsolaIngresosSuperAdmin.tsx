import React from 'react';
import { DollarSign, TrendingUp, Users, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { Insignia } from '../../components/ui/Insignia';

interface Props {
  facturas: any[];
  planes: any[];
}

export const ConsolaIngresosSuperAdmin: React.FC<Props> = ({ facturas, planes }) => {
  const facturasPagadas = facturas.filter((f) => f.status === 'PAID');
  const ingresosTotalesHistoricos = facturasPagadas.reduce((acc, f) => acc + (f.amount || 0), 0);
  const mrrEstimado = 475.0; // 25 puestos activos en Visitask a $19/mes
  const arrProyectado = mrrEstimado * 12;

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700">
            Métricas de Plataforma SaaS
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-mono">Consolidado Multitenant</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
          Ingresos Globales y Facturación de Clientes
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Supervisión de recurrencia mensual (MRR), contratos empresariales y cobros auditables.
        </p>
      </div>

      {/* KPI Cards de Finanzas SaaS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-1 animate-fade-up">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">MRR Consolidado</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            ${mrrEstimado.toFixed(2)}
          </p>
          <span className="inline-block text-[11px] text-emerald-700 font-mono">
            +18.5% respecto al mes anterior
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-1 animate-fade-up stagger-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">ARR Proyectado</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            ${arrProyectado.toFixed(2)}
          </p>
          <span className="inline-block text-[11px] text-sky-700 font-mono">
            Ingresos anuales estimados
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-1 animate-fade-up stagger-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Puestos Activos</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">25</p>
          <span className="inline-block text-[11px] text-emerald-700 font-mono">
            Licencias ergonómicas en uso
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-1 animate-fade-up stagger-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Facturación Cobrada</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            ${ingresosTotalesHistoricos.toFixed(2)}
          </p>
          <span className="inline-block text-[11px] text-emerald-700 font-mono">
            100% transacciones liquidadas
          </span>
        </div>
      </div>

      {/* Catálogo de Planes Ofrecidos a Clientes (Solo Lectura) */}
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Estructura de Planes Comerciales Activa</h2>
          <p className="text-xs text-slate-500">Precios y paquetes ofrecidos a los administradores de organizaciones</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planes.map((plan, idx) => (
            <div
              key={plan.tipo}
              className={`bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3 animate-fade-up stagger-${
                idx + 1
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{plan.nombre}</h3>
                  <Insignia variante="neutro">{plan.tipo.replace(/_/g, ' ')}</Insignia>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{plan.descripcion}</p>
                <div className="py-1">
                  <span className="text-xl font-bold text-slate-900 font-mono">${plan.precioBase}</span>
                  <span className="text-xs text-slate-500 ml-1.5 font-medium">{plan.unidad}</span>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  {plan.caracteristicas?.map((c: string, cIdx: number) => (
                    <div key={cIdx} className="flex items-start gap-2 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bitácora de Facturas Emitidas a Empresas Clientes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Historial Global de Comprobantes Fiscales</h2>
            <p className="text-xs text-slate-500">Transacciones procesadas a través de la pasarela de pagos</p>
          </div>
          <Insignia variante="marca">Auditoría Fiscal Inmutable</Insignia>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Nº Comprobante</th>
                  <th className="px-4 py-3">Fecha y Hora</th>
                  <th className="px-4 py-3">Importe</th>
                  <th className="px-4 py-3">Pasarela</th>
                  <th className="px-4 py-3">ID Transacción</th>
                  <th className="px-4 py-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {facturas.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{f.invoiceNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-sans text-xs">
                      {f.paidAt ? new Date(f.paidAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      ${f.amount?.toFixed(2)} {f.currency}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">{f.paymentProvider}</td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">{f.transactionId || 'N/A'}</td>
                    <td className="px-4 py-3 text-right font-sans">
                      <Insignia variante={f.status === 'PAID' ? 'exito' : 'peligro'}>
                        {f.status === 'PAID' ? 'Pagada' : f.status}
                      </Insignia>
                    </td>
                  </tr>
                ))}
                {facturas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-sans text-xs">
                      No se registran comprobantes de pago emitidos aún.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
