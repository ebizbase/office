import { compile } from 'handlebars';
import { IMail } from '@ebizbase/mailer-common';
import { ITransactionalMail } from '@ebizbase/mailer-common';
import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { TemplateService } from '../template/template.service';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly templateService: TemplateService
  ) {}

  @RabbitSubscribe({
    exchange: 'transactional_mailer_exchange',
    routingKey: 'send_transactional_email',
    queue: 'send_transactional_email_queue',
  })
  async sendMail(transactionalMail: ITransactionalMail): Promise<void> {
    this.logger.debug({ msg: 'Sending transactional email', mail: transactionalMail });
    const { event, to, data } = transactionalMail;
    try {
      const template = await this.templateService.getTemplate(event);
      if (!template) {
        throw new Error(`Template not found for event: ${event}`);
      }
      const htmlTemplate = compile(template.html);
      const textTemplate = compile(template.text);
      const subjectTemplate = compile(template.subject);

      const html = htmlTemplate(data);
      const text = textTemplate(data);
      const subject = subjectTemplate(data);
      const from = process.env['TRANSACTIONAL_EMAIL_SENDER'] || 'no-reply@example.com';

      const mail: IMail = { from, to, html, text, subject };
      await this.amqpConnection.publish('mailer_exchange', 'send_email', mail);
    } catch (error) {
      this.logger.error(`Error on sending transactional  email. ${error.message}`, error.stack);
    }
  }
}
