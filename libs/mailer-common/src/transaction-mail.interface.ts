import { IEmailAddress } from './email-address.interface';
export type TransactionalEvent = 'user.otp' | 'user.forgot-password' | 'user.reset-password';

export interface ITransactionalMail {
  event: TransactionalEvent;
  to: string | IEmailAddress;
  data: { [key: string]: unknown };
}
