import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { RabbitMQConfig, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) =>
        cfg.get<RabbitMQConfig>('rabbitmq.configs', { infer: true }),
    }),
  ],
  providers: [MailerService],
})
export class MailerModule {}
