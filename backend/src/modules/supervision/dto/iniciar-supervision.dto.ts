import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class IniciarSupervisionDto {
  @IsString()
  @IsNotEmpty()
  codigoAcceso: string;

  @IsString()
  @IsOptional()
  tipo?: string; // EXAMEN | ENTREVISTA | TELETRABAJO
}
