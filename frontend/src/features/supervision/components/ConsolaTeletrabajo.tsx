import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import { useConexionJornada } from '../hooks/useConexionJornada';
import { PanelMetaJornada } from './PanelMetaJornada';
import { DialogoFinalizarJornada } from './DialogoFinalizarJornada';
import { ReproductorPausaActiva } from '../../ergonomia/ReproductorPausaActiva';
import { descargarComprobanteJornada } from '../services/comprobanteJornada';

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
  const [estadoPresencia, setEstadoPresencia] = useState<EstadoPresencia>('NO_DISPONIBLE');

  const [error, setError] = useState('');
  const [metaHoras, setMetaHoras] = useState(8);
  const [privacidad, setPrivacidad] = useState(false);
  const [mostrarEjercicio, setMostrarEjercicio] = useState(false);
  const [confirmarCierre, setConfirmarCierre] = useState(false);
  const [notaJornada, setNotaJornada] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [recuperando, setRecuperando] = useState(true);
  const [comprobacionFallida, setComprobacionFallida] = useState(false);
  const presenciaAnterior = useRef<EstadoPresencia>('NO_DISPONIBLE');
  const enDescanso = descansoActivo !== null;
  const jornadaEnCurso = estadoJornada === 'ACTIVA';

  const { tiempoActivoSeg, tiempoOciosoSeg, tiempoDescansoSeg, estaOcioso, establecerTiempos } = useMedidorDedicacion(
    jornadaEnCurso,
    enDescanso
  );

  useConexionJornada(sessionId, jornadaEnCurso, { tiempoActivoSeg, tiempoOciosoSeg, tiempoDescansoSeg }, setError);

  useEffect(() => {
    let montado = true;
    api.get('/supervision/sesiones/teletrabajo/activa').then(res => {
      if (!montado || !res.data) return;
      const jornada = res.data;
      let segundosPausaSinGuardar = 0;
      const metaGuardada = (jornada.eventosConducta || []).find((evento: any) => evento.tipo === 'JORNADA_CONFIGURACION')?.detalles?.metaHoras;
      setMetaHoras([4, 6, 8].includes(metaGuardada) ? metaGuardada : 8);
      setHistorialPausas((jornada.eventosConducta || []).filter((evento: any) => evento.tipo === 'PAUSA_DESCANSO').map((evento: any) => ({
        id: evento.id,
        opcion: { id: evento.detalles?.opcionId || 'personal', titulo: evento.detalles?.titulo || 'Descanso', descripcion: '', duracionMin: evento.detalles?.duracionMin || 0, categoria: evento.detalles?.categoria || 'personal' },
        horaInicio: new Date(evento.detalles?.inicio || evento.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duracionSegundos: Math.floor((evento.duracionMs || 0) / 1000),
      })));
      setSessionId(jornada.id);
      setHoraInicio(new Date(jornada.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      try {
        setPrivacidad(localStorage.getItem(`ergocheck_privacidad_${jornada.id}`) === 'pausada');
        const guardado = localStorage.getItem(`ergocheck_pausa_${jornada.id}`);
        if (guardado) {
          const pausa = JSON.parse(guardado);
          if (pausa?.opcion?.id && Number.isFinite(pausa.inicioTimestamp) && pausa.inicioTimestamp <= Date.now()) {
            const ultimoGuardado = new Date(jornada.updatedAt).getTime();
            segundosPausaSinGuardar = Math.max(0, Math.floor((Date.now() - Math.max(pausa.inicioTimestamp, Number.isFinite(ultimoGuardado) ? ultimoGuardado : pausa.inicioTimestamp)) / 1000));
            setDescansoActivo(pausa);
          }
        }
      } catch { setPrivacidad(true); }
      establecerTiempos(jornada.tiempoActivoSeg || 0, jornada.tiempoOciosoSeg || 0, (jornada.tiempoFueraSeg || 0) + segundosPausaSinGuardar);
      setEstadoJornada('ACTIVA');
      setError('Jornada recuperada. Los tiempos reflejan el último avance guardado; el intervalo sin conexión no se calcula.');
    }).catch(() => { if (montado) { setComprobacionFallida(true); setError('No se pudo comprobar si tienes una jornada activa. Actualiza la página para intentarlo de nuevo.'); } })
      .finally(() => { if (montado) setRecuperando(false); });
    return () => { montado = false; };
  }, [establecerTiempos]);

  const formatoTiempo = (segs: number) => {
    const h = Math.floor(segs / 3600);
    const m = Math.floor((segs % 3600) / 60);
    const s = segs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalSeg = tiempoActivoSeg + tiempoOciosoSeg;
  const ratioProductivo = totalSeg > 0 ? Math.round((tiempoActivoSeg / totalSeg) * 100) : 0;

  const iniciarJornada = async () => {
    if (ocupado || recuperando) return;
    setOcupado(true); setError('');
    try {
      const res = await api.post('/supervision/sesion/iniciar', { codigoAcceso: 'TELETRABAJO', tipo: 'TELETRABAJO', metaHoras });
      if (!res.data?.id) throw new Error('No se recibió el identificador de la jornada.');
      establecerTiempos();
      setSessionId(res.data.id);
      setHoraInicio(new Date(res.data.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setEstadoJornada('ACTIVA');
    } catch { setError('No se pudo iniciar la jornada. Comprueba tu conexión y vuelve a intentarlo.'); }
    finally { setOcupado(false); }
  };

  const finalizarJornada = async () => {
    if (!sessionId || ocupado) return;
    setOcupado(true); setError('');
    try {
      if (descansoActivo) await guardarDescanso(descansoActivo);
      await api.post(`/supervision/sesion/${sessionId}/finalizar`, { tiempoActivoSeg, tiempoOciosoSeg, tiempoFueraSeg: tiempoDescansoSeg, notaJornada: notaJornada.trim() || undefined });
      try {
        localStorage.removeItem(`ergocheck_pausa_${sessionId}`);
        localStorage.removeItem(`ergocheck_privacidad_${sessionId}`);
      } catch { /* La jornada ya quedó cerrada en el servidor. */ }
      setDescansoActivo(null);
      setHoraFin(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setEstadoJornada('FINALIZADA');
      setConfirmarCierre(false); setPrivacidad(false); setMostrarEjercicio(false);
    } catch { setError('No se pudo finalizar la jornada. Comprueba la conexión y vuelve a intentarlo.'); }
    finally { setOcupado(false); }
  };

  const reiniciarJornada = () => {
    setEstadoJornada('PENDIENTE');
    setSessionId(null);
    setHoraInicio(null);
    setHoraFin(null);
    setDescansoActivo(null);
    setHistorialPausas([]);
    setNotaJornada(''); setMetaHoras(8); setPrivacidad(false);
    establecerTiempos();
    presenciaAnterior.current = 'NO_DISPONIBLE';
  };

  const iniciarDescanso = (opcion: OpcionDescanso) => {
    if (!sessionId) return;
    const ahora = new Date();
    const pausa = { opcion, inicioTimestamp: Date.now(), horaInicio: ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    try { localStorage.setItem(`ergocheck_pausa_${sessionId}`, JSON.stringify(pausa)); }
    catch { setError('No se pudo guardar la pausa en este navegador.'); return; }
    setDescansoActivo(pausa); setModalDescansoAbierto(false);
  };

  const alternarPrivacidad = () => {
    if (!sessionId || enDescanso) return;
    const pausada = !privacidad;
    try {
      localStorage.setItem(`ergocheck_privacidad_${sessionId}`, pausada ? 'pausada' : 'activa');
      setPrivacidad(pausada);
    } catch { setError('No se pudo guardar la preferencia de cámara en este navegador.'); }
  };

  const guardarDescanso = async (pausa: NonNullable<typeof descansoActivo>) => {
    if (!sessionId) return;
    const duracionSeg = Math.max(0, Math.floor((Date.now() - pausa.inicioTimestamp) / 1000));
    await api.post(`/supervision/sesion/${sessionId}/evento`, { tipo: 'PAUSA_DESCANSO', severidad: 'LOW', duracionMs: duracionSeg * 1000, detalles: { opcionId: pausa.opcion.id, titulo: pausa.opcion.titulo, categoria: pausa.opcion.categoria, duracionMin: pausa.opcion.duracionMin, inicio: new Date(pausa.inicioTimestamp).toISOString() } });
    setHistorialPausas(prev => [{ id: `p-${pausa.inicioTimestamp}`, opcion: pausa.opcion, horaInicio: pausa.horaInicio, duracionSegundos: duracionSeg }, ...prev]);
    try { localStorage.removeItem(`ergocheck_pausa_${sessionId}`); } catch { /* La pausa ya se guardó en el servidor. */ }
    setDescansoActivo(null);
  };

  const reanudarJornada = async () => {
    if (!descansoActivo || ocupado) return;
    setOcupado(true); setError('');
    try { await guardarDescanso(descansoActivo); }
    catch { setError('No se pudo registrar la pausa. Revisa tu conexión y vuelve a intentar.'); }
    finally { setOcupado(false); }
  };

  const handleCambioPresencia = useCallback((nuevoEstado: EstadoPresencia) => {
    if (presenciaAnterior.current === nuevoEstado) return;
    const anterior = presenciaAnterior.current;
    presenciaAnterior.current = nuevoEstado;
    setEstadoPresencia(nuevoEstado);
    if (!sessionId) return;
    if (nuevoEstado === 'AUSENTE' || nuevoEstado === 'MULTIPLE') {
      api.post(`/supervision/sesion/${sessionId}/evento`, { tipo: nuevoEstado === 'AUSENTE' ? 'FACE_ABSENT' : 'MULTIPLE_FACES', severidad: 'MEDIUM', duracionMs: nuevoEstado === 'AUSENTE' ? 10000 : 2000, detalles: { modulo: 'TELETRABAJO' } }).catch(() => setError('No se pudo guardar un evento de presencia.'));
    } else if (nuevoEstado === 'PRESENTE' && ['AUSENTE', 'MULTIPLE', 'REPOSO', 'NO_DISPONIBLE'].includes(anterior)) {
      api.post(`/supervision/sesion/${sessionId}/evento`, { tipo: 'PRESENCIA_RESTABLECIDA', severidad: 'LOW', detalles: { modulo: 'TELETRABAJO' } }).catch(() => setError('No se pudo guardar el cambio de presencia.'));
    }
  }, [sessionId]);

  return (
    <div className="space-y-4">
      {error && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</div>}
      {/* Cabecera y Selector de Pestañas */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pb-3 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Seguimiento de jornada y presencia
          </h1>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${estadoJornada === 'ACTIVA' ? 'text-emerald-700' : 'text-slate-500'}`}>
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${estadoJornada === 'ACTIVA' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {estadoJornada === 'ACTIVA' ? `Activa desde ${horaInicio}` : estadoJornada === 'FINALIZADA' ? 'Finalizada' : 'Pendiente de inicio'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
                disabled={ocupado}
                onClick={() => setConfirmarCierre(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-rose-700" />
                <span>Finalizar</span>
              </button>
            </>
          )}
        </div>
      </div>

      <DialogoFinalizarJornada abierto={confirmarCierre} ocupado={ocupado} nota={notaJornada} error={error} onNota={setNotaJornada} onCerrar={() => setConfirmarCierre(false)} onConfirmar={finalizarJornada} />
      {/* Vista Historial */}
      {pestanaActiva === 'HISTORIAL' && <HistorialJornadasTeletrabajo />}

      {/* Vista Jornada en Vivo */}
      {(pestanaActiva === 'EN_VIVO' || jornadaEnCurso) && (
        <div hidden={pestanaActiva !== 'EN_VIVO'}>
          {estadoJornada === 'PENDIENTE' && (recuperando ? <p className="p-4 text-sm text-slate-500">Comprobando jornada activa...</p> : <PanelInicioJornada onIniciar={iniciarJornada} deshabilitado={ocupado || comprobacionFallida} metaHoras={metaHoras} onCambiarMeta={setMetaHoras} />)}
          {estadoJornada === 'FINALIZADA' && (
            <PanelResumenJornada
              horaInicio={horaInicio || '--:--'}
              horaFin={horaFin || '--:--'}
              tiempoActivoSeg={tiempoActivoSeg}
              tiempoOciosoSeg={tiempoOciosoSeg}
              tiempoDescansoSeg={tiempoDescansoSeg}
              historialPausas={historialPausas}
              notaJornada={notaJornada}
              onDescargar={() => { if (sessionId) descargarComprobanteJornada(sessionId).catch(() => setError('No se pudo descargar el comprobante. Inténtalo de nuevo.')); }}
              onReiniciar={reiniciarJornada}
            />
          )}
          {estadoJornada === 'ACTIVA' && (
            <>
              <div className="space-y-4">
              <PanelMetaJornada metaHoras={metaHoras} segundosJornada={tiempoActivoSeg + tiempoOciosoSeg} enPausa={enDescanso} />
              {descansoActivo && (
                <BannerDescansoActivo
                  descanso={descansoActivo.opcion}
                  inicioTimestamp={descansoActivo.inicioTimestamp}
                  onReanudar={reanudarJornada}
                />
              )}
              {descansoActivo && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><button type="button" onClick={() => setMostrarEjercicio(true)} className="font-semibold underline underline-offset-2">Hacer pausa activa guiada · 2 minutos</button><p className="mt-1 text-xs">Puedes cerrar el ejercicio sin terminar tu descanso.</p></div>}
              {mostrarEjercicio && descansoActivo && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-label="Pausa activa guiada"><ReproductorPausaActiva duracionEjercicioSeg={40} onCerrar={() => setMostrarEjercicio(false)} /></div>}
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
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"><div><p className="text-sm font-semibold text-slate-800">Control de cámara</p><p className="mt-1 text-xs text-slate-500">Puedes pausar la detección visual. No se registrará como ausencia mientras esté pausada.</p></div><button type="button" disabled={enDescanso} aria-pressed={privacidad} onClick={alternarPrivacidad} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{privacidad ? 'Reactivar detección' : 'Pausar cámara por privacidad'}</button></div>
                  <p className="text-xs text-slate-500">La detección se procesa en este navegador; este módulo no guarda ni envía fotogramas. Mientras la cámara está pausada, la presencia no se evalúa.</p>
                  <VisorPresenciaTeletrabajo
                    enDescanso={enDescanso || privacidad}
                    privacidad={privacidad && !enDescanso}
                    onCambioEstadoPresencia={handleCambioPresencia}
                  />
                </div>
                <div className="lg:col-span-1 space-y-4">
                  <HistorialPausasTeletrabajo historial={historialPausas} />
                </div>
              </div>
              </div>
              <ModalSelectorDescanso
                abierto={modalDescansoAbierto}
                onCerrar={() => setModalDescansoAbierto(false)}
                onSeleccionar={iniciarDescanso}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};
