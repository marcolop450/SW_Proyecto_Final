import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizacionesModule } from './modules/organizaciones/organizaciones.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { ConsentimientoModule } from './modules/consentimiento/consentimiento.module';
import { SuscripcionesModule } from './modules/suscripciones/suscripciones.module';
import { ErgonomiaModule } from './modules/ergonomia/ergonomia.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    OrganizacionesModule,
    UsuariosModule,
    ConsentimientoModule,
    SuscripcionesModule,
    ErgonomiaModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
