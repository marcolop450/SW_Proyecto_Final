import { Controller, Get, Post, Body, Req, Ip } from '@nestjs/common';
import { ConsentimientoService, FirmarConsentimientoDto } from './consentimiento.service';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Request } from 'express';

@Controller('consentimiento')
export class ConsentimientoController {
  constructor(private readonly consentimientoService: ConsentimientoService) {}

  @Get('estado')
  async obtenerEstado(@CurrentUser() user: AuthenticatedUser) {
    return this.consentimientoService.obtenerEstado(user.id);
  }

  @Post('firmar')
  async firmar(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: FirmarConsentimientoDto,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'] as string;
    return this.consentimientoService.firmarConsentimiento(user.id, dto, ip, userAgent);
  }

  @Post('revocar')
  async revocar(@CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.consentimientoService.revocarConsentimiento(user.id, ip);
  }
}
