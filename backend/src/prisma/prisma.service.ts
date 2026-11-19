import { Injectable, OnApplicationShutdown, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
    } catch {
      const mensaje = 'No se pudo conectar con PostgreSQL. Verifica la configuración de DATABASE_URL y la disponibilidad de la base.';
      this.logger.error(mensaje);
      throw new Error(mensaje);
    }
    this.logger.log('Conexión establecida con PostgreSQL');
  }

  async onApplicationShutdown() {
    await this.$disconnect();
    this.logger.log('Conexión con PostgreSQL cerrada correctamente');
  }
}
