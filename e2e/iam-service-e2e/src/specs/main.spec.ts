import axios from 'axios';
import {
  clearEmails,
  createTenant,
  createUserInfo,
  deleteTenant,
  getBelongTenants,
  getOtpFromEmail,
  getUserInfo,
  loginWithOtp,
  registerAndLogin,
  registerUser,
  renewToken,
} from '../support/helpers';

describe('Mailer Service - Main features', () => {
  const BASE_URL = 'http://iam-service.fbi.com';

  describe('Authentication', () => {
    describe('OTP Scenarios', () => {
      test.each([
        { case: 'Login with old OTP should fail', useOldOtp: true, expectedStatus: 401 },
        { case: 'Login with new OTP should succeed', useOldOtp: false, expectedStatus: 200 },
      ])('$case', async ({ useOldOtp, expectedStatus }) => {
        const userInfo = createUserInfo();

        // Step 1: Register user and get OTP
        await registerUser(userInfo);
        const firstOtp = await getOtpFromEmail(userInfo.email);
        await clearEmails();

        // Step 2: Register again to generate new OTP
        await registerUser(userInfo);
        const newOtp = await getOtpFromEmail(userInfo.email);

        // Step 3: Attempt login
        const otpToUse = useOldOtp ? firstOtp : newOtp;
        const response = await axios.post(`${BASE_URL}/authenticate/login`, {
          email: userInfo.email,
          otp: otpToUse,
        });

        expect(response.status).toBe(expectedStatus);
      });
    });

    it('should renew token and validate user info', async () => {
      const userInfo = createUserInfo();

      // Register and get access token
      await registerUser(userInfo);
      const otp = await getOtpFromEmail(userInfo.email);
      const loginResponse = await loginWithOtp(userInfo.email, otp);

      // Validate user info
      const userInfoResponse = await getUserInfo(loginResponse.accessToken);

      // Renew token
      const renewResponse = await renewToken(loginResponse.refreshToken);

      // Validate new token
      const newUserInfoResponse = await getUserInfo(renewResponse.accessToken);
      expect(newUserInfoResponse).toEqual(userInfoResponse);
    });
  });

  describe('Tenant Management', () => {
    it('should create and delete tenants', async () => {
      const { accessToken, email } = await registerAndLogin();

      // Create tenants
      const tenants = await Promise.all([createTenant(accessToken), createTenant(accessToken)]);
      expect(await getBelongTenants(accessToken)).toHaveLength(2);

      // Delete a tenant
      const otp = await getOtpFromEmail(email);
      await deleteTenant(tenants[0]._id, otp, accessToken);

      // Verify remaining tenants
      expect(await getBelongTenants(accessToken)).toHaveLength(1);
    });

    it('should not delete tenant with invalid OTP', async () => {
      const { accessToken, email } = await registerAndLogin();

      // Create tenant
      const tenant = await createTenant(accessToken);
      const otp = await getOtpFromEmail(email);

      // Modify OTP (simulate invalid OTP)
      const invalidOtp = otp.slice(0, -1) + 'X';

      // Attempt deletion
      const response = await deleteTenant(tenant._id, invalidOtp, accessToken);

      // Verify failure
      expect(response.status).toBe(400);
    });
  });
});
