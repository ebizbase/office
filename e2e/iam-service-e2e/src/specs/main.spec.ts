import { createUserInfo, getOtpFromEmail, registerUser } from '../support/helpers';

describe('Mailer Service - Main features', () => {
  describe('Register', () => {
    it('should register success and send otp email', async () => {
      const userInfo = createUserInfo();
      await registerUser(userInfo);
      await getOtpFromEmail(userInfo.email);
    });
  });

  describe('Login', () => {
    it('should register success and send otp email', async () => {
      const userInfo = createUserInfo();
      await registerUser(userInfo);
      await getOtpFromEmail(userInfo.email);
    });
  });
});
