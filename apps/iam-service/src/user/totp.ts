import speakeasy from 'speakeasy';

export class TOTP {
  secret: string;
  url: string;

  constructor() {
    const secret = speakeasy.generateSecret();
    this.secret = secret.base32;
    this.url = secret.otpauth_url;
  }
}
