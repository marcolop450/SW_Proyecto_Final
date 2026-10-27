import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { CampoTexto } from '../../components/ui/CampoTexto';
import { Boton } from '../../components/ui/Boton';
import { api } from '../../api/client';
import { useNotificacion } from '../../context/ContextoNotificacion';
import { Plus } from 'lucide-react';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
  alCrear: () => void;
}

export const ModalNuevoDepartamento: React.FC<Props> = ({ abierto, alCerrar, alCrear }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cargando, setCargando] = useState(false);
  const { mostrarError, mostrarExito } = useNotificacion();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      await api.post('/organizaciones/departamentos', { nombre, descripcion });
      mostrarExito('Departamento creado exitosamente.', 'Organización');
      setNombre('');
      setDescripcion('');
      alCrear();
      alCerrar();
    } catch (err) {
      mostrarError(err, 'No se pudo crear el departamento');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal abierto={abierto} alCerrar={alCerrar} titulo="Nuevo Departamento" subtitulo="Añadir una nueva división organizativa">
      <form onSubmit={manejarEnvio} className="space-y-4">
        <CampoTexto
          etiqueta="Nombre del Departamento"
          placeholder="Ej: Auditoría y Calidad"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <CampoTexto
          etiqueta="Descripción (Opcional)"
          placeholder="Propósito y alcance del departamento"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Boton type="button" variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" cargando={cargando} icono={Plus}>
            Crear Departamento
          </Boton>
        </div>
      </form>
    </Modal>
  );
};
