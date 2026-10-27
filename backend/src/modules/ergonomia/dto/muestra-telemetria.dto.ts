import { IsNumber, IsBoolean, IsOptional, IsString, Min, Max } from 'class-validator';

export class MuestraTelemetriaDto {
  @IsNumber()
  @Min(1)
  @Max(7)
  rulaScore: number;

  @IsNumber()
  neckAngle: number;

  @IsNumber()
  trunkAngle: number;

  @IsBoolean()
  staticLoad: boolean;

  @IsOptional()
  @IsString()
  riskLevel?: string;

  @IsOptional()
  @IsString()
  timestamp?: string;
}
