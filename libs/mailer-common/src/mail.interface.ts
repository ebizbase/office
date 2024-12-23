import { IEmailAddress } from './email-address.interface';

export interface IMail {
  from: string | IEmailAddress;
  to: string | IEmailAddress;
  cc?: Array<string | IEmailAddress>;
  bcc?: Array<string | IEmailAddress>;
  subject: string;
  text?: string;
  html?: string;
}
