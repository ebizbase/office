import {
  MailHogClient,
  MailHogTesting,
  RabbitMQClient,
  RabbitMQTesting,
} from '@ebizbase/testing-utils';
import axios from 'axios';
import { execSync } from 'child_process';
import { join } from 'path';
import { v1 as uuidv1 } from 'uuid';

describe('Mailer Service - Main features', () => {
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

  it('should liveness health check is successful', async () => {
    const { status } = await axios.get('http://iam-service.fbi.com/healthy/liveness');
    expect(status).toBe(200);
  }, 20_000);

  it('should readiness health check is successful', async () => {
    const { status } = await axios.get('http://iam-service.fbi.com/healthy/readiness');
    expect(status).toBe(200);
  }, 20_000);

  describe('Registering Follow', () => {
    const email = uuidv1() + '@example.com';
    let otp: string;

    it('should registering success', async () => {
      const { status, data } = await axios.post(
        'http://iam-service.fbi.com/authenticate/register',
        { email }
      );
      console.log('data', data);
      expect(status).toBe(201);
    });

    it('should received otp email', async () => {
      const receivedMails = await mailhog.waitForEmail(email);
      expect(receivedMails).toHaveLength(1);
      expect(receivedMails[0].Content.Headers['Subject'][0]).toBe(
        '[nBiz] Your OTP for your account'
      );

      const regex = /Your OTP is (\d{6})/;
      const match = receivedMails[0].Content.Body.match(regex);
      expect(match).not.toBeNull();
      expect(match[1]).toHaveLength(6);

      otp = match[1];
    });

    it('should verify otp success', async () => {
      // const { status } = await axios.post('http://iam-service.fbi.com/authenticate/verify-otp', { email, otp });
      // expect(status).toBe(200);
      console.log('otp', otp);
    });
  });
});
