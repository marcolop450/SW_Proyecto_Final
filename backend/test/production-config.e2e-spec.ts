import { ConfigService } from '@nestjs/config';
import { obtenerSecretoJwt } from '../src/modules/auth/jwt-config';

describe('Configuración de JWT para producción', () => {
  it.each(['', '   ', 'x'.repeat(31)])('rechaza un secreto insuficiente en producción', secret => {
    const config = new ConfigService({ NODE_ENV: 'production', JWT_SECRET: secret });
    expect(() => obtenerSecretoJwt(config)).toThrow();
  });

  it('acepta un secreto de 32 caracteres en producción', () => {
    const secret = 'x'.repeat(32);
    const config = new ConfigService({ NODE_ENV: 'production', JWT_SECRET: secret });
    expect(obtenerSecretoJwt(config)).toBe(secret);
  });

  it('conserva las configuraciones de desarrollo existentes', () => {
    const config = new ConfigService({ NODE_ENV: 'development', JWT_SECRET: 'secreto-local' });
    expect(obtenerSecretoJwt(config)).toBe('secreto-local');
  });
});
