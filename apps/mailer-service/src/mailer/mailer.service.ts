import { compile } from 'handlebars';
import { IMailAddress, ITransactionalMail } from '@ebizbase/mail-interfaces';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { TemplateService } from '../template/template.service';
import { NodeMailerService } from '@ebizbase/nestjs-node-mailer';

export interface IMail {
  from: string | IMailAddress;
  to: string | IMailAddress;
  cc?: Array<string | IMailAddress>;
  bcc?: Array<string | IMailAddress>;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class MailerService implements OnModuleInit {
  private transactionEmailSender: string;
  private readonly logger = new Logger(MailerService.name);

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly nodemailer: NodeMailerService,
    private readonly templateService: TemplateService
  ) {}

  onModuleInit() {
    this.transactionEmailSender = process.env['TRANSACTIONAL_EMAIL_SENDER'];
    if (!this.transactionEmailSender) {
      throw new Error('Missing TRANSACTIONAL_EMAIL_SENDER environment variable!');
    }
  }

  @RabbitSubscribe({
    exchange: 'transactional_mail_exchange',
    routingKey: 'send',
    queue: 'transactional_mails',
    queueOptions: {
      durable: true,
    },
  })
  async sendTransactionMail(transactionalMail: ITransactionalMail): Promise<void> {
    this.logger.debug({ msg: 'Sending transactional email', mail: transactionalMail });

    const { event, to, data } = transactionalMail;

    const template = await this.templateService.getTemplate(event);
    if (!template) {
      throw new Error(`Template not found for event: ${event}`);
    }

    let html;
    try {
      const htmlTemplate = compile(template.html);
      html = htmlTemplate(data);
    } catch (error) {
      this.logger.error(`Error on compiling html template. ${error.message}`, error.stack);
      throw error;
    }

    let text;
    try {
      const textTemplate = compile(template.text);
      text = textTemplate(data);
    } catch (error) {
      this.logger.error(`Error on compiling text template. ${error.message}`, error.stack);
      throw error;
    }

    let subject;
    try {
      const subjectTemplate = compile(template.subject);
      subject = subjectTemplate(data);
    } catch (error) {
      this.logger.error(`Error on compiling subject template. ${error.message}`, error.stack);
      throw error;
    }

    try {
      const mail: IMail = { from: this.transactionEmailSender, to, html, text, subject };
      await this.amqpConnection.publish('mail_exchange', 'send', mail);
    } catch (error) {
      this.logger.error(`Error on sending transaction email. ${error.message}`, error.stack);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: 'mail_exchange',
    routingKey: 'send',
    queue: 'mails',
    queueOptions: {
      durable: true,
      maxPriority: 10,
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
