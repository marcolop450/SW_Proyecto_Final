import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class FinalizarSesionDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  promedioRula?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAlertas?: number;
}
