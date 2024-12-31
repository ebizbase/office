import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { PinoLoggerService } from '@ebizbase/nestjs-pino-logger';
import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';

async function bootstrap() {
  const bind = process.env['BIND'] || '0.0.0.0';
  const port = process.env['PORT'] || 3005;
  const logger = new PinoLoggerService('IAMService');
  const app = await NestFactory.create<NestFastifyApplication>(MainModule, new FastifyAdapter(), {
    logger,
  });
  await app.listen(port, bind);
  logger.log(`REST API PORT ${bind}:${port}`, 'Bootstrap');
  logger.log('IAM service is up and running', 'Bootstrap');
}

bootstrap();
