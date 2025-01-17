import { IIdentifyRequest } from '@ebizbase/iam-interfaces';

export class IdentifyInputDTO implements IIdentifyRequest {
  email: string;
}
