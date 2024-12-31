import { IMailAddress } from './email-address.interface';

export interface IMail {
  from: string | IMailAddress;
  to: string | IMailAddress;
  cc?: Array<string | IMailAddress>;
  bcc?: Array<string | IMailAddress>;
  subject: string;
  text?: string;
  html?: string;
}
