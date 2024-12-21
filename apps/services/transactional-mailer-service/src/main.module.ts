import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import mongodbConfig from './config/mongodb.config';
import rabbitmqConfig from './config/rabbitmq.config';
import { TemplateModule } from './template/template.module';
import { join } from 'path';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env['NODE_ENV'] !== 'production' ? 'trace' : 'info',
        // install 'pino-pretty' package in order to use the following option
        transport:
          process.env['NODE_ENV'] !== 'production' && process.env['NODE_ENV'] !== 'test'
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
      load: [mongodbConfig, rabbitmqConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) =>
        cfg.get<MongooseModuleOptions>('mongodb.configs', { infer: true }),
    }),
    TemplateModule.registerAsync({
      useFactory: () => ({
        isGlobal: true,
        assetPath: join(__dirname, 'assets'),
      }),
    }),
    MailerModule,
  ],
  controllers: [],
  providers: [],
})
export class MainModule {}
