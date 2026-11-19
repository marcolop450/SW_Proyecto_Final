import { AsyncLocalStorage } from 'node:async_hooks';
import {
  CallHandler, ExecutionContext, Global, Injectable, Module, NestInterceptor,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Observable } from 'rxjs';
import type { AuthenticatedUser } from '../decorators/current-user.decorator';

@Injectable()
export class ContextoAuditoria {
  private readonly sesiones = new AsyncLocalStorage<AuthenticatedUser | undefined>();

  ejecutar<T>(usuario: AuthenticatedUser | undefined, ejecutar: () => T): T {
    return this.sesiones.run(usuario, ejecutar);
  }

  usuario(): AuthenticatedUser | undefined {
    return this.sesiones.getStore();
  }
}

@Injectable()
class ContextoAuditoriaInterceptor implements NestInterceptor {
  constructor(private readonly auditoria: ContextoAuditoria) {}

  intercept(context: ExecutionContext, siguiente: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return siguiente.handle();

    const { user } = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    return new Observable(suscriptor =>
      this.auditoria.ejecutar(user, () => siguiente.handle().subscribe(suscriptor)),
    );
  }
}

@Global()
@Module({
  providers: [
    ContextoAuditoria,
    { provide: APP_INTERCEPTOR, useClass: ContextoAuditoriaInterceptor },
  ],
  exports: [ContextoAuditoria],
})
export class ContextoAuditoriaModule {}
