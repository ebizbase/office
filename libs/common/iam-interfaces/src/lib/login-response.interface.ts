export interface ILoginResponse {
  userId: string;
  email: string;
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
  onboardedAt?: Date;
}
