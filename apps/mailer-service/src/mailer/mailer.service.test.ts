import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from './mailer.service';
import { NodeMailerService } from '@ebizbase/nestjs-node-mailer';
import { Logger } from '@nestjs/common';
import { IMail } from '@ebizbase/mail-interfaces';

describe('MailerService', () => {
  let service: MailerService;
  let nodemailerService: NodeMailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: NodeMailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
    nodemailerService = module.get<NodeMailerService>(NodeMailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log and send email successfully', async () => {
    const mail: IMail = {
      from: 'test@example.com',
      to: 'recipient@example.com',
      cc: ['cc@example.com'],
      bcc: ['bcc@example.com'],
      subject: 'Test Subject',
      text: 'Test Text',
      html: '<p>Test HTML</p>',
    };

    const loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    const sendMailSpy = jest.spyOn(nodemailerService, 'sendMail').mockResolvedValueOnce(undefined);

    await service.sendMail(mail);

    expect(loggerDebugSpy).toHaveBeenCalledWith({
      msg: 'Sending email',
      mail: { ...mail, html: '...' },
    });
    expect(sendMailSpy).toHaveBeenCalledWith({
      from: mail.from,
      to: mail.to,
      cc: mail.cc,
      bcc: mail.bcc,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    expect(loggerErrorSpy).not.toHaveBeenCalled();
  });

  it('should log error if sending email fails', async () => {
    const mail: IMail = {
      from: 'test@example.com',
      to: 'recipient@example.com',
      cc: ['cc@example.com'],
      bcc: ['bcc@example.com'],
      subject: 'Test Subject',
      text: 'Test Text',
      html: '<p>Test HTML</p>',
    };

    const loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    const sendMailSpy = jest
      .spyOn(nodemailerService, 'sendMail')
      .mockRejectedValueOnce(new Error('Test Error'));

    await service.sendMail(mail);

    expect(loggerDebugSpy).toHaveBeenCalledWith({
      msg: 'Sending email',
      mail: { ...mail, html: '...' },
    });
    expect(sendMailSpy).toHaveBeenCalledWith({
      from: mail.from,
      to: mail.to,
      cc: mail.cc,
      bcc: mail.bcc,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Error on sending email. Test Error',
      expect.any(String)
    );
  });
});
