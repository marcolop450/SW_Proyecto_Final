import { IsOptional, IsNumber } from 'class-validator';

export class IniciarSesionDto {
  @IsOptional()
  @IsNumber()
  anguloCuelloBase?: number;

  @IsOptional()
  @IsNumber()
  anguloTroncoBase?: number;

  @IsOptional()
  @IsNumber()
  luminanciaPromedio?: number;
}
