import { NodeMailerModule } from '@ebizbase/nestjs-node-mailer';
import { RabbitModule } from '@ebizbase/nestjs-rabbit';
import { MongoModule } from '@ebizbase/nestjs-mongo';
import { Module } from '@nestjs/common';
import { HealthyController } from './controllers/healthy.controller';
import { HealthyService } from './services/healthy.service';
import { AuthenticateService } from './services/authenticate.service';
import { AuthenticateController } from './controllers/authenticate.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Session } from 'inspector/promises';
import { SessionSchema } from './schemas/session.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongoModule.register('iam-service'),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
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
  ],
  controllers: [HealthyController, AuthenticateController],
  providers: [HealthyService, AuthenticateService],
})
export class MainModule {}
