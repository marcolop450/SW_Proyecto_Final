import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { InvitarUsuarioDto } from './dto/invitar-usuario.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '@prisma/client';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @Roles(Rol.SUPER_ADMINISTRADOR, Rol.ADMIN_ORGANIZACION, Rol.SUPERVISOR, Rol.EVALUADOR)
  async listar(@CurrentUser() user: AuthenticatedUser) {
    return this.usuariosService.listarPorOrganizacion(user.organizationId);
  }

  @Post('invitar')
  @Roles(Rol.SUPER_ADMINISTRADOR, Rol.ADMIN_ORGANIZACION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async invitar(@CurrentUser() user: AuthenticatedUser, @Body() dto: InvitarUsuarioDto) {
    return this.usuariosService.invitarUsuario(user.organizationId, dto);
  }

  @Patch(':id/rol')
  @Roles(Rol.SUPER_ADMINISTRADOR, Rol.ADMIN_ORGANIZACION)
  async cambiarRol(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') usuarioId: string,
    @Body('rol') nuevoRol: Rol,
  ) {
    return this.usuariosService.cambiarRol(user.organizationId, usuarioId, nuevoRol);
  }
}
