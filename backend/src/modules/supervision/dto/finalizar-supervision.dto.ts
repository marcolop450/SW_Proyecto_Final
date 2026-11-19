import { IsNumber, IsOptional, IsInt, Min, IsString, MaxLength } from 'class-validator';

export class FinalizarSupervisionDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notaJornada?: string;
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
