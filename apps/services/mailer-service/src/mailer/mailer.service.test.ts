import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from './mailer.service';
import { TransporterService } from './../transporter/transporter.service';
import { Logger } from '@nestjs/common';
import { IMail } from '@ebizbase/mailer-common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

jest.mock('@golevelup/nestjs-rabbitmq', () => ({
  RabbitSubscribe: jest.fn(() => () => {}),
}));

describe('MailerService', () => {
  let service: MailerService;
  let transporterService: TransporterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: TransporterService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<MailerService>(MailerService);
    transporterService = module.get<TransporterService>(TransporterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should subcribe to the correct exchange, routingKey and queue', () => {
    expect(RabbitSubscribe).toHaveBeenCalledWith({
      exchange: 'mailer_exchange',
      routingKey: 'send_email',
      queue: 'send_email_queue',
    });
  });

  it('should call transporter.sendMail with correct parameters', async () => {
    const mail: IMail = {
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Subject',
      text: 'Test Text',
      html: '<p>Test HTML</p>',
    };

    await service.sendMail(mail);

    expect(transporterService.sendMail).toHaveBeenCalledWith({
      from: mail.from,
      to: mail.to,
      cc: mail.cc,
      bcc: mail.bcc,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
  });

  it('should log an error if transporter.sendMail throws an error', async () => {
    const mail: IMail = {
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Subject',
      text: 'Test Text',
      html: '<p>Test HTML</p>',
    };

    const error = new Error('Test Error');
    jest.spyOn(transporterService, 'sendMail').mockRejectedValueOnce(error);
    const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');
    loggerErrorSpy.mockImplementation(() => {});

    await service.sendMail(mail);

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      `Error on sending email. ${error.message}`,
      error.stack
    );
  });
});
