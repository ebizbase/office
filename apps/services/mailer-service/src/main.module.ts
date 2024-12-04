import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { RabbitMQConfig, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { LoggerModule } from 'nestjs-pino';
import { MailerModule } from './mailer/mailer.module';
import mongodbConfig from './config/mongodb.config';
import rabbitmqConfig from './config/rabbitmq.config';
import smtpConfig from './config/smtp.config';
import { TransporterModule } from './transporter/transporter.module';
import SMTPPool from 'nodemailer/lib/smtp-pool';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env['NODE_ENV'] !== 'production' ? 'debug' : 'info',
        // install 'pino-pretty' package in order to use the following option
        transport:
          process.env['NODE_ENV'] !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  ignore: 'hostname,context',
                  messageFormat: '[{context}] {msg}',
                },
              }
            : undefined,
        // and all the other fields of:
        // - https://github.com/pinojs/pino-http#api
        // - https://github.com/pinojs/pino/blob/HEAD/docs/api.md#options-object
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [mongodbConfig, rabbitmqConfig, smtpConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) =>
        cfg.get<MongooseModuleOptions>('mongodb.configs', { infer: true }),
    }),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) =>
        cfg.get<RabbitMQConfig>('rabbitmq.configs', { infer: true }),
    }),
    TransporterModule.registerAsync({
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (cfg: ConfigService) =>
        cfg.get<SMTPPool.Options>('smtp.configs', { infer: true }),
    }),
    MailerModule,
  ],
  controllers: [],
  providers: [],
})
export class MainModule {}
