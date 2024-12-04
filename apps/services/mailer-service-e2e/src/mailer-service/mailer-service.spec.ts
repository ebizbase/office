import { AmqpClient } from '../support/ampq-client';
import { MailHogClient } from '../support/mailhog-client';

describe('GET /', () => {
  it('should send email success full', async () => {
    const mailToSent = {
      from: 'noreply@example.com',
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
      html: '<p>This is a test email</p>',
    };
    AmqpClient.sendToQueue('send_email_queue', mailToSent);
    const receivedMail = await MailHogClient.waitForEmail('test@example.com');
    expect(receivedMail.Content.Headers['Subject'][0]).toBe(mailToSent.subject);
  });
});
