import { Rol } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CambiarRolDto {
  @IsEnum(Rol, { message: 'El rol debe ser válido en el sistema' })
  rol: Rol;
}
