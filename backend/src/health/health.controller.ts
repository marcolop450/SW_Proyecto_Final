import { Controller, Get, Header, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { HealthService } from './health.service';

@ApiTags('Estado del Sistema')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get('live')
  @Header('Cache-Control', 'no-store')
  procesoActivo() {
    return { estado: 'activo' };
  }

  @Get('ready')
  @Header('Cache-Control', 'no-store')
  async comprobarDisponibilidad() {
    if (!(await this.health.comprobarDisponibilidad())) {
      throw new ServiceUnavailableException({
        errorCode: 'ERR_DATABASE_UNAVAILABLE',
        message: 'La base de datos no está disponible temporalmente.',
      });
    }

    return { estado: 'disponible' };
  }
}
