import React, { useState, useCallback } from 'react';
import { Coffee, Square, Activity, Calendar } from 'lucide-react';
import { useMedidorDedicacion } from '../hooks/useMedidorDedicacion';
import { ModalSelectorDescanso, OpcionDescanso } from './ModalSelectorDescanso';
import { BannerDescansoActivo } from './BannerDescansoActivo';
import { VisorPresenciaTeletrabajo, EstadoPresencia } from './VisorPresenciaTeletrabajo';
import { HistorialPausasTeletrabajo, RegistroPausa } from './HistorialPausasTeletrabajo';
import { PanelInicioJornada } from './PanelInicioJornada';
import { PanelResumenJornada } from './PanelResumenJornada';
import { TarjetasMetricasTeletrabajo } from './TarjetasMetricasTeletrabajo';
import { HistorialJornadasTeletrabajo } from './HistorialJornadasTeletrabajo';
import { api } from '../../../api/client';

export type EstadoJornada = 'PENDIENTE' | 'ACTIVA' | 'FINALIZADA';

export const ConsolaTeletrabajo: React.FC = () => {
  const [pestanaActiva, setPestanaActiva] = useState<'EN_VIVO' | 'HISTORIAL'>('EN_VIVO');
  const [estadoJornada, setEstadoJornada] = useState<EstadoJornada>('PENDIENTE');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [horaInicio, setHoraInicio] = useState<string | null>(null);
  const [horaFin, setHoraFin] = useState<string | null>(null);
  const [modalDescansoAbierto, setModalDescansoAbierto] = useState(false);
  const [descansoActivo, setDescansoActivo] = useState<{
    opcion: OpcionDescanso;
    inicioTimestamp: number;
    horaInicio: string;
  } | null>(null);
  const [historialPausas, setHistorialPausas] = useState<RegistroPausa[]>([]);
  const [estadoPresencia, setEstadoPresencia] = useState<EstadoPresencia>('PRESENTE');

  const enDescanso = descansoActivo !== null;
  const jornadaEnCurso = estadoJornada === 'ACTIVA';

  const { tiempoActivoSeg, tiempoOciosoSeg, tiempoDescansoSeg, estaOcioso, reiniciarContadores } = useMedidorDedicacion(
    jornadaEnCurso,
    enDescanso
  );

  const formatoTiempo = (segs: number) => {
    const h = Math.floor(segs / 3600);
    const m = Math.floor((segs % 3600) / 60);
    const s = segs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalSeg = tiempoActivoSeg + tiempoOciosoSeg;
  const ratioProductivo = totalSeg > 0 ? Math.round((tiempoActivoSeg / totalSeg) * 100) : 100;

  const iniciarJornada = async () => {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHoraInicio(hora);
    setEstadoJornada('ACTIVA');

    try {
      const res = await api.post('/supervision/sesion/iniciar', {
        codigoAcceso: 'TELETRABAJO',
        tipo: 'TELETRABAJO',
      });
      if (res.data?.id) setSessionId(res.data.id);
    } catch (err) {
      console.warn('Iniciando jornada localmente sin red backend:', err);
    }
  };

  const finalizarJornada = async () => {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHoraFin(hora);
    if (descansoActivo) reanudarJornada();
    setEstadoJornada('FINALIZADA');

    if (sessionId) {
      try {
        await api.post(`/supervision/sesion/${sessionId}/finalizar`, {
          tiempoActivoSeg,
          tiempoOciosoSeg,
          tiempoFueraSeg: tiempoDescansoSeg,
          scoreIntegridad: 100,
        });
      } catch (err) {
        console.warn('Error al consolidar sesión en base de datos:', err);
      }
    }
  };

  const reiniciarJornada = () => {
    reiniciarContadores();
    setEstadoJornada('PENDIENTE');
    setSessionId(null);
    setHoraInicio(null);
    setHoraFin(null);
    setDescansoActivo(null);
    setHistorialPausas([]);
  };

  const iniciarDescanso = (opcion: OpcionDescanso) => {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setDescansoActivo({ opcion, inicioTimestamp: Date.now(), horaInicio: hora });
    setModalDescansoAbierto(false);

    if (sessionId) {
      api.post(`/supervision/sesion/${sessionId}/evento`, {
        tipo: 'PAUSA_DESCANSO',
        severidad: 'LOW',
        duracionMs: opcion.duracionMin * 60 * 1000,
        detalles: { opcionId: opcion.id, titulo: opcion.titulo },
      }).catch(() => {});
    }
  };

  const reanudarJornada = useCallback(() => {
    if (!descansoActivo) return;
    const duracionSeg = Math.max(1, Math.floor((Date.now() - descansoActivo.inicioTimestamp) / 1000));
    const nuevoRegistro: RegistroPausa = {
      id: `p-${Date.now()}`,
      opcion: descansoActivo.opcion,
      horaInicio: descansoActivo.horaInicio,
      duracionSegundos: duracionSeg,
    };
    setHistorialPausas((prev) => [nuevoRegistro, ...prev]);
    setDescansoActivo(null);
  }, [descansoActivo]);

  const handleCambioPresencia = useCallback((nuevoEstado: EstadoPresencia) => {
    setEstadoPresencia(nuevoEstado);
    if (!sessionId) return;
    if (nuevoEstado === 'AUSENTE' || nuevoEstado === 'MULTIPLE') {
      api.post(`/supervision/sesion/${sessionId}/evento`, {
        tipo: nuevoEstado === 'AUSENTE' ? 'FACE_ABSENT' : 'MULTIPLE_FACES',
        severidad: 'MEDIUM',
        duracionMs: nuevoEstado === 'AUSENTE' ? 10000 : 2000,
        detalles: { modulo: 'TELETRABAJO' },
      }).catch(() => {});
    }
  }, [sessionId]);

  return (
    <div className="space-y-6">
      {/* Cabecera y Selector de Pestañas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              Modo Teletrabajo
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {estadoJornada === 'ACTIVA' ? `Jornada Activa (Inicio: ${horaInicio})` :
               estadoJornada === 'FINALIZADA' ? 'Jornada Finalizada' : 'Pendiente de Inicio'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Panel de Dedicación Efectiva y Presencia
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setPestanaActiva('EN_VIVO')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pestanaActiva === 'EN_VIVO' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Jornada en Vivo</span>
            </button>
            <button
              onClick={() => setPestanaActiva('HISTORIAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                pestanaActiva === 'HISTORIAL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Mi Historial</span>
            </button>
          </div>

          {jornadaEnCurso && pestanaActiva === 'EN_VIVO' && (
            <>
              <button
                onClick={() => setModalDescansoAbierto(true)}
                disabled={enDescanso}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                  enDescanso
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
                }`}
              >
                <Coffee className="w-3.5 h-3.5 text-amber-600" />
                <span>Pausa</span>
              </button>
              <button
                onClick={finalizarJornada}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-rose-700" />
                <span>Finalizar</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Vista Historial */}
      {pestanaActiva === 'HISTORIAL' && <HistorialJornadasTeletrabajo />}

      {/* Vista Jornada en Vivo */}
      {pestanaActiva === 'EN_VIVO' && (
        <>
          {estadoJornada === 'PENDIENTE' && <PanelInicioJornada onIniciar={iniciarJornada} />}
          {estadoJornada === 'FINALIZADA' && (
            <PanelResumenJornada
              horaInicio={horaInicio || '--:--'}
              horaFin={horaFin || '--:--'}
              tiempoActivoSeg={tiempoActivoSeg}
              tiempoOciosoSeg={tiempoOciosoSeg}
              tiempoDescansoSeg={tiempoDescansoSeg}
              historialPausas={historialPausas}
              onReiniciar={reiniciarJornada}
            />
          )}
          {estadoJornada === 'ACTIVA' && (
            <>
              {descansoActivo && (
                <BannerDescansoActivo
                  descanso={descansoActivo.opcion}
                  inicioTimestamp={descansoActivo.inicioTimestamp}
                  onReanudar={reanudarJornada}
                />
              )}
              <TarjetasMetricasTeletrabajo
                tiempoActivoSeg={tiempoActivoSeg}
                tiempoOciosoSeg={tiempoOciosoSeg}
                tiempoDescansoSeg={tiempoDescansoSeg}
                estaOcioso={estaOcioso}
                totalPausas={historialPausas.length}
                estadoPresencia={estadoPresencia}
                enDescanso={enDescanso}
                ratioProductivo={ratioProductivo}
                formatoTiempo={formatoTiempo}
              />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <VisorPresenciaTeletrabajo
                    enDescanso={enDescanso}
                    onCambioEstadoPresencia={handleCambioPresencia}
                  />
                </div>
                <div className="lg:col-span-1 space-y-4">
                  <HistorialPausasTeletrabajo historial={historialPausas} />
                </div>
              </div>
              <ModalSelectorDescanso
                abierto={modalDescansoAbierto}
                onCerrar={() => setModalDescansoAbierto(false)}
                onSeleccionar={iniciarDescanso}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};
