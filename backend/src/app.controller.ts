import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Estado del Sistema')
@Controller()
export class AppController {
  @Public()
  @Get()
  obtenerEstado() {
    return {
      estado: 'operativo',
      servicio: 'ErgoCheck AI — API Oficial',
      descripcion: 'Plataforma de telemetría postural asistida por IA y supervisión de evaluaciones',
      version: '1.0.0',
      documentacion: '/api/docs',
      timestamp: new Date().toISOString(),
    };
  }
}
