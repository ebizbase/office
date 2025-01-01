import { NodeMailerModule } from '@ebizbase/nestjs-node-mailer';
import { RabbitModule } from '@ebizbase/nestjs-rabbit';
import { MongoModule } from '@ebizbase/nestjs-mongo';
import { Module } from '@nestjs/common';
import { HealthyModule } from './healthy/healthy.module';
import { UserModule } from './user/user.module';
import { AuthenticateModule } from './authenticate/authenticate.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: () => {
        const secret = process.env['TOKEN_SECRET'];
        if (!secret) {
          throw new Error('Missing TOKEN_SECRET environment variable');
        }
        return {
          secret: process.env['TOKEN_SECRET'],
        };
      },
    }),
    MongoModule.register('iam-service'),
    NodeMailerModule.register(),
    RabbitModule.register({
      exchanges: [
        {
          name: 'transactional_mail_exchange',
          type: 'direct',
          createExchangeIfNotExists: true,
          options: { durable: true },
        },
      ],
    }),
    HealthyModule,
    UserModule,
    AuthenticateModule,
  ],
})
export class MainModule {}
