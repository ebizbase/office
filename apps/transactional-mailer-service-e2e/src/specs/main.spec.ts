import { ITransactionalMail } from '@ebizbase/mail-interfaces';
import {
  MailHogClient,
  MailHogTesting,
  RabbitMQClient,
  RabbitMQTesting,
} from '@ebizbase/testing-utils';
import axios from 'axios';
import { v1 as uuidv1 } from 'uuid';
import { execSync } from 'child_process';
import { join } from 'path';

describe('Transactional Mailer Service - Main features', () => {
  let rabbitmq: RabbitMQClient;
  let mailhog: MailHogClient;

  beforeEach(async () => {
    execSync('docker-compose up -d --wait', {
      cwd: join(__dirname, '../../../../'),
      stdio: 'ignore',
    });
    rabbitmq = await new RabbitMQTesting().getClient();
    mailhog = await MailHogTesting.getClient();
  }, 120_000);

  afterEach(async () => {
    await rabbitmq?.close();
  }, 20_000);

  describe('Mailer Service', () => {
    it('should liveness health check is successful', async () => {
      const { status } = await axios.get(
        'http://transactional-mailer-service.fbi.com/healthy/liveness'
      );
      expect(status).toBe(200);
    }, 20_000);

    it('should readiness health check is successful', async () => {
      const { status } = await axios.get(
        'http://transactional-mailer-service.fbi.com/healthy/readiness'
      );
      expect(status).toBe(200);
    }, 20_000);

    it('should send email from queue successfull when publish message to exchange', async () => {
      const otpEmail: ITransactionalMail = {
        event: 'account-otp',
        to: uuidv1() + '@example.com',
        data: {
          otp: uuidv1() + '-otp',
        },
      };
      rabbitmq.chanel.sendToQueue(
        'send_transactional_email_queue',
        Buffer.from(JSON.stringify(otpEmail))
      );
      const receivedMails = await mailhog.waitForEmail(otpEmail.to as string);
      expect(receivedMails).toHaveLength(1);
      expect(receivedMails[0].Content.Headers['Subject'][0]).toBe(
        '[nBiz] Your OTP for your account'
      );
      expect(receivedMails[0].Content.Body).toContain(otpEmail.data['otp']);
    }, 20_000);
  });
});
