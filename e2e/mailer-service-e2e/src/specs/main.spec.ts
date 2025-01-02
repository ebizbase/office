import { ITransactionalMail } from '@ebizbase/mail-interfaces';
import {
  MailHogClient,
  MailHogTesting,
  RabbitMQClient,
  RabbitMQTesting,
} from '@ebizbase/testing-utils';
import { v1 as uuidv1 } from 'uuid';

describe('Mailer Service - Main features', () => {
  let rabbitmq: RabbitMQClient;
  let mailhog: MailHogClient;

  const TIMEOUTS = {
    SETUP: 120_000,
  };

  beforeEach(async () => {
    rabbitmq = await new RabbitMQTesting().getClient();
    mailhog = await MailHogTesting.getClient();
  }, TIMEOUTS.SETUP);

  afterEach(async () => {
    await rabbitmq?.close();
  });

  describe('Mailer Service', () => {
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
