import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { CampoTexto } from '../../components/ui/CampoTexto';
import { Boton } from '../../components/ui/Boton';
import { api } from '../../api/client';
import { useNotificacion } from '../../context/ContextoNotificacion';
import { CreditCard, CheckCircle2 } from 'lucide-react';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  alPagarExitoso: () => void;
  planSeleccionado: any;
  puestos: number;
}

export const ModalPagarSandbox: React.FC<Props> = ({
  abierto,
  alCerrar,
  alPagarExitoso,
  planSeleccionado,
  puestos,
}) => {
  const [tarjeta, setTarjeta] = useState('4242 •••• •••• 4242');
  const [expiracion, setExpiracion] = useState('12/28');
  const [cvc, setCvc] = useState('999');
  const [cargando, setCargando] = useState(false);
  const { mostrarError, mostrarExito } = useNotificacion();

  if (!planSeleccionado) return null;

  const montoTotal =
    planSeleccionado.tipo === 'SAAS_SEAT_MONTHLY'
      ? puestos * planSeleccionado.precioBase
      : planSeleccionado.precioBase;

  const procesarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const resp = await api.post('/suscripciones/pagar', {
        planType: planSeleccionado.tipo,
        puestos,
        numeroTarjetaSimulada: tarjeta,
      });
      mostrarExito(
        `Pago de $${montoTotal} USD procesado en Sandbox. Factura ${resp.data.factura.invoiceNumber} emitida.`,
        'Suscripción Activada',
      );
      alPagarExitoso();
      alCerrar();
    } catch (err) {
      mostrarError(err, 'Fallo en la pasarela sandbox');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Procesar Pago (Entorno Sandbox)"
      subtitulo={`Contratación de ${planSeleccionado.nombre}`}
    >
      <form onSubmit={procesarPago} className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-1">
          <div className="flex justify-between text-xs text-slate-700">
            <span>Monto Total:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              ${montoTotal.toFixed(2)} USD
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Periodo de facturación:</span>
            <span>Mensual (30 días)</span>
          </div>
        </div>

        <CampoTexto
          etiqueta="Número de Tarjeta de Prueba (Sandbox)"
          icono={CreditCard}
          value={tarjeta}
          onChange={(e) => setTarjeta(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <CampoTexto
            etiqueta="Expiración"
            placeholder="MM/AA"
            value={expiracion}
            onChange={(e) => setExpiracion(e.target.value)}
            required
          />
          <CampoTexto
            etiqueta="CVC de Prueba"
            placeholder="123"
            value={cvc}
            onChange={(e) => setCvc(e.target.value)}
            required
          />
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Esta transacción corre sobre el simulador sandbox. No se efectuará ningún débito real a tu tarjeta.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Boton type="button" variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={cargando} icono={CheckCircle2}>
            Confirmar y Pagar ${montoTotal.toFixed(2)}
          </Boton>
        </div>
      </form>
    </Modal>
  );
};
