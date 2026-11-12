import { IsNumber, IsOptional, IsInt, Min } from 'class-validator';

export class FinalizarSupervisionDto {
  @IsNumber()
  @IsOptional()
  scoreIntegridad?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  tiempoActivoSeg?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  tiempoOciosoSeg?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  tiempoFueraSeg?: number;
}
