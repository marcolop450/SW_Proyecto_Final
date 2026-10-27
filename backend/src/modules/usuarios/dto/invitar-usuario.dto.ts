import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { Rol } from '@prisma/client';

export class InvitarUsuarioDto {
  @IsEmail({}, { message: 'El correo debe ser válido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido: string;

  @IsEnum(Rol, { message: 'El rol debe ser válido en el sistema' })
  rol: Rol;

  @IsString()
  @IsOptional()
  departamentoId?: string;
}
