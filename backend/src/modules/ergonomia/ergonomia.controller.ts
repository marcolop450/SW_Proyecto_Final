import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ErgonomiaService } from './ergonomia.service';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ConsentGuard } from '../../common/guards/consent.guard';
import { IniciarSesionDto } from './dto/iniciar-sesion.dto';
import { MuestraTelemetriaDto } from './dto/muestra-telemetria.dto';
import { FinalizarSesionDto } from './dto/finalizar-sesion.dto';

@Controller('ergonomia')
@UseGuards(ConsentGuard)
export class ErgonomiaController {
  constructor(private readonly ergonomiaService: ErgonomiaService) {}

  @Post('sesion/iniciar')
  async iniciarSesion(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: IniciarSesionDto,
  ) {
    return this.ergonomiaService.iniciarSesion(user.id, dto);
  }

  @Post('sesion/:id/muestra')
  async registrarMuestra(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: MuestraTelemetriaDto,
  ) {
    return this.ergonomiaService.registrarMuestra(id, user.id, dto);
  }

  @Post('sesion/:id/finalizar')
  async finalizarSesion(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: FinalizarSesionDto,
  ) {
    return this.ergonomiaService.finalizarSesion(id, user.id, dto);
  }

  @Get('sesion/activa')
  async obtenerSesionActiva(@CurrentUser() user: AuthenticatedUser) {
    return this.ergonomiaService.obtenerSesionActiva(user.id);
  }

  @Get('resumen')
  async obtenerResumen(@CurrentUser() user: AuthenticatedUser) {
    return this.ergonomiaService.obtenerResumen(user.id);
  }
}
