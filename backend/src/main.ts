import { LoggerService } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './app.config.provider';
import { LOGGER } from './logger/logger.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.setGlobalPrefix('api/afisha');
  app.enableCors();
  app.useLogger(app.get<LoggerService>(LOGGER));

  const config = app.get<AppConfig>('CONFIG');
  await app.listen(config.port);
}
bootstrap();
