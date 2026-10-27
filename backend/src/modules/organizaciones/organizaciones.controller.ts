import { Controller, Get, Post, Body } from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Rol } from '@prisma/client';

@Controller('organizaciones')
export class OrganizacionesController {
  constructor(private readonly organizacionesService: OrganizacionesService) {}

  @Get('mi-organizacion')
  async obtenerMiOrganizacion(@CurrentUser() user: AuthenticatedUser) {
    return this.organizacionesService.obtenerMiOrganizacion(user.organizationId);
  }

  @Get('todas')
  @Roles(Rol.SUPER_ADMINISTRADOR)
  async listarTodas() {
    return this.organizacionesService.listarTodas();
  }

  @Get('departamentos')
  async listarDepartamentos(@CurrentUser() user: AuthenticatedUser) {
    return this.organizacionesService.listarDepartamentos(user.organizationId);
  }

  @Post('departamentos')
  @Roles(Rol.SUPER_ADMINISTRADOR, Rol.ADMIN_ORGANIZACION)
  async crearDepartamento(
    @CurrentUser() user: AuthenticatedUser,
    @Body('nombre') nombre: string,
    @Body('descripcion') descripcion?: string,
  ) {
    return this.organizacionesService.crearDepartamento(user.organizationId, nombre, descripcion);
  }
}
