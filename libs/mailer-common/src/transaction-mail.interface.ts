import { IEmailAddress } from './email-address.interface';

export type AccountTransactionEvent = 'account-otp';
export type TransactionalEvent = AccountTransactionEvent;

export interface ITransactionalMail {
  event: TransactionalEvent;
  to: string | IEmailAddress;
  data: { [key: string]: unknown };
}
