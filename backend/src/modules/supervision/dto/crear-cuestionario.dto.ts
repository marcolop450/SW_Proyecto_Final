import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsUrl } from 'class-validator';

export class CrearCuestionarioDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  tipo?: string; // EXAMEN | ENTREVISTA | EVALUACION_LABORAL

  @IsUrl()
  @IsNotEmpty()
  urlExterna: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  duracionMinutos?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  vigenciaHoras?: number;
}
