import React from 'react';
import { CheckCircle2, Hand, ShieldAlert, UserX, UserCheck } from 'lucide-react';

export type EstadoAlineacion =
  | 'CENTRADO'
  | 'DESVIADO_IZQ'
  | 'DESVIADO_DER'
  | 'SIN_PERSONA'
  | 'MANO_TAPA_CARA'
  | 'CAMARA_TAPADA';

interface Props {
  estado: EstadoAlineacion;
}

export const BadgeEstadoCalibracion: React.FC<Props> = ({ estado }) => {
  const badgeColor =
    estado === 'CENTRADO'
      ? 'rgba(16, 185, 129, 0.95)'
      : estado === 'DESVIADO_IZQ' || estado === 'DESVIADO_DER'
      ? 'rgba(245, 158, 11, 0.95)'
      : 'rgba(239, 68, 68, 0.95)';

  return (
    <div
      className="absolute top-3 left-3 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-mono flex items-center gap-2 shadow-sm border border-white/30 text-white transition-colors duration-300"
      style={{ backgroundColor: badgeColor }}
    >
      {estado === 'CENTRADO' && <CheckCircle2 className="w-4 h-4 text-white" />}
      {estado === 'MANO_TAPA_CARA' && <Hand className="w-4 h-4 text-white animate-pulse" />}
      {estado === 'CAMARA_TAPADA' && <ShieldAlert className="w-4 h-4 text-white animate-pulse" />}
      {estado === 'SIN_PERSONA' && <UserX className="w-4 h-4 text-white" />}
      {(estado === 'DESVIADO_IZQ' || estado === 'DESVIADO_DER') && <UserCheck className="w-4 h-4 text-white" />}
      <span className="font-semibold">
        {estado === 'CENTRADO'
          ? 'Rostro y Vista Centrados'
          : estado === 'MANO_TAPA_CARA'
          ? 'Rostro cubierto con la mano'
          : estado === 'CAMARA_TAPADA'
          ? 'Cámara tapada u obstruida'
          : estado === 'SIN_PERSONA'
          ? 'Sin Persona / Vista Oculta'
          : estado === 'DESVIADO_IZQ'
          ? 'Centra tu cuerpo a la derecha'
          : 'Centra tu cuerpo a la izquierda'}
      </span>
    </div>
  );
};
