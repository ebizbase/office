import { Test, TestingModule } from '@nestjs/testing';
import { MailerModule } from './mailer.module';
import { MailerService } from './mailer.service';
import { TransporterModule } from '../transporter/transporter.module';

describe('MailerModule', () => {
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MailerModule,
        TransporterModule.register({
          isGlobal: true,
          pool: true,
          host: 'smtp.example.com',
          port: 587,
          secure: false,
          auth: {
            user: 'user@example.com',
            pass: 'password',
          },
        }),
      ],
    }).compile();

    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(mailerService).toBeDefined();
  });
});
