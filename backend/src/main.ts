import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, ShutdownSignal } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configurarComunicaciones } from './common/http/configurar-comunicaciones';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableShutdownHooks([ShutdownSignal.SIGTERM, ShutdownSignal.SIGINT]);

  app.setGlobalPrefix('api');
  configurarComunicaciones(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('ErgoCheck AI — API Oficial')
    .setDescription('Servicio de telemetría postural asistida por IA y supervisión de evaluaciones')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const http = app.getHttpAdapter();
  http.get('/', (_req, res) => http.redirect(res, 302, '/api/docs'));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Servidor ErgoCheck AI ejecutándose en http://localhost:${port}/api`);
  logger.log(`Documentación interactiva disponible en http://localhost:${port}/api/docs`);
}

bootstrap().catch(() => {
  Logger.error('La API no pudo iniciar.', 'Bootstrap');
  process.exit(1);
});
