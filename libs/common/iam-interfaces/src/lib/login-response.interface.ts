export interface ILoginResponse {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
  onboardedAt?: Date;
}
