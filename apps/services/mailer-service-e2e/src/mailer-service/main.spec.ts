import {
  MailHogContainer,
  StartedRabbitMQContainer,
  RabbitMQContainer,
  StartedMailHogContainer,
  MailerServiceContainer,
  StartedMailerServiceContainer,
} from '@ebizbase/testing-common';
import { MongoDBContainer, StartedMongoDBContainer } from '@testcontainers/mongodb';

describe('Main spec', () => {
  let mongodbContainer: StartedMongoDBContainer;
  let rabbitmqContainer: StartedRabbitMQContainer;
  let mailhogContainer: StartedMailHogContainer;
  let mailerServiceContainers: StartedMailerServiceContainer[];

  beforeAll(async () => {
    const infraContainers = await Promise.all([
      new MongoDBContainer().start(),
      new RabbitMQContainer().start(),
      new MailHogContainer().start(),
    ]);
    mongodbContainer = infraContainers[0];
    rabbitmqContainer = infraContainers[1];
    mailhogContainer = infraContainers[2];
    mailerServiceContainers = [];
  }, 120000);

  beforeEach(async () => {
    for (const mailerServiceContainer of mailerServiceContainers) {
      await mailerServiceContainer.stop();
    }
  });

  it('should send email success full', async () => {
    const mailerServiceContainer = await new MailerServiceContainer({
      mongodb: mongodbContainer,
      rabitmq: rabbitmqContainer,
      mailhog: mailhogContainer,
    }).start();
    mailerServiceContainers.push(mailerServiceContainer);

    const mailToSent = {
      from: 'noreply@example.com',
      to: 'test1@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
      html: '<p>This is a test email</p>',
    };
    (await rabbitmqContainer.getAmqpClient()).sendToQueue(
      'send_email_queue',
      Buffer.from(JSON.stringify(mailToSent))
    );
    const receivedMails = await mailhogContainer.waitForEmail(mailToSent.to);
    expect(receivedMails).toHaveLength(1);
    expect(receivedMails[0].Content.Headers['Subject'][0]).toBe(mailToSent.subject);
  }, 10000);

  it('should send email after service restart', async () => {
    const mailToSent = {
      from: 'noreply@example.com',
      to: 'test2@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
      html: '<p>This is a test email</p>',
    };

    const mailerServiceContainer = await new MailerServiceContainer({
      mongodb: mongodbContainer,
      rabitmq: rabbitmqContainer,
      mailhog: mailhogContainer,
    }).start();
    mailerServiceContainers.push(mailerServiceContainer);

    (await rabbitmqContainer.getAmqpClient()).sendToQueue(
      'send_email_queue',
      Buffer.from(JSON.stringify(mailToSent))
    );

    await new MailerServiceContainer({
      mongodb: mongodbContainer,
      rabitmq: rabbitmqContainer,
      mailhog: mailhogContainer,
    }).start();

    const receivedMails = await mailhogContainer.waitForEmail(mailToSent.to);
    expect(receivedMails).toHaveLength(1);
    expect(receivedMails[0].Content.Headers['Subject'][0]).toBe(mailToSent.subject);
  }, 10000);

  it('should send email with multiple instances', async () => {
    const mailToSent = {
      from: 'noreply@example.com',
      to: 'test3@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
      html: '<p>This is a test email</p>',
    };

    mailerServiceContainers = await Promise.all([
      new MailerServiceContainer({
        mongodb: mongodbContainer,
        rabitmq: rabbitmqContainer,
        mailhog: mailhogContainer,
      }).start(),
      new MailerServiceContainer({
        mongodb: mongodbContainer,
        rabitmq: rabbitmqContainer,
        mailhog: mailhogContainer,
      }).start(),
    ]);

    (await rabbitmqContainer.getAmqpClient()).sendToQueue(
      'send_email_queue',
      Buffer.from(JSON.stringify(mailToSent))
    );

    await new MailerServiceContainer({
      mongodb: mongodbContainer,
      rabitmq: rabbitmqContainer,
      mailhog: mailhogContainer,
    })
      .withReuse()
      .start();

    const receivedMails = await mailhogContainer.waitForEmail(mailToSent.to);
    expect(receivedMails).toHaveLength(1);
    expect(receivedMails[0].Content.Headers['Subject'][0]).toBe(mailToSent.subject);
  }, 10000);
});
