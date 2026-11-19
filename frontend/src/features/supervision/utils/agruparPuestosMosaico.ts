import type { PuestoMonitoreo } from '../hooks/useWebSocketSupervisor';

export interface GrupoMosaico {
  clave: string;
  titulo: string;
  tipo: 'EXAMEN' | 'TELETRABAJO';
  puestos: PuestoMonitoreo[];
}

export function agruparPuestosMosaico(puestos: PuestoMonitoreo[]): GrupoMosaico[] {
  const grupos = new Map<string, GrupoMosaico>();

  for (const p of puestos) {
    const esTeletrabajo = p.tipo === 'TELETRABAJO';
    const clave = esTeletrabajo
      ? 'TELETRABAJO'
      : `EXAMEN:${p.examenTitulo?.trim() || 'Evaluación General'}`;

    if (!grupos.has(clave)) {
      grupos.set(clave, {
        clave,
        titulo: esTeletrabajo
          ? 'Jornadas de Teletrabajo'
          : `Examen: ${p.examenTitulo?.trim() || 'Evaluación General'}`,
        tipo: esTeletrabajo ? 'TELETRABAJO' : 'EXAMEN',
        puestos: [],
      });
    }
    grupos.get(clave)!.puestos.push(p);
  }

  return Array.from(grupos.values()).sort((a, b) => {
    if (a.tipo !== b.tipo) return a.tipo === 'EXAMEN' ? -1 : 1;
    return a.titulo.localeCompare(b.titulo);
  });
}
