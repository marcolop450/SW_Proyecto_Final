import { Module } from '@nestjs/common';
import { SupervisionService } from './supervision.service';
import { SupervisionController } from './supervision.controller';
import { SupervisionSp4Controller } from './supervision-sp4.controller';
import { MotorCorrelacionService } from './services/motor-correlacion.service';
import { BitacoraInmutableService } from './services/bitacora-inmutable.service';
import { GeneradorReportesService } from './services/generador-reportes.service';
import { SupervisionGateway } from './gateways/supervision.gateway';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SupervisionController, SupervisionSp4Controller],
  providers: [
    SupervisionService,
    MotorCorrelacionService,
    BitacoraInmutableService,
    GeneradorReportesService,
    SupervisionGateway,
  ],
  exports: [
    SupervisionService,
    MotorCorrelacionService,
    BitacoraInmutableService,
    GeneradorReportesService,
    SupervisionGateway,
  ],
})
export class SupervisionModule {}
