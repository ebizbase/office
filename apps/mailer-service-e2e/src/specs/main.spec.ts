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

  describe('Mailer Service', () => {
    it('should liveness health check is successful', async () => {
      const { status } = await axios.get('http://mailer-service.fbi.com/healthy/liveness');
      expect(status).toBe(200);
    }, 20_000);

    it('should readiness health check is successful', async () => {
      const { status } = await axios.get('http://mailer-service.fbi.com/healthy/readiness');
      expect(status).toBe(200);
    }, 20_000);

    it('should send email from queue successfull when publish message to exchange', async () => {
      const mailToSent = {
        from: 'noreply@example.com',
        to: `${uuidv1()}@example.com`,
        subject: 'Test Email',
        text: 'This is a test email',
        html: '<p>This is a test email</p>',
      };

      rabbitmq.chanel.publish(
        'mailer_exchange',
        'send_email',
        Buffer.from(JSON.stringify(mailToSent))
      );
      const receivedMails = await mailhog.waitForEmail(mailToSent.to);
      expect(receivedMails).toHaveLength(1);
      expect(receivedMails[0].Content.Headers['Subject'][0]).toBe(mailToSent.subject);
    }, 20_000);

    // it('should send email successfull with multipe instances', async () => {
    //   const uuid = uuidv1();
    //   const mailsToSent = Array.from({ length: 2 }, (_, i) => ({
    //     from: 'noreply@example.com',
    //     to: `${uuid}${i}@example.com`,
    //     subject: 'Test Email',
    //     text: 'This is a test email',
    //     html: '<p>This is a test email</p>',
    //   }));
    //   const amqpChanel = await rabbitmqContainer.getChannel();
    //   for (const mail of mailsToSent) {
    //     amqpChanel.publish('mailer_exchange', 'send_email', Buffer.from(JSON.stringify(mail)));
    //   }

    //   await Promise.all(mailsToSent.map((mail) => mailhogContainer.waitForEmail(mail.to)));
    //   const uniqueInstances = [
    //     ...new Set(
    //       logs
    //         .filter(({ service }) => service === 'mailer-service')
    //         .map(({ content }) => JSON.parse(content))
    //         .filter(({ msg }) => msg === 'Sending email')
    //         .map(({ hostname }) => hostname)
    //     ),
    //   ];
    //   expect(uniqueInstances.length).toBe(2);
    // }, 20_000);
  });
});
