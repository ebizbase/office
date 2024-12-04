import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(MainModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.flushLogs();
  await app.init();
  logger.log('Mailer service is up and running', 'Bootstrap');
}

bootstrap();
