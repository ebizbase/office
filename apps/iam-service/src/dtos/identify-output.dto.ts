import { IIdentifyResponse } from '@ebizbase/iam-interfaces';

export class IdentifyOutputDTO implements IIdentifyResponse {
  firstName: string;
  lastName?: string;
}
