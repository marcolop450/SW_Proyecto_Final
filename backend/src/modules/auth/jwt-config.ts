import { ConfigService } from '@nestjs/config';

export function obtenerSecretoJwt(config: ConfigService): string {
  const secreto = config.get<string>('JWT_SECRET');
  if (!secreto?.trim()) {
    throw new Error('JWT_SECRET debe configurarse antes de iniciar la API.');
  }
  return secreto;
}
