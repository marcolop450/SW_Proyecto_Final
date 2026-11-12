import React, { useState, useEffect } from 'react';
import { Plus, Link, Copy, Check, FileText, Send, Eye } from 'lucide-react';
import { api as clienteAxios } from '../../../api/client';
import { CuestionarioSupervisado } from '../types/supervision.types';

export const PanelGestionCuestionarios: React.FC = () => {
  const [cuestionarios, setCuestionarios] = useState<CuestionarioSupervisado[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const [titulo, setTitulo] = useState('');
  const [urlExterna, setUrlExterna] = useState('');
  const [tipo, setTipo] = useState<'EXAMEN' | 'ENTREVISTA' | 'EVALUACION_LABORAL'>('EXAMEN');
  const [duracion, setDuracion] = useState(60);

  const cargarCuestionarios = async () => {
    try {
      const res = await clienteAxios.get('/supervision/cuestionarios');
      setCuestionarios(res.data);
    } catch (err) {
      console.error('Error al cargar cuestionarios:', err);
    }
  };

  useEffect(() => {
    cargarCuestionarios();
  }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clienteAxios.post('/supervision/cuestionarios', {
        titulo,
        urlExterna,
        tipo,
        duracionMinutos: Number(duracion),
      });
      setMostrarModal(false);
      setTitulo('');
      setUrlExterna('');
      cargarCuestionarios();
    } catch (err) {
      console.error('Error al crear cuestionario:', err);
    }
  };

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiadoId(codigo);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Cuestionarios y Evaluaciones Supervisadas</h2>
          <p className="text-xs text-slate-500">
            Gestiona exámenes en Google Forms o enlaces externos con códigos de acceso temporales.
          </p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
        >
          <Plus className="w-4 h-4 text-[#C6F432]" />
          Nuevo Cuestionario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cuestionarios.map((q) => (
          <div key={q.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {q.tipo}
              </span>
              <span className="text-xs font-mono text-slate-400">{q.duracionMinutos} min</span>
            </div>
            <h3 className="font-semibold text-sm text-slate-800 line-clamp-1">{q.titulo}</h3>
            
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 font-mono">Código de Acceso:</p>
                <p className="text-xs font-mono font-bold text-slate-900">{q.codigoAcceso}</p>
              </div>
              <button
                onClick={() => copiarCodigo(q.codigoAcceso)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition"
                title="Copiar código"
              >
                {copiadoId === q.codigoAcceso ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
              <span className="truncate max-w-[180px] font-mono text-[10px]">{q.urlExterna}</span>
              <a
                href={q.urlExterna}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <Eye className="w-3.5 h-3.5" />
                Probar
              </a>
            </div>
          </div>
        ))}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-900">Registrar Nuevo Cuestionario</h3>
            <form onSubmit={handleCrear} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Título de la Evaluación</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Examen de Ingreso Técnico 2026"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">URL del Formulario Externo (Google Forms)</label>
                <input
                  type="url"
                  required
                  value={urlExterna}
                  onChange={(e) => setUrlExterna(e.target.value)}
                  placeholder="https://docs.google.com/forms/..."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tipo de Sesión</label>
                  <select
                    value={tipo}
                    onChange={(e: any) => setTipo(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  >
                    <option value="EXAMEN">Examen / Certificación</option>
                    <option value="ENTREVISTA">Entrevista Psicotécnica</option>
                    <option value="EVALUACION_LABORAL">Evaluación Laboral</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Duración (minutos)</label>
                  <input
                    type="number"
                    min={10}
                    value={duracion}
                    onChange={(e) => setDuracion(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  >
                  </input>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Generar y Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
