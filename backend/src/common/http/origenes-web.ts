import { ConfigService } from '@nestjs/config';

const ORIGENES_LOCALES = ['localhost', '127.0.0.1'].flatMap(host =>
  ['', ':3000', ':5173', ':4173'].map(puerto => `http://${host}${puerto}`),
);

export type PermitirOrigen = (origen: string | undefined) => boolean;

export function crearPoliticaDeOrigenes(config: ConfigService): PermitirOrigen {
  const valor = config.get<string>('WEB_ALLOWED_ORIGINS');
  const permitidos = new Set(
    valor === undefined
      ? (config.get('NODE_ENV') === 'production' ? [] : ORIGENES_LOCALES)
      : valor.split(',').map(origen => origen.trim()).filter(Boolean).map(normalizarOrigen),
  );

  return origen => origen === undefined || permitidos.has(origen);
}

function normalizarOrigen(valor: string): string {
  try {
    const origen = new URL(valor);
    if (/^https?:\/\/[^/?#]+\/?$/i.test(valor) && origen.pathname === '/' && !origen.username && !origen.password) {
      return origen.origin;
    }
  } catch {
    // Se usa el mismo error para URLs inválidas y formatos no admitidos.
  }
  throw new Error('WEB_ALLOWED_ORIGINS debe contener orígenes HTTP o HTTPS sin ruta ni credenciales.');
}
