import { NodeMailerModule } from '@ebizbase/nestjs-node-mailer';
import { RabbitModule } from '@ebizbase/nestjs-rabbit';
import { MongoModule } from '@ebizbase/nestjs-mongo';
import { Module } from '@nestjs/common';
import { MailerModule } from './mailer/mailer.module';
import { HealthyModule } from './healthy/healthy.module';

@Module({
  imports: [
    MongoModule.register('mailer-service'),
    NodeMailerModule.register(),
    RabbitModule.register({
      exchanges: [
        {
          name: 'mailer_exchange',
          type: 'direct',
          createExchangeIfNotExists: true,
          options: { durable: true },
        },
      ],
      channels: {
        mailer_channel: {
          prefetchCount: 1,
          default: true,
        },
      },
    }),
    MailerModule,
    HealthyModule,
  ],
})
export class MainModule {}
