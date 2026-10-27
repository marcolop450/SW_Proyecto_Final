import React, { useEffect, useState } from 'react';
import { UserPlus, Shield, Mail, FolderTree } from 'lucide-react';
import { api } from '../../api/client';
import { useNotificacion } from '../../context/ContextoNotificacion';
import { Boton } from '../../components/ui/Boton';
import { Insignia } from '../../components/ui/Insignia';
import { ModalInvitarUsuario } from './ModalInvitarUsuario';

export const PaginaUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const { mostrarError } = useNotificacion();

  const cargarDatos = async () => {
    try {
      const [usrRes, deptRes] = await Promise.all([
        api.get('/usuarios'),
        api.get('/organizaciones/departamentos'),
      ]);
      setUsuarios(usrRes.data);
      setDepartamentos(deptRes.data);
    } catch (err) {
      mostrarError(err, 'Error al listar usuarios');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const obtenerVarianteRol = (rol: string) => {
    if (rol.includes('ADMIN')) return 'marca';
    if (rol === 'SUPERVISOR') return 'advertencia';
    if (rol === 'EVALUADOR') return 'azul';
    return 'neutro';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Equipo y Control de Acceso (RBAC)
          </h2>
          <p className="text-xs text-slate-500">
            Administra los permisos y roles de los miembros en la organización
          </p>
        </div>
        <Boton icono={UserPlus} onClick={() => setModalAbierto(true)}>
          Invitar Miembro
        </Boton>
      </div>

      {/* Tabla Limpia y Responsiva */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden animate-fade-up">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Colaborador</th>
                <th className="py-3.5 px-4 font-semibold">Rol en Tenant</th>
                <th className="py-3.5 px-4 font-semibold">Departamento</th>
                <th className="py-3.5 px-4 font-semibold">Fecha Ingreso</th>
                <th className="py-3.5 px-4 font-semibold text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {u.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          {u.nombre} {u.apellido}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <Mail className="w-3 h-3 text-slate-400" /> {u.correo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Insignia variante={obtenerVarianteRol(u.rol)}>
                      <Shield className="w-3 h-3" />
                      <span>{u.rol.replace('_', ' ')}</span>
                    </Insignia>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <FolderTree className="w-3.5 h-3.5 text-slate-400" />
                      {u.departamento}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(u.fechaIngreso).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                    <span className="text-emerald-700 font-semibold text-xs">Activo</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ModalInvitarUsuario
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        alInvitar={cargarDatos}
        departamentos={departamentos}
      />
    </div>
  );
};
