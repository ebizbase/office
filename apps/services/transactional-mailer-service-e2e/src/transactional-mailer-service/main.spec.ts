import { ITransactionalMail } from '@ebizbase/mailer-common';
import {
  MailHogContainer,
  StartedRabbitMQContainer,
  RabbitMQContainer,
  MailerServiceContainer,
  TransactionalMailerServiceContainer,
  StartedMailHogContainer,
} from '@ebizbase/testing-common';
import { MongoDBContainer } from '@testcontainers/mongodb';
import { v1 as uuidv1 } from 'uuid';

describe('Main spec', () => {
  let rabbitmqContainer: StartedRabbitMQContainer;
  let mailhogContainer: StartedMailHogContainer;

  beforeAll(async () => {
    const infraContainers = await Promise.all([
      new MongoDBContainer().start(),
      new RabbitMQContainer().start(),
      new MailHogContainer().start(),
    ]);
    await Promise.all([
      new MailerServiceContainer({
        mongodb: infraContainers[0],
        rabitmq: infraContainers[1],
        mailhog: infraContainers[2],
      }).start(),

      new TransactionalMailerServiceContainer({
        mongodb: infraContainers[0],
        rabitmq: infraContainers[1],
        mailhog: infraContainers[2],
      }).start(),
    ]);
    rabbitmqContainer = infraContainers[1];
    mailhogContainer = infraContainers[2];
  }, 120_000);

  it('should send account otp email from queue successfull when publish message to exchange', async () => {
    const otpEmail: ITransactionalMail = {
      event: 'account-otp',
      to: uuidv1() + '@example.com',
      data: {
        otp: uuidv1() + '-otp',
      },
    };

    (await rabbitmqContainer.getAmqpClient()).sendToQueue(
      'send_transactional_email_queue',
      Buffer.from(JSON.stringify(otpEmail))
    );

    const receivedMails = await mailhogContainer.waitForEmail(otpEmail.to as string);
    expect(receivedMails).toHaveLength(1);
    expect(receivedMails[0].Content.Headers['Subject'][0]).toBe('[nBiz] Your OTP for your account');
    expect(receivedMails[0].Content.Body).toContain(otpEmail.data['otp']);
  }, 10000);
});
