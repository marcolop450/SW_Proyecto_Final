import { ConfigService } from '@nestjs/config';

export function obtenerSecretoJwt(config: ConfigService): string {
  const secreto = config.get<string>('JWT_SECRET');
  if (!secreto?.trim()) {
    throw new Error('JWT_SECRET debe configurarse antes de iniciar la API.');
  }
  if (config.get<string>('NODE_ENV') === 'production' && secreto.trim().length < 32) {
    throw new Error('JWT_SECRET debe contener al menos 32 caracteres en producción.');
  }
  return secreto;
}
