import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const bind = process.env['BIND'] || '0.0.0.0';
  const port = process.env['PORT'] || 3005;

  const app = await NestFactory.create<NestFastifyApplication>(MainModule, new FastifyAdapter(), {
    bufferLogs: true,
  });
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.flushLogs();

  await app.listen(port, bind);
  logger.log('Transactional mailer service is up and running', 'Bootstrap');
  logger.log(`REST API PORT ${bind}:${port}`, 'Bootstrap');
}

bootstrap();
