import speakeasy from 'speakeasy';

export class HOTP {
  secret: string;
  counter: number;
  used: boolean;
  issueAt: Date;

  constructor() {
    this.counter = 1;
    this.secret = speakeasy.generateSecret().base32;
    this.used = false;
    this.issueAt = new Date();
  }
}
