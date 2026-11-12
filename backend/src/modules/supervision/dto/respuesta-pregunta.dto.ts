import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, IsObject } from 'class-validator';

export class RespuestaPreguntaDto {
  @IsString()
  @IsNotEmpty()
  preguntaId: string;

  @IsInt()
  @IsOptional()
  latenciaRespuestaMs?: number;

  @IsNumber()
  @IsOptional()
  deltaTensionFacial?: number;

  @IsObject()
  @IsOptional()
  detallesBiometricos?: Record<string, any>;

  @IsString()
  @IsOptional()
  notasEvaluador?: string;
}
