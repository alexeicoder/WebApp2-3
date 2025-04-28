import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:4000', // Хост-приложение
      'http://localhost:4001', // Микрофронтенд 1
      'http://localhost:4002', // Микрофронтенд 2
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });
  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Visits Service API')
    .setDescription('API для управления посещениями спортзала')
    .setVersion('1.0')
    .addBearerAuth() // Добавляем поддержку JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();