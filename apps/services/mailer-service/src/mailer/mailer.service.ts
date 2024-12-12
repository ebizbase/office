import { IMail } from '@ebizbase/mailer-common';
import { TransporterService } from './../transporter/transporter.service';
import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private transporter: TransporterService) {}

  @RabbitSubscribe({
    exchange: 'mailer_exchange',
    routingKey: 'send_email',
    queue: 'send_email_queue',
  })
  async sendMail(mail: IMail & { id?: string }): Promise<void> {
    this.logger.debug({ msg: 'Sending email', mail });
    try {
      await this.transporter.sendMail({
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
