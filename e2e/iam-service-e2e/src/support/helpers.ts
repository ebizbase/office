import { expect } from '@playwright/test';
import { ILoginResponse, IRegisterRequest } from '@ebizbase/iam-interfaces';
import { MailHogTesting } from '@ebizbase/testing-utils';
import axios from 'axios';
import { v1 as uuidv1 } from 'uuid';

const BASE_URL = 'http://iam-service.fbi.com';

export const createUserInfo: () => IRegisterRequest = () => {
  const firstName = uuidv1();
  const lastName = uuidv1();
  return {
    email: `${firstName}${lastName}@example.com`,
    firstName,
    lastName,
  };
};

export const createTenantInfo = () => {
  const identify = uuidv1();
  const name = uuidv1();
  return { name, identify };
};

export const registerUser = async (userInfo: IRegisterRequest, validateResponse = false) => {
  const response = await axios.post(`${BASE_URL}/authenticate/register`, userInfo);
  if (validateResponse) {
    expect(response.status).toBe(201);
  }
  return response;
};

export const clearEmails = async () => {
  const mailhogClient = await MailHogTesting.getClient();
  await mailhogClient.clearEmails();
};

export const getOtpFromEmail = async (email: string) => {
  const mailhogClient = await MailHogTesting.getClient();
  const emailData = await mailhogClient.waitForEmail(email);
  const otpMatch = emailData[0].Content.Body.match(/Your OTP is (\d{6})/);
  expect(otpMatch[1]).toBeTruthy();
  return otpMatch[1];
};

export const loginWithOtp = async (email: string, otp: string): Promise<ILoginResponse> => {
  const response = await axios.post(`${BASE_URL}/authenticate/login`, { email, otp });
  return response.data as ILoginResponse;
};

export const renewToken = async (token: string) => {
  const response = await axios.post(`${BASE_URL}/authenticate/refresh`, { token });
  return response.data;
};

export const getOtp = async (accessToken: string) => {
  await clearEmails();
  const response = await axios.get(`${BASE_URL}/authenticate/otp`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const getUserInfo = async (accessToken: string) => {
  const response = await axios.get(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const registerAndLogin = async (): Promise<ILoginResponse & IRegisterRequest> => {
  const userInfo = createUserInfo();
  await registerUser(userInfo);
  const loginResponse = await loginWithOtp(userInfo.email, await getOtpFromEmail(userInfo.email));
  return {
    ...userInfo,
    ...loginResponse,
  };
};

export const createTenant = async (accessToken: string) => {
  const tenantInfo = createTenantInfo();
  const response = await axios.post(`${BASE_URL}/tenants`, tenantInfo, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const getBelongTenants = async (accessToken: string) => {
  const response = await axios.get(`${BASE_URL}/tenants`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const deleteTenant = async (tenantId: string, otp: string, accessToken: string) => {
  const response = await axios.delete(`${BASE_URL}/tenants/${tenantId}?otp=${otp}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response;
};
