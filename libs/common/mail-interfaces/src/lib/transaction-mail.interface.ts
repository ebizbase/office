import { IMailAddress } from './email-address.interface';

export type AccountTransactionEvent = 'account-otp';
export type TransactionalEvent = AccountTransactionEvent;

export interface ITransactionalMail {
  event: TransactionalEvent;
  to: string | IMailAddress;
  data: { [key: string]: unknown };
}
