import { IVerifyResponse } from '@ebizbase/iam-interfaces';

export class VerifyOutputDTO implements IVerifyResponse {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}
