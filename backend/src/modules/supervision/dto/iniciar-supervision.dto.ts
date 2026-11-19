import { IsString, IsNotEmpty, IsOptional, IsIn, IsInt } from 'class-validator';

export class IniciarSupervisionDto {
  @IsString()
  @IsNotEmpty()
  codigoAcceso: string;

  @IsString()
  @IsOptional()
  tipo?: string; // EXAMEN | ENTREVISTA | TELETRABAJO

  @IsOptional()
  @IsInt()
  @IsIn([4, 6, 8])
  metaHoras?: number;
}
