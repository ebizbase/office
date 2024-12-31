import { ITransactionalMail } from '@ebizbase/mail-interfaces';
import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async sendTransactionalMail(transactionMail: ITransactionalMail): Promise<void> {
    this.logger.debug({ msg: 'Sending transactional email', mail: transactionMail });
    await this.amqpConnection.publish(
      'transactional_mailer_exchange',
      'send_transactional_email',
      transactionMail
    );
  }
}
