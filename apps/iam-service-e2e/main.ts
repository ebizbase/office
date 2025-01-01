import { ILoginResponse } from '@ebizbase/iam-interfaces';
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
  StartedIAMServiceContainer,
  IAMServiceContainer,
} from '@ebizbase/testcontainers';
import axios from 'axios';
import { Readable } from 'stream';
import { v1 as uuidv1 } from 'uuid';

describe('Main spec', () => {
  let mongodbContainer: StartedMongoDBContainer;
  let rabbitmqContainer: StartedRabbitMQContainer;
  let mailhogContainer: StartedMailHogContainer;
  let iamServiceContainers: StartedIAMServiceContainer[];
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

      iamServiceContainers = await Promise.all([
        new IAMServiceContainer({
          mongodb: mongodbContainer,
          rabitmq: rabbitmqContainer,
          mailhog: mailhogContainer,
        })
          .withLogConsumer(logCosumer('iam-service'))
          .start(),
        new IAMServiceContainer({
          mongodb: mongodbContainer,
          rabitmq: rabbitmqContainer,
          mailhog: mailhogContainer,
        })
          .withLogConsumer(logCosumer('iam-service'))
          .start(),
      ]);
    } catch (err) {
      logs
        .filter((log) => log.service.endsWith('-service'))
        .forEach(({ content }) => {
          process.stdout.write(content);
        });
      throw err;
    } finally {
      logs = [];
    }
  }, 120_000);

  afterAll(async () => {
    await Promise.all(
      [
        ...transactionMailerServiceContainers,
        ...mailerServiceContainers,
        ...iamServiceContainers,
        mongodbContainer,
        mailhogContainer,
        rabbitmqContainer,
      ]
        .filter((c) => c !== undefined)
        .map((c) => c.stop())
    );
    logs
      .filter((log) => log.service.endsWith('-service'))
      .forEach(({ content }) => {
        process.stdout.write(content);
      });
  }, 20_000);

  function generateEmail() {
    return uuidv1() + '@example.com';
  }

  async function register(email?: string) {
    email = email || generateEmail();
    const baseUri = iamServiceContainers[0].getApiUrl();
    const { status } = await axios.post(`${baseUri}/authenticate/register`, { email });
    expect(status).toBe(201);
    return email;
  }

  async function getOtpFromEmail(email: string) {
    const receivedMails = await mailhogContainer.waitForEmail(email);
    expect(receivedMails).toHaveLength(1);
    expect(receivedMails[0].Content.Headers['Subject'][0]).toBe('[nBiz] Your OTP for your account');

    const regex = /Your OTP is (\d{6})/;
    const match = receivedMails[0].Content.Body.match(regex);
    expect(match).not.toBeNull();
    expect(match[1]).toHaveLength(6);

    return match[1];
  }

  async function login(email: string, otp: string) {
    const baseUri = iamServiceContainers[0].getApiUrl();
    return await axios.post(`${baseUri}/authenticate/login`, { email, otp });
  }

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
        to: generateEmail(),
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
          `${transactionMailerContainer.getApiUrl()}/healthy/liveness`
        );
        expect(status).toBe(200);
      }
    }, 20_000);

    it('should readiness health check is successful', async () => {
      for (const transactionMailerContainer of transactionMailerServiceContainers) {
        const { status } = await axios.get(
          `${transactionMailerContainer.getApiUrl()}/healthy/readiness`
        );
        expect(status).toBe(200);
      }
    }, 20_000);

    it('should send account otp email from queue successfull when publish message to exchange', async () => {
      const otpEmail: ITransactionalMail = {
        event: 'account-otp',
        to: generateEmail(),
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

  describe('IAM Service', () => {
    it('should liveness health check is successful', async () => {
      for (const iamContainer of iamServiceContainers) {
        const { status } = await axios.get(`${iamContainer.getApiUrl()}/healthy/liveness`);
        expect(status).toBe(200);
      }
    }, 20_000);

    it('should readiness health check is successful', async () => {
      for (const iamContainer of iamServiceContainers) {
        const { status } = await axios.get(`${iamContainer.getApiUrl()}/healthy/readiness`);
        expect(status).toBe(200);
      }
    }, 20_000);

    it('should register success', async () => {
      const email = await register();
      await getOtpFromEmail(email);
    }, 20_000);

    it('should login success and onboarded status is false', async () => {
      const email = await register();
      const otp = await getOtpFromEmail(email);
      const { status, data } = await login(email, otp);
      expect(status).toBe(200);
      expect(data).toHaveProperty('userId');
      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('accessTokenExpiresAt');
      expect(data).toHaveProperty('accessToken');
      expect(data).toHaveProperty('refreshToken');
      expect(data.onboardedAt).toBeUndefined();
    }, 20_000);

    it('should onboard success', async () => {
      const email = await register();
      const otp = await getOtpFromEmail(email);
      const { data } = (await login(email, otp)) as { data: ILoginResponse };
      const baseUri = iamServiceContainers[0].getApiUrl();
      const { status, data: onboardData } = await axios.post(
        `${baseUri}/authenticate/onboard`,
        { firstName: 'John', lastName: 'Martin', midleName: '' },
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        }
      );
      expect(status).toBe(201);
      expect(onboardData).toHaveProperty('email', email);
      expect(onboardData).toHaveProperty('onboardedAt');
      expect(onboardData).toHaveProperty('firstName', 'John');
      expect(onboardData).toHaveProperty('lastName', 'Martin');
      expect(onboardData).toHaveProperty('midleName', '');
    }, 20_000);
  });
});
