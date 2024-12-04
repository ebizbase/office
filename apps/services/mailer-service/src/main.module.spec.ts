import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { LoggerModule } from 'nestjs-pino';
import { MainModule } from './main.module';
import { MailerModule } from './mailer/mailer.module';
import { TransporterModule } from './transporter/transporter.module';
import { MongoDBContainer } from '@testcontainers/mongodb';
import { RabbitMQContainer } from '@testcontainers/rabbitmq';
import { GenericContainer, Wait } from 'testcontainers';

describe('MainModule', () => {
  let moduleRef: TestingModule | undefined;

  beforeAll(async () => {
    const [mongodb, rabitmq, mailhog] = await Promise.all([
      new MongoDBContainer().start(),
      new RabbitMQContainer().start(),
      new GenericContainer('mailhog/mailhog')
        .withExposedPorts(8025, 1025)
        .withWaitStrategy(Wait.forListeningPorts())
        .start(),
    ]);

    process.env['MONGODB_URI'] = `${mongodb.getConnectionString()}?directConnection=true`;
    process.env['RABBITMQ_URIS'] = rabitmq.getAmqpUrl();
    process.env['SMTP_URI'] = 'smtp://' + mailhog.getHost() + ':' + mailhog.getMappedPort(1025);

    moduleRef = await Test.createTestingModule({
      imports: [MainModule],
    }).compile();
  }, 30000);

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  describe('LoggerModule', () => {
    it('should configure LoggerModule with pinoHttp options', () => {
      const loggerModule = moduleRef.get(LoggerModule, { strict: false });
      expect(loggerModule).toBeDefined();
    });
  });

  describe('ConfigModule', () => {
    it('should load configuration modules', () => {
      const configService = moduleRef.get<ConfigService>(ConfigService);
      expect(configService).toBeDefined();

      const mongodbConfigs = configService.get<MongooseModuleOptions>('mongodb.configs', {
        infer: true,
      });
      const rabbitmqConfigs = configService.get<RabbitMQModule>('rabbitmq.configs', {
        infer: true,
      });

      expect(mongodbConfigs).toBeDefined();
      expect(rabbitmqConfigs).toBeDefined();
    });
  });

  describe('MongooseModule', () => {
    it('should configure MongooseModule asynchronously', () => {
      const mongooseModule = moduleRef.get(MongooseModule, { strict: false });
      expect(mongooseModule).toBeDefined();
    });
  });

  describe('RabbitMQModule', () => {
    it('should configure RabbitMQModule asynchronously', () => {
      const rabbitMQModule = moduleRef.get(RabbitMQModule, { strict: false });
      expect(rabbitMQModule).toBeDefined();
    });
  });

  describe('TransporterModule', () => {
    it('should load TransporterModule', () => {
      const transporterModule = moduleRef.get(TransporterModule, { strict: false });
      expect(transporterModule).toBeDefined();
    });
  });

  describe('MailerModule', () => {
    it('should load MailerModule', () => {
      const mailerModule = moduleRef.get(MailerModule, { strict: false });
      expect(mailerModule).toBeDefined();
    });
  });
});
