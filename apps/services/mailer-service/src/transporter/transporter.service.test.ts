import { Test, TestingModule } from '@nestjs/testing';
import { TransporterService } from './transporter.service';
import { MODULE_OPTIONS_TOKEN } from './transporter.module-definition';
import { createTransport } from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import { Logger } from '@nestjs/common';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    verify: jest.fn(),
    sendMail: jest.fn(),
  }),
}));

describe('TransporterService', () => {
  let service: TransporterService;
  let mockTransporter: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransporterService,
        {
          provide: MODULE_OPTIONS_TOKEN,
          useValue: {
            host: 'smtp.example.com',
            port: 587,
            secure: false,
            auth: {
              user: 'user@example.com',
              pass: 'password',
            },
          } as SMTPPool.Options,
        },
      ],
    }).compile();

    service = module.get<TransporterService>(TransporterService);
    mockTransporter = createTransport();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to the SMTP server', async () => {
      jest.spyOn(service, 'connect').mockResolvedValueOnce(undefined);
      await service.onModuleInit();
      expect(service.connect).toHaveBeenCalled();
    });

    it('should throw an error if connection times out', async () => {
      jest
        .spyOn(service, 'connect')
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 11000)));
      await expect(service.onModuleInit()).rejects.toThrow('Timeout connecting to SMTP server');
    }, 20000);
  });

  describe('connect', () => {
    it('should verify the connection to the SMTP server', async () => {
      mockTransporter.verify.mockResolvedValueOnce(undefined);
      await service.connect();
      expect(mockTransporter.verify).toHaveBeenCalled();
    });

    it('should retry if connection fails', async () => {
      const error = new Error('Connection failed');
      mockTransporter.verify.mockRejectedValueOnce(error).mockResolvedValueOnce(undefined);
      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');
      loggerErrorSpy.mockImplementation(() => {});

      await service.connect();
      expect(mockTransporter.verify).toHaveBeenCalledTimes(2);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error connecting to SMTP server. Retrying later...',
        error
      );
    });
  });

  describe('sendMail', () => {
    it('should send an email', async () => {
      const mailOptions = {
        from: 'sender@example.com',
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
      };
      await service.sendMail(mailOptions);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(mailOptions);
    });
  });
});
