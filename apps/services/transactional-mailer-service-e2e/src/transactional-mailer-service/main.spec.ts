import { ITransactionalMail } from '@ebizbase/mailer-common';
import {
  MailHogContainer,
  StartedRabbitMQContainer,
  RabbitMQContainer,
  StartedMailHogContainer,
  MailerServiceContainer,
  StartedMailerServiceContainer,
  StartedTransactionalMailerServiceContainer,
  TransactionalMailerServiceContainer,
} from '@ebizbase/testing-common';
import { MongoDBContainer, StartedMongoDBContainer } from '@testcontainers/mongodb';
import { v1 as uuidv1 } from 'uuid';

describe('Main spec', () => {
  let mongodbContainer: StartedMongoDBContainer;
  let rabbitmqContainer: StartedRabbitMQContainer;
  let mailhogContainer: StartedMailHogContainer;
  let mailerServiceContainer: StartedMailerServiceContainer;
  let transactionalMailerServiceContainer: StartedTransactionalMailerServiceContainer;

  beforeAll(async () => {
    const infraContainers = await Promise.all([
      new MongoDBContainer().start(),
      new RabbitMQContainer().start(),
      new MailHogContainer().start(),
    ]);
    mongodbContainer = infraContainers[0];
    rabbitmqContainer = infraContainers[1];
    mailhogContainer = infraContainers[2];

    const services = await Promise.all([
      new MailerServiceContainer({
        mongodb: mongodbContainer,
        rabitmq: rabbitmqContainer,
        mailhog: mailhogContainer,
      })
        .withLogConsumer((stream) => {
          stream.on('data', (chunk) => {
            process.stdout.write('[Mailer]' + chunk);
          });
          stream.on('error', (chunk) => {
            process.stdout.write('[Mailer]' + chunk);
          });
        })
        .start(),

      new TransactionalMailerServiceContainer({
        mongodb: mongodbContainer,
        rabitmq: rabbitmqContainer,
        mailhog: mailhogContainer,
      })
        .withLogConsumer((stream) => {
          stream.on('data', (chunk) => {
            process.stdout.write('[Transactional]' + chunk);
          });
          stream.on('error', (chunk) => {
            process.stdout.write('[Transactional]' + chunk);
          });
        })
        .start(),
    ]);
    mailerServiceContainer = services[0];
    transactionalMailerServiceContainer = services[1];
  }, 120000);

  afterAll(async () => {
    try {
      await Promise.all([
        mongodbContainer.stop(),
        rabbitmqContainer.stop(),
        mailhogContainer.stop(),
        mailerServiceContainer.stop(),
        transactionalMailerServiceContainer.stop(),
      ]);
    } catch {
      // do notthing
    }
  }, 30000);

  it('should send otp email success full', async () => {
    const otpEmail: ITransactionalMail = {
      event: 'account-otp',
      to: uuidv1() + '@example.com',
      data: {
        otp: '123456',
      },
    };

    (await rabbitmqContainer.getAmqpClient()).sendToQueue(
      'send_transactional_email_queue',
      Buffer.from(JSON.stringify(otpEmail))
    );

    const receivedMails = await mailhogContainer.waitForEmail(otpEmail.to as string);
    expect(receivedMails).toHaveLength(1);
    expect(receivedMails[0].Content.Headers['Subject'][0]).toBe('[nBiz] Your OTP for your account');
  }, 10000);
});
