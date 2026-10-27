import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    credentials: true,
  });

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

  app.getHttpAdapter().get('/', (req, res) => res.redirect('/api/docs'));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Servidor ErgoCheck AI ejecutándose en http://localhost:${port}/api`);
  logger.log(`Documentación interactiva disponible en http://localhost:${port}/api/docs`);
}

bootstrap();
