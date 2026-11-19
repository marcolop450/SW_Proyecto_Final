import { api } from '../../../api/client';

export async function descargarComprobanteJornada(sessionId: string) {
  const respuesta = await api.get(`/supervision/sesiones/teletrabajo/${sessionId}/comprobante`, { responseType: 'blob' });
  const url = URL.createObjectURL(respuesta.data);
  const enlace = document.createElement('a');
  enlace.href = url; enlace.download = `jornada-${sessionId.slice(0, 8)}.pdf`;
  document.body.appendChild(enlace); enlace.click(); enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
