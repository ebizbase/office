import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';
import { PinoLogger } from '@ebizbase/nestjs-pino-logger';

async function bootstrap() {
  const bind = process.env['BIND'] || '0.0.0.0';
  const port = process.env['PORT'] || 3005;
  const logger = new PinoLogger('TransactionalMailerService');
  const app = await NestFactory.create<NestFastifyApplication>(MainModule, new FastifyAdapter(), {
    logger,
  });
  await app.listen(port, bind);
  logger.log(`REST API PORT ${bind}:${port}`, 'Bootstrap');
  logger.log('Transactional mailer service is up and running', 'Bootstrap');
}

bootstrap();
