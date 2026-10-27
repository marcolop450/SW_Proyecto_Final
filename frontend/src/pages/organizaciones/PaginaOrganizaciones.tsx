import React, { useEffect, useState } from 'react';
import { Building2, Plus, Calendar, Hash, FolderTree } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/ContextoAutenticacion';
import { useNotificacion } from '../../context/ContextoNotificacion';
import { Boton } from '../../components/ui/Boton';
import { Insignia } from '../../components/ui/Insignia';
import { ModalNuevoDepartamento } from './ModalNuevoDepartamento';
import { DirectorioClientesSuperAdmin } from './DirectorioClientesSuperAdmin';

export const PaginaOrganizaciones: React.FC = () => {
  const { usuario } = useAuth();
  const esSuperAdmin = usuario?.rol === 'SUPER_ADMINISTRADOR';

  const [organizacion, setOrganizacion] = useState<any>(null);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [todasLasOrganizaciones, setTodasLasOrganizaciones] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const { mostrarError } = useNotificacion();

  const cargarDatos = async () => {
    try {
      if (esSuperAdmin) {
        const res = await api.get('/organizaciones/todas');
        setTodasLasOrganizaciones(res.data);
      } else {
        const [orgRes, deptosRes] = await Promise.all([
          api.get('/organizaciones/mi-organizacion'),
          api.get('/organizaciones/departamentos'),
        ]);
        setOrganizacion(orgRes.data);
        setDepartamentos(deptosRes.data);
      }
    } catch (err) {
      mostrarError(err, 'Error al cargar organizaciones');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [esSuperAdmin]);

  if (esSuperAdmin) {
    return <DirectorioClientesSuperAdmin organizaciones={todasLasOrganizaciones} />;
  }

  return (
    <div className="space-y-6">
      {/* Detalle de Organización */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {organizacion?.nombre || 'Cargando...'}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-mono">
                <Hash className="w-3.5 h-3.5 text-slate-400" />{' '}
                {organizacion?.identificacionFiscal || 'Sin NIT'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Registrada:{' '}
                {organizacion?.creadoEn ? new Date(organizacion.creadoEn).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        </div>
        <Insignia variante="marca">Tenant Activo</Insignia>
      </div>

      {/* Lista de Departamentos */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Departamentos y Divisiones</h3>
            <p className="text-xs text-slate-500">Estructura interna para asignación de roles y telemetría</p>
          </div>
          <Boton icono={Plus} onClick={() => setModalAbierto(true)}>
            Nuevo Departamento
          </Boton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {departamentos.map((dep, idx) => (
            <div
              key={dep.id}
              className={`bg-white border border-slate-200/80 rounded-xl p-4 space-y-2 shadow-2xs hover:shadow-md transition-all animate-fade-up stagger-${
                (idx % 5) + 1
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <FolderTree className="w-4 h-4 text-emerald-600" />
                  <span>{dep.nombre}</span>
                </div>
                <Insignia variante="neutro">{dep._count?.membresias || 0} miembros</Insignia>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {dep.descripcion || 'Sin descripción adicional para este departamento.'}
              </p>
            </div>
          ))}
          {departamentos.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 col-span-3 text-center bg-white rounded-xl border border-slate-200/60">
              No hay departamentos configurados aún. Haz clic en "Nuevo Departamento" para crear uno.
            </p>
          ) : null}
        </div>
      </div>

      <ModalNuevoDepartamento
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        alCrear={cargarDatos}
      />
    </div>
  );
};
