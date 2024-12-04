import smtpConfig from './smtp.config';

describe('SMTP Config', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Xóa cache của module
    process.env = { ...OLD_ENV }; // Reset biến môi trường
  });

  afterAll(() => {
    process.env = OLD_ENV; // Khôi phục biến môi trường gốc
  });

  it('should throw an error if SMTP_URI is missing', () => {
    delete process.env['SMTP_URI']; // Xóa SMTP_URI
    expect(() => smtpConfig()).toThrowError('SMTP_URI is required');
  });

  it('should throw an error if SMTP_URI is invalid', () => {
    process.env['SMTP_URI'] = 'invalid-uri'; // URI không hợp lệ
    expect(() => smtpConfig()).toThrowError('SMTP_URI must be a valid URI');
  });

  it('should parse valid SMTP_URI correctly with default options', () => {
    process.env['SMTP_URI'] = 'smtp://user:password@smtp.example.com:587';

    const config = smtpConfig();
    expect(config.configs).toEqual({
      pool: true,
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'user',
        pass: 'password',
      },
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 10,
    });
  });

  it('should parse SMTP_URI with smtps protocol and secure connection', () => {
    process.env['SMTP_URI'] = 'smtps://user:password@smtp.example.com:465';

    const config = smtpConfig();
    expect(config.configs.secure).toBe(true);
    expect(config.configs.port).toBe(465);
  });

  it('should parse query parameters in SMTP_URI', () => {
    process.env['SMTP_URI'] =
      'smtp://user:password@smtp.example.com:587?maxConnections=10&rateLimit=5';

    const config = smtpConfig();
    expect(config.configs).toMatchObject({
      maxConnections: '10',
      rateLimit: '5',
    });
  });

  it('should handle missing authentication details in SMTP_URI', () => {
    process.env['SMTP_URI'] = 'smtp://smtp.example.com:587';

    const config = smtpConfig();
    expect(config.configs.auth).toBeUndefined();
  });

  it('should handle missing port details in SMTP_URI', () => {
    process.env['SMTP_URI'] = 'smtp://smtp.example.com';
    const config = smtpConfig();
    expect(config.configs.port).toBe(587);
  });
});
