import { IMail } from '@ebizbase/mail-interfaces';
import { NodeMailerService } from '@ebizbase/nestjs-node-mailer';
import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private nodemailer: NodeMailerService) {}

  @RabbitSubscribe({
    exchange: 'mailer_exchange',
    routingKey: 'send_email',
    queue: 'send_email_queue',
    queueOptions: {
      maxPriority: 100,
      channel: 'mailer_channel',
    },
  })
  async sendMail(mail: IMail): Promise<void> {
    this.logger.debug({ msg: 'Sending email', mail: { ...mail, html: '...' } });
    try {
      await this.nodemailer.sendMail({
        from: mail.from,
        to: mail.to,
        cc: mail.cc,
        bcc: mail.bcc,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });
    } catch (error) {
      this.logger.error(`Error on sending email. ${error.message}`, error.stack);
    }
  }
}
