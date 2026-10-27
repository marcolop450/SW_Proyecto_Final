import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  SuscripcionesService,
  CotizacionDto,
  ProcesarPagoDto,
} from './suscripciones.service';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Rol } from '@prisma/client';

@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly suscripcionesService: SuscripcionesService) {}

  @Public()
  @Get('planes')
  listarPlanes() {
    return this.suscripcionesService.listarPlanes();
  }

  @Public()
  @Post('cotizar')
  cotizar(@Body() dto: CotizacionDto) {
    return this.suscripcionesService.cotizar(dto);
  }

  @Get('actual')
  async obtenerActual(@CurrentUser() user: AuthenticatedUser) {
    return this.suscripcionesService.obtenerSuscripcionActual(user.organizationId);
  }

  @Post('pagar')
  @Roles(Rol.SUPER_ADMINISTRADOR, Rol.ADMIN_ORGANIZACION)
  async pagar(@CurrentUser() user: AuthenticatedUser, @Body() dto: ProcesarPagoDto) {
    return this.suscripcionesService.procesarPagoSandbox(user.organizationId, dto);
  }

  @Get('facturas')
  @Roles(Rol.SUPER_ADMINISTRADOR, Rol.ADMIN_ORGANIZACION)
  async listarFacturas(@CurrentUser() user: AuthenticatedUser) {
    return this.suscripcionesService.listarFacturas(user.organizationId);
  }
}
