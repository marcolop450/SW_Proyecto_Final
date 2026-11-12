import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class DispararPreguntaDto {
  @IsString()
  @IsNotEmpty()
  pregunta: string;

  @IsString()
  @IsOptional()
  categoria?: string; // INTEGRIDAD | TECNICA | PSICOMETRICA

  @IsInt()
  @Min(3)
  @IsOptional()
  tiempoEsperaSeg?: number;
}
