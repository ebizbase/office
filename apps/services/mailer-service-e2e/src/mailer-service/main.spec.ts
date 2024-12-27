import {
  MailHogContainer,
  StartedRabbitMQContainer,
  RabbitMQContainer,
  StartedMailHogContainer,
  MailerServiceContainer,
} from '@ebizbase/testing-common';
import { MongoDBContainer, StartedMongoDBContainer } from '@testcontainers/mongodb';
import { v1 as uuidv1 } from 'uuid';

describe('Main spec', () => {
  let mongodbContainer: StartedMongoDBContainer;
  let rabbitmqContainer: StartedRabbitMQContainer;
  let mailhogContainer: StartedMailHogContainer;

  beforeAll(async () => {
    const infraContainers = await Promise.all([
      new MongoDBContainer().start(),
      new RabbitMQContainer().start(),
      new MailHogContainer().start(),
    ]);
    mongodbContainer = infraContainers[0];
    rabbitmqContainer = infraContainers[1];
    mailhogContainer = infraContainers[2];
    await new MailerServiceContainer({
      mongodb: mongodbContainer,
      rabitmq: rabbitmqContainer,
      mailhog: mailhogContainer,
    }).start();
  }, 120_000);

  it('should send email from queue successfull when publish message to exchange', async () => {
    const mailToSent = {
      from: 'noreply@example.com',
      to: uuidv1() + '@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
      html: '<p>This is a test email</p>',
    };
    (await rabbitmqContainer.getAmqpClient()).publish(
      'mailer_exchange',
      'send_email',
      Buffer.from(JSON.stringify(mailToSent))
    );
    const receivedMails = await mailhogContainer.waitForEmail(mailToSent.to);
    expect(receivedMails).toHaveLength(1);
    expect(receivedMails[0].Content.Headers['Subject'][0]).toBe(mailToSent.subject);
  });
});
