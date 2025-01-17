import { IVerifyRequest } from '@ebizbase/iam-interfaces';

export class VerifyInputDTO implements IVerifyRequest {
  email: string;
  otp: string;
}
