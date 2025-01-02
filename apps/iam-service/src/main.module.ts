import { NodeMailerModule } from '@ebizbase/nestjs-node-mailer';
import { RabbitModule } from '@ebizbase/nestjs-rabbit';
import { MongoModule } from '@ebizbase/nestjs-mongo';
import { Module } from '@nestjs/common';
import { HealthyModule } from './healthy/healthy.module';
import { UserModule } from './user/user.module';
import { AuthenticateModule } from './authenticate/authenticate.module';
import { UserSessionModule } from './user-session/user-session.module';
import { TenantModule } from './tenant/tenant.module';
import { AccessTokenModule } from './access-token/access-token.module';
import { MeModule } from './me/me.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
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
    AccessTokenModule,
    AuthenticateModule,
    MeModule,
    MailerModule,
    UserModule,
    TenantModule,
    UserSessionModule,
  ],
})
export class MainModule {}
