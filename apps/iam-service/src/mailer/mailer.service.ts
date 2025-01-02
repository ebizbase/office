import { ITransactionalMail } from '@ebizbase/mail-interfaces';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async sendOtp(email: string, otp: string) {
    const transactionalMail: ITransactionalMail = {
      event: 'account-otp',
      to: email,
      data: { otp },
    };
    await this.amqpConnection.publish(
      'transactional_mail_exchange',
      'send',
      Buffer.from(JSON.stringify(transactionalMail))
    );
  }
}
