import { Test, TestingModule } from '@nestjs/testing';
import { TransporterModule } from './transporter.module';
import { TransporterService } from './transporter.service';

describe('TransporterModule', () => {
  let transporterService: TransporterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TransporterModule.register({
          pool: true,
          host: 'smtp.example.com',
          port: 587,
          secure: false,
        }),
      ],
    }).compile();

    transporterService = module.get<TransporterService>(TransporterService);
  });

  it('should be defined', () => {
    expect(transporterService).toBeDefined();
  });

  it('should export TransporterService', () => {
    expect(transporterService).toBeInstanceOf(TransporterService);
  });
});
