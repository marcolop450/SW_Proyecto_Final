import React, { useEffect, useState } from 'react';
import { CreditCard, Check, ArrowRight, FileText, Sliders } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/ContextoAutenticacion';
import { useNotificacion } from '../../context/ContextoNotificacion';
import { Boton } from '../../components/ui/Boton';
import { Insignia } from '../../components/ui/Insignia';
import { ModalPagarSandbox } from './ModalPagarSandbox';
import { ConsolaIngresosSuperAdmin } from './ConsolaIngresosSuperAdmin';

export const PaginaSuscripciones: React.FC = () => {
  const { usuario } = useAuth();
  const esSuperAdmin = usuario?.rol === 'SUPER_ADMINISTRADOR';

  const [planes, setPlanes] = useState<any[]>([]);
  const [suscripcionActual, setSuscripcionActual] = useState<any>(null);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [puestos, setPuestos] = useState<number>(10);
  const [planParaPagar, setPlanParaPagar] = useState<any>(null);
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const { mostrarError } = useNotificacion();

  const cargarDatos = async () => {
    try {
      const [planesRes, subRes, factRes] = await Promise.all([
        api.get('/suscripciones/planes'),
        api.get('/suscripciones/actual'),
        api.get('/suscripciones/facturas'),
      ]);
      setPlanes(planesRes.data);
      setSuscripcionActual(subRes.data?.suscripcion);
      setFacturas(factRes.data);
    } catch (err) {
      mostrarError(err, 'Error al cargar información de suscripción');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirPago = (plan: any) => {
    setPlanParaPagar(plan);
    setModalPagoAbierto(true);
  };

  if (esSuperAdmin) {
    return <ConsolaIngresosSuperAdmin facturas={facturas} planes={planes} />;
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Planes y Facturación SaaS</h2>
        <p className="text-xs text-slate-500">
          Contrata y administra la capacidad de puestos y evaluaciones de la organización
        </p>
      </div>

      {/* Control deslizante de cotización interactiva para plan por puesto */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up stagger-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Cotizador Dinámico de Puestos</h4>
            <p className="text-[11px] text-slate-500">Ajusta la cantidad de colaboradores con monitoreo ergonómico</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={100}
            value={puestos}
            onChange={(e) => setPuestos(Number(e.target.value))}
            className="w-36 sm:w-48 accent-emerald-600 cursor-pointer"
          />
          <div className="font-mono text-sm font-bold text-slate-800 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
            {puestos} <span className="text-[11px] font-normal text-slate-500">puestos</span>
          </div>
        </div>
      </div>

      {/* Planes de Suscripción */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {planes.map((plan, idx) => {
          const esPlanActual = suscripcionActual?.planType === plan.tipo;
          const precioCalculado =
            plan.tipo === 'SAAS_SEAT_MONTHLY' ? puestos * plan.precioBase : plan.precioBase;

          return (
            <div
              key={plan.tipo}
              className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between border transition-all animate-fade-up stagger-${
                idx + 2
              } ${
                esPlanActual
                  ? 'bg-emerald-50/40 border-emerald-300 shadow-sm'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{plan.nombre}</h3>
                  {esPlanActual ? <Insignia variante="marca">Plan Activo</Insignia> : null}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{plan.descripcion}</p>

                <div className="py-2">
                  <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                    ${precioCalculado.toFixed(0)}
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5 font-medium">
                    {plan.tipo === 'SAAS_SEAT_MONTHLY' ? `USD / mes (${puestos} puestos)` : plan.unidad}
                  </span>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  {plan.caracteristicas.map((c: string, cIdx: number) => (
                    <div key={cIdx} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100">
                <Boton
                  onClick={() => abrirPago(plan)}
                  variante={esPlanActual ? 'secundario' : 'primario'}
                  icono={ArrowRight}
                  className="w-full text-xs"
                >
                  {esPlanActual ? 'Renovar / Actualizar' : 'Contratar en Sandbox'}
                </Boton>
              </div>
            </div>
          );
        })}
      </div>

      {/* Historial de Comprobantes Digitales */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-bold text-slate-900">Comprobantes y Facturas Emitidas</h3>
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden animate-fade-up stagger-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Comprobante</th>
                  <th className="py-3 px-4 font-semibold">Monto</th>
                  <th className="py-3 px-4 font-semibold">Fecha de Emisión</th>
                  <th className="py-3 px-4 font-semibold">Transacción</th>
                  <th className="py-3 px-4 font-semibold text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facturas.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{f.invoiceNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      ${Number(f.amount).toFixed(2)} {f.currency}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {f.paidAt ? new Date(f.paidAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{f.transactionId}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Insignia variante="exito">PAGADA</Insignia>
                    </td>
                  </tr>
                ))}
                {facturas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                      No se registran facturas emitidas aún.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalPagarSandbox
        abierto={modalPagoAbierto}
        alCerrar={() => setModalPagoAbierto(false)}
        alPagarExitoso={cargarDatos}
        planSeleccionado={planParaPagar}
        puestos={puestos}
      />
    </div>
  );
};
