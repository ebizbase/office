import rabbitmqConfig from './rabbitmq.config';

describe('RabbitMQ Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateEnvironment', () => {
    it('should throw an error if RABBITMQ_URIS is missing', () => {
      delete process.env['RABBITMQ_URIS'];

      expect(() => rabbitmqConfig()).toThrowError(
        'RabbitMQ Config Validation Error: RABBITMQ_URIS is required'
      );
    });

    it('should throw an error if any URI in RABBITMQ_URIS is invalid', () => {
      process.env['RABBITMQ_URIS'] = 'invalid-uri,amqp://valid-uri:5672';

      expect(() => rabbitmqConfig()).toThrowError(
        'RabbitMQ Config Validation Error: Invalid RabbitMQ URI(s): invalid-uri'
      );
    });

    it('should pass validation if RABBITMQ_URIS is valid', () => {
      process.env['RABBITMQ_URIS'] = 'amqp://localhost:5672,amqp://remote-host:5672';

      expect(() => rabbitmqConfig()).not.toThrow();
    });
  });

  describe('registerAs with valid config', () => {
    beforeEach(() => {
      process.env['RABBITMQ_URIS'] = 'amqp://localhost:5672,amqp://remote-host:5672';
    });

    it('should return the correct RabbitMQConfig', () => {
      const result = rabbitmqConfig();
      const configs = result.configs;

      expect(configs).toMatchObject({
        uri: ['amqp://localhost:5672', 'amqp://remote-host:5672'],
        exchanges: expect.any(Array),
        channels: expect.any(Object),
        connectionInitOptions: expect.objectContaining({ wait: true }),
      });
    });
  });
});
