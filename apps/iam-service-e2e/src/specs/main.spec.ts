import { RabbitMQClient, RabbitMQTesting } from '@ebizbase/testing-utils';
import axios from 'axios';
import { execSync } from 'child_process';
import { join } from 'path';

describe('Mailer Service - Main features', () => {
  let rabbitmq: RabbitMQClient;
  // let mailhog: MailHogClient;

  beforeEach(async () => {
    execSync('docker-compose up -d --wait', {
      cwd: join(__dirname, '../../../../'),
      stdio: 'ignore',
    });
    rabbitmq = await new RabbitMQTesting().getClient();
    // mailhog = await MailHogTesting.getClient();
  }, 120_000);

  afterEach(async () => {
    await rabbitmq?.close();
  }, 20_000);

  describe('Mailer Service', () => {
    it('should liveness health check is successful', async () => {
      const { status } = await axios.get('http://iam-service.fbi.com/healthy/liveness');
      expect(status).toBe(200);
    }, 20_000);

    it('should readiness health check is successful', async () => {
      const { status } = await axios.get('http://iam-service.fbi.com/healthy/readiness');
      expect(status).toBe(200);
    }, 20_000);
  });
});
