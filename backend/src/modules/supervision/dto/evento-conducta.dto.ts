import { IsString, IsNotEmpty, IsOptional, IsInt, IsObject } from 'class-validator';

export class EventoConductaDto {
  @IsString()
  @IsNotEmpty()
  tipo: string; // GAZE_DOWN_SUSTAINED, GAZE_OFFSCREEN, FACE_ABSENT, MULTIPLE_FACES, WINDOW_BLUR, WINDOW_FOCUS, FULLSCREEN_EXIT, SHORTCUT_BLOCKED, INACTIVITY_IDLE

  @IsString()
  @IsOptional()
  severidad?: string; // LOW | MEDIUM | HIGH | CRITICAL

  @IsInt()
  @IsOptional()
  duracionMs?: number;

  @IsObject()
  @IsOptional()
  detalles?: Record<string, any>;
}
