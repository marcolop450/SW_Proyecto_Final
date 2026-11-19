import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SupervisionService } from './supervision.service';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '@prisma/client';
import { ConsentGuard } from '../../common/guards/consent.guard';
import { CrearCuestionarioDto } from './dto/crear-cuestionario.dto';
import { IniciarSupervisionDto } from './dto/iniciar-supervision.dto';
import { EventoConductaDto } from './dto/evento-conducta.dto';
import { DispararPreguntaDto } from './dto/disparar-pregunta.dto';
import { RespuestaPreguntaDto } from './dto/respuesta-pregunta.dto';
import { FinalizarSupervisionDto } from './dto/finalizar-supervision.dto';

@Controller('supervision')
@UseGuards(ConsentGuard)
export class SupervisionController {
  constructor(private readonly supervisionService: SupervisionService) {}

  @Post('cuestionarios')
  @Roles(Rol.SUPERVISOR, Rol.EVALUADOR, Rol.ADMIN_ORGANIZACION, Rol.SUPER_ADMINISTRADOR)
  async crearCuestionario(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CrearCuestionarioDto,
  ) {
    return this.supervisionService.crearCuestionario(user.organizationId, user.id, dto);
  }

  @Get('cuestionarios')
  @Roles(Rol.SUPERVISOR, Rol.EVALUADOR, Rol.ADMIN_ORGANIZACION, Rol.SUPER_ADMINISTRADOR)
  async listarCuestionarios(@CurrentUser() user: AuthenticatedUser) {
    return this.supervisionService.listarCuestionarios(user.organizationId);
  }

  @Get('cuestionarios/codigo/:codigo')
  async validarCodigo(@Param('codigo') codigo: string, @CurrentUser() user: AuthenticatedUser) {
    return this.supervisionService.validarCodigo(codigo, user.organizationId);
  }

  @Post('sesion/iniciar')
  async iniciarSesion(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: IniciarSupervisionDto,
  ) {
    return this.supervisionService.iniciarSesion(user.id, user.organizationId, dto);
  }

  @Post('sesion/:id/evento')
  async registrarEvento(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: EventoConductaDto,
  ) {
    return this.supervisionService.registrarEvento(id, user.id, dto);
  }

  @Post('sesion/:id/disparar-pregunta')
  @Roles(Rol.SUPERVISOR, Rol.EVALUADOR, Rol.ADMIN_ORGANIZACION, Rol.SUPER_ADMINISTRADOR)
  async dispararPregunta(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: DispararPreguntaDto,
  ) {
    return this.supervisionService.dispararPregunta(id, user.id, dto);
  }

  @Post('sesion/:id/respuesta-pregunta')
  async registrarRespuestaPregunta(
    @Param('id') id: string,
    @Body() dto: RespuestaPreguntaDto,
  ) {
    return this.supervisionService.registrarRespuestaPregunta(id, dto);
  }

  @Post('sesion/:id/finalizar')
  async finalizarSesion(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: FinalizarSupervisionDto,
  ) {
    return this.supervisionService.finalizarSesion(id, user.id, dto);
  }

  @Get('sesiones/teletrabajo')
  async listarSesionesTeletrabajo(@CurrentUser() user: AuthenticatedUser) {
    return this.supervisionService.listarSesionesTeletrabajo(user.id, user.organizationId);
  }

  @Get('sesion/:id')
  async obtenerSesion(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.supervisionService.obtenerSesion(id, user.id);
  }
}
