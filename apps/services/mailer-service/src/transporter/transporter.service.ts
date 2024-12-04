import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import { createTransport, Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { MODULE_OPTIONS_TOKEN } from './transporter.module-definition';

@Injectable()
export class TransporterService implements OnModuleInit {
  private logger = new Logger(TransporterService.name);
  private readonly mailTransporter: Transporter;

  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: SMTPPool.Options) {
    this.mailTransporter = createTransport(this.options);
  }

  async onModuleInit() {
    await Promise.race([
      this.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout connecting to SMTP server')), 10000)
      ),
    ]);
  }

  async connect(): Promise<void> {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        try {
          await this.mailTransporter.verify();
          clearInterval(interval);
          resolve();
        } catch (error) {
          this.logger.error('Error connecting to SMTP server. Retrying later...', error);
        }
      }, 1000);
    });
  }

  async sendMail(options: Mail.Options): Promise<void> {
    return this.mailTransporter.sendMail(options);
  }
}