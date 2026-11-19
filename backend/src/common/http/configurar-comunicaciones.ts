import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { crearPoliticaDeOrigenes, PermitirOrigen } from './origenes-web';

class AdaptadorComunicaciones extends IoAdapter {
  constructor(app: NestExpressApplication, private readonly permitir: PermitirOrigen) {
    super(app);
  }

  createIOServer(port: number | undefined, options?: Partial<ServerOptions>): Server {
    return super.createIOServer(port, {
      ...options,
      cors: {
        origin: (origen, responder) => responder(null, this.permitir(origen)),
        credentials: true,
      },
      allowRequest: (req, responder) => {
        const permitido = this.permitir(req.headers.origin);
        responder(permitido ? null : 'Origen web no permitido.', permitido);
      },
    } satisfies Partial<ServerOptions>);
  }
}

export function configurarComunicaciones(app: NestExpressApplication): void {
  const config = app.get(ConfigService);
  const permitir = crearPoliticaDeOrigenes(config);
  if (config.get<string>('TRUST_CADDY_PROXY') === 'true') {
    app.set('trust proxy', 1);
  }

  app.enableCors({
    origin: (origen, responder) => {
      if (permitir(origen)) {
        responder(null, true);
        return;
      }
      responder(new ForbiddenException({
        errorCode: 'ERR_ORIGIN_NOT_ALLOWED',
        message: 'Origen web no permitido.',
      }));
    },
    credentials: true,
  });
  app.useWebSocketAdapter(new AdaptadorComunicaciones(app, permitir));
}
