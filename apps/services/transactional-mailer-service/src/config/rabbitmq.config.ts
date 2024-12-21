import { registerAs } from '@nestjs/config';
import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';

function validateEnvironment() {
  const rabbitMqUris = process.env['RABBITMQ_URIS'];

  if (!rabbitMqUris) {
    throw new Error('RabbitMQ Config Validation Error: RABBITMQ_URIS is required');
  }

  const uris = rabbitMqUris.split(',');
  const invalidUris = uris.filter((uri) => !/^amqp:\/\/.*:\d{1,5}$/.test(uri));
  if (invalidUris.length > 0) {
    throw new Error(
      `RabbitMQ Config Validation Error: Invalid RabbitMQ URI(s): ${invalidUris.join(', ')}`
    );
  }

  return { uris };
}

export default registerAs('rabbitmq', () => {
  const { uris } = validateEnvironment();

  const configs: RabbitMQConfig = {
    uri: uris,
    exchanges: [
      {
        name: 'transactional_mailer_exchange',
        type: 'direct',
        createExchangeIfNotExists: true,
        options: { durable: true },
      },
    ],
    channels: {
      transactional_mailer_chanel: {
        prefetchCount: 1,
        default: true,
      },
    },
    connectionInitOptions: { wait: true },
  };

  return { configs };
});
