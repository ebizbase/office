import { MongoModule } from '@ebizbase/nestjs-mongo';
import { RabbitModule } from '@ebizbase/nestjs-rabbit';
import { Module } from '@nestjs/common';
import { TemplateModule } from './template/template.module';
import { join } from 'path';
import { MailerModule } from './mailer/mailer.module';
import { HealthyModule } from './healthy/healthy.module';
import { NodeMailerModule } from '@ebizbase/nestjs-node-mailer';

@Module({
  imports: [
    MongoModule.register('transactional-mailer-service'),
    NodeMailerModule.register(),
    RabbitModule.register({
      exchanges: [
        {
          name: 'transactional_mail_exchange',
          type: 'direct',
          createExchangeIfNotExists: true,
          options: { durable: true },
        },
        {
          name: 'mail_exchange',
          type: 'direct',
          createExchangeIfNotExists: true,
          options: { durable: true },
        },
      ],
      channels: {
        default: {
          prefetchCount: 1,
          default: true,
        },
      },
    }),
    TemplateModule.registerAsync({
      useFactory: () => ({
        isGlobal: true,
        assetPath: join(__dirname, 'assets'),
      }),
    }),
    MailerModule,
    HealthyModule,
  ],
  controllers: [],
  providers: [],
})
export class MainModule {}
