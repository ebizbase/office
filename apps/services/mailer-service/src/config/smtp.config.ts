import { registerAs } from '@nestjs/config';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import url from 'url';

function validateEnvironment() {
  const smtpUri = process.env['SMTP_URI'];

  if (!smtpUri) {
    throw new Error('SMTP_URI is required');
  }

  try {
    new url.URL(smtpUri); // Kiểm tra URI có hợp lệ không
  } catch {
    throw new Error('SMTP_URI must be a valid URI');
  }

  return { smtpUri };
}

function parseSearchParams(searchParams: URLSearchParams): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  searchParams.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export default registerAs('smtp', () => {
  const { smtpUri } = validateEnvironment();
  const parsed = new url.URL(smtpUri);

  const configs: SMTPPool.Options = {
    pool: true,
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port) : 587,
    secure: parsed.protocol === 'smtps:', // Sử dụng `smtps:` để kiểm tra TLS
    auth:
      parsed.username && parsed.password
        ? {
            user: decodeURIComponent(parsed.username),
            pass: decodeURIComponent(parsed.password),
          }
        : undefined,
    maxConnections: 5, // default max connections is 5
    maxMessages: 100, // default max messages is 100
    rateDelta: 1000, // default rate delta is 1000
    rateLimit: 10, // default rate limit is 10 messages per rateDelta (1s)
    ...parseSearchParams(parsed.searchParams), // Chuyển searchParams thành object
  };

  return { configs };
});
