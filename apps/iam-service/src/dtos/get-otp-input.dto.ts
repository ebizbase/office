import { IGetOtpRequest } from '@ebizbase/iam-interfaces';

export class GetOtpInputDTO implements IGetOtpRequest {
  email: string;
}
