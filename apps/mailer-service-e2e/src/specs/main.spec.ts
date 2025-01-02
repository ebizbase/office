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

  const BASE_URL = 'http://mailer-service.fbi.com';
  const TIMEOUTS = {
    SETUP: 120_000,
  };

  beforeEach(async () => {
    execSync('docker-compose up -d --wait', {
      cwd: join(__dirname, '../../../../'),
      stdio: 'ignore',
    });
    rabbitmq = await new RabbitMQTesting().getClient();
    mailhog = await MailHogTesting.getClient();
  }, TIMEOUTS.SETUP);

  afterEach(async () => {
    await rabbitmq?.close();
  });

  describe('Mailer Service', () => {
    it('Healcheck', async () => {
      const livenessResponse = await axios.get(`${BASE_URL}/healthy/liveness`);
      expect(livenessResponse.status).toBe(200);
      const readinessResponse = await axios.get(`${BASE_URL}/healthy/readiness`);
      expect(readinessResponse.status).toBe(200);
    });

    it('Send account-otp email', async () => {
      const uuid = uuidv1();
      const otpEmail: ITransactionalMail = {
        event: 'account-otp',
        to: `${uuid}@example.com`,
        data: {
          otp: uuid,
        },
      };

      rabbitmq.chanel.publish(
        'transactional_mail_exchange',
        'send',
        Buffer.from(JSON.stringify(otpEmail))
      );

      const receivedMails = await mailhog.waitForEmail(otpEmail.to as string);
      expect(receivedMails).toHaveLength(1);
      expect(receivedMails[0].Content.Headers['Subject'][0]).toBe(
        '[eBizBase] OTP for your account'
      );
      expect(receivedMails[0].Content.Body).toContain(otpEmail.data['otp']);
    });
  });
});
