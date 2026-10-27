import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { CampoTexto } from '../../components/ui/CampoTexto';
import { Boton } from '../../components/ui/Boton';
import { api } from '../../api/client';
import { useNotificacion } from '../../context/ContextoNotificacion';
import { UserPlus } from 'lucide-react';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  alInvitar: () => void;
  departamentos: Array<{ id: string; nombre: string }>;
}

export const ModalInvitarUsuario: React.FC<Props> = ({
  abierto,
  alCerrar,
  alInvitar,
  departamentos,
}) => {
  const [correo, setCorreo] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [rol, setRol] = useState('EMPLEADO');
  const [departamentoId, setDepartamentoId] = useState('');
  const [cargando, setCargando] = useState(false);
  const { mostrarError, mostrarExito } = useNotificacion();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      await api.post('/usuarios/invitar', {
        correo,
        nombre,
        apellido,
        rol,
        departamentoId: departamentoId || undefined,
      });
      mostrarExito('Miembro invitado exitosamente.', 'Equipo');
      alInvitar();
      alCerrar();
    } catch (err) {
      mostrarError(err, 'No se pudo invitar al usuario');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Invitar Colaborador"
      subtitulo="Asignar rol y departamento dentro del tenant"
    >
      <form onSubmit={manejarEnvio} className="space-y-4">
        <CampoTexto
          etiqueta="Correo Electrónico"
          type="email"
          placeholder="colaborador@empresa.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <CampoTexto
            etiqueta="Nombre"
            placeholder="Ana"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <CampoTexto
            etiqueta="Apellido"
            placeholder="Torres"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">Rol Institucional (RBAC)</label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 hover:border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 shadow-2xs transition-all"
          >
            <option value="ADMIN_ORGANIZACION">Administrador de Organización</option>
            <option value="SUPERVISOR">Supervisor SST</option>
            <option value="EVALUADOR">Evaluador de Proctoring</option>
            <option value="EMPLEADO">Empleado (SST)</option>
            <option value="POSTULANTE">Postulante (Exámenes)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">Departamento Asignado</label>
          <select
            value={departamentoId}
            onChange={(e) => setDepartamentoId(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 hover:border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 shadow-2xs transition-all"
          >
            <option value="">Sin departamento inicial</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Boton type="button" variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={cargando} icono={UserPlus}>
            Registrar Colaborador
          </Boton>
        </div>
      </form>
    </Modal>
  );
};
