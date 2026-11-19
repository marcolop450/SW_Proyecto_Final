import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PLAZO_CONSULTA_MS = 2500;

@Injectable()
export class HealthService {
  private comprobacionEnCurso?: Promise<boolean>;

  constructor(private readonly prisma: PrismaService) {}

  comprobarDisponibilidad(): Promise<boolean> {
    this.comprobacionEnCurso ??= new Promise<boolean>((resolver) => {
      const plazo = setTimeout(() => resolver(false), PLAZO_CONSULTA_MS);

      // Si vence el plazo HTTP, se comparte el resultado hasta que Prisma termine la consulta.
      this.prisma.$queryRaw`SELECT 1`
        .then(() => resolver(true), () => resolver(false))
        .finally(() => {
          clearTimeout(plazo);
          this.comprobacionEnCurso = undefined;
        });
    });

    return this.comprobacionEnCurso;
  }
}
