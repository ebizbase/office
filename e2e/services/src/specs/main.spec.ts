import { ITransactionalMail } from '@ebizbase/mail-interfaces';
import {
  MailHogContainer,
  StartedRabbitMQContainer,
  RabbitMQContainer,
  StartedMailHogContainer,
  MailerServiceContainer,
  MongoDBContainer,
  StartedMongoDBContainer,
  StartedMailerServiceContainer,
  StartedTransactionalMailerServiceContainer,
  TransactionalMailerServiceContainer,
} from '@ebizbase/testcontainers';
import axios from 'axios';
import { Readable } from 'stream';
import { v1 as uuidv1 } from 'uuid';

describe('Main spec', () => {
  let mongodbContainer: StartedMongoDBContainer;
  let rabbitmqContainer: StartedRabbitMQContainer;
  let mailhogContainer: StartedMailHogContainer;
  let mailerServiceContainers: StartedMailerServiceContainer[];
  let transactionMailerServiceContainers: StartedTransactionalMailerServiceContainer[];
  let logs: Array<{ content: string; service: string }>;

  beforeAll(async () => {
    const logCosumer = (service: string) => (stream: Readable) => {
      stream.on('data', (chunk) => {
        logs.push({ content: chunk.toString(), service });
      });
    };

    try {
      logs = [];
      const infraContainers = await Promise.all([
        new MongoDBContainer().withLogConsumer(logCosumer('mongodb')).start(),
        new RabbitMQContainer().withLogConsumer(logCosumer('rabbitmq')).start(),
        new MailHogContainer().withLogConsumer(logCosumer('mailhog')).start(),
      ]);
      mongodbContainer = infraContainers[0];
      rabbitmqContainer = infraContainers[1];
      mailhogContainer = infraContainers[2];

      mailerServiceContainers = await Promise.all([
        new MailerServiceContainer({
          mongodb: mongodbContainer,
          rabitmq: rabbitmqContainer,
          mailhog: mailhogContainer,
        })
          .withLogConsumer(logCosumer('mailer-service'))
          .start(),
        new MailerServiceContainer({
          mongodb: mongodbContainer,
          rabitmq: rabbitmqContainer,
          mailhog: mailhogContainer,
        })
          .withLogConsumer(logCosumer('mailer-service'))
          .start(),
      ]);

      transactionMailerServiceContainers = await Promise.all([
        new TransactionalMailerServiceContainer({
          mongodb: mongodbContainer,
          rabitmq: rabbitmqContainer,
          mailhog: mailhogContainer,
        })
          .withLogConsumer(logCosumer('transactional-mailer-service'))
          .start(),
        new TransactionalMailerServiceContainer({
          mongodb: mongodbContainer,
          rabitmq: rabbitmqContainer,
          mailhog: mailhogContainer,
        })
          .withLogConsumer(logCosumer('transactional-mailer-service'))
          .start(),
      ]);
    } catch {
      logs
        .filter((log) => log.service.endsWith('-service'))
        .forEach(({ content }) => {
          process.stdout.write(content);
        });
    } finally {
      logs = [];
    }
  }, 120_000);

  afterAll(async () => {
    await Promise.all(
      [
        ...transactionMailerServiceContainers,
        ...mailerServiceContainers,
        mongodbContainer,
        mailhogContainer,
        rabbitmqContainer,
      ]
        .filter((c) => c !== undefined)
        .map((c) => c.stop())
    );
  }, 20_000);

  describe('Mailer Service', () => {
    it('should liveness health check is successful', async () => {
      for (const mailerContainer of mailerServiceContainers) {
        const { status } = await axios.get(
          `http://${mailerContainer.getHost()}:${mailerContainer.getMappedPort(3000)}/healthy/liveness`
        );
        expect(status).toBe(200);
      }
    }, 20_000);

    it('should readiness health check is successful', async () => {
      for (const mailerContainer of mailerServiceContainers) {
        const { status } = await axios.get(
          `http://${mailerContainer.getHost()}:${mailerContainer.getMappedPort(3000)}/healthy/readiness`
        );
        expect(status).toBe(200);
      }
    }, 20_000);

    it('should send email from queue successfull when publish message to exchange', async () => {
      const mailToSent = {
        from: 'noreply@example.com',
        to: uuidv1() + '@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
        html: '<p>This is a test email</p>',
      };
      const amqpChanel = await rabbitmqContainer.getChannel();
      amqpChanel.publish('mailer_exchange', 'send_email', Buffer.from(JSON.stringify(mailToSent)));
      const receivedMails = await mailhogContainer.waitForEmail(mailToSent.to);
      expect(receivedMails).toHaveLength(1);
      expect(receivedMails[0].Content.Headers['Subject'][0]).toBe(mailToSent.subject);
    }, 20_000);

    it('should send email successfull with multipe instances', async () => {
      const uuid = uuidv1();
      const mailsToSent = Array.from({ length: 2 }, (_, i) => ({
        from: 'noreply@example.com',
        to: `${uuid}${i}@example.com`,
        subject: 'Test Email',
        text: 'This is a test email',
        html: '<p>This is a test email</p>',
      }));
      const amqpChanel = await rabbitmqContainer.getChannel();
      for (const mail of mailsToSent) {
        amqpChanel.publish('mailer_exchange', 'send_email', Buffer.from(JSON.stringify(mail)));
      }

      await Promise.all(mailsToSent.map((mail) => mailhogContainer.waitForEmail(mail.to)));
      const uniqueInstances = [
        ...new Set(
          logs
            .filter(({ service }) => service === 'mailer-service')
            .map(({ content }) => JSON.parse(content))
            .filter(({ msg }) => msg === 'Sending email')
            .map(({ hostname }) => hostname)
        ),
      ];
      expect(uniqueInstances.length).toBe(2);
    }, 20_000);
  });

  describe('Transactional Mailer Service', () => {
    it('should liveness health check is successful', async () => {
      for (const transactionMailerContainer of transactionMailerServiceContainers) {
        const { status } = await axios.get(
          `http://${transactionMailerContainer.getHost()}:${transactionMailerContainer.getMappedPort(3000)}/healthy/liveness`
        );
        expect(status).toBe(200);
      }
    }, 20_000);

    it('should readiness health check is successful', async () => {
      for (const transactionMailerContainer of transactionMailerServiceContainers) {
        const { status } = await axios.get(
          `http://${transactionMailerContainer.getHost()}:${transactionMailerContainer.getMappedPort(3000)}/healthy/readiness`
        );
        expect(status).toBe(200);
      }
    }, 20_000);

    it('should send account otp email from queue successfull when publish message to exchange', async () => {
      const otpEmail: ITransactionalMail = {
        event: 'account-otp',
        to: uuidv1() + '@example.com',
        data: {
          otp: uuidv1() + '-otp',
        },
      };
      const amqpChanel = await rabbitmqContainer.getChannel();
      amqpChanel.sendToQueue(
        'send_transactional_email_queue',
        Buffer.from(JSON.stringify(otpEmail))
      );
      const receivedMails = await mailhogContainer.waitForEmail(otpEmail.to as string);
      expect(receivedMails).toHaveLength(1);
      expect(receivedMails[0].Content.Headers['Subject'][0]).toBe(
        '[nBiz] Your OTP for your account'
      );
      expect(receivedMails[0].Content.Body).toContain(otpEmail.data['otp']);
    }, 20_000);

    it('should send account otp email successfull with multipe instances', async () => {
      const uuid = uuidv1();
      const mailsToSent = Array.from({ length: 2 }, (_, i) => ({
        event: 'account-otp',
        to: `${uuid}${i}@example.com`,
        data: {
          otp: uuidv1() + '-otp',
        },
      }));
      const amqpChanel = await rabbitmqContainer.getChannel();

      for (const mail of mailsToSent) {
        amqpChanel.sendToQueue('send_transactional_email_queue', Buffer.from(JSON.stringify(mail)));
      }

      await Promise.all(mailsToSent.map((mail) => mailhogContainer.waitForEmail(mail.to)));
      const uniqueInstances = [
        ...new Set(
          logs
            .filter(({ service }) => service === 'transactional-mailer-service')
            .map(({ content }) => JSON.parse(content))
            .filter(({ msg }) => msg === 'Sending transactional email')
            .map(({ hostname }) => hostname)
        ),
      ];
      expect(uniqueInstances.length).toBe(2);
    }, 20_000);
  });
});