import { StartedRabbitMQContainer } from '@testcontainers/rabbitmq';
import { MailHogClient } from './mailhog-client';
import { AmqpClient } from './ampq-client';

module.exports = async function () {
  // await AmqpClient.connect('amqp://localhost:5672');
  // MailHogClient.baseUrl = 'http://localhost:8025/api';
  await AmqpClient.connect(
    (globalThis.containers['rabitmq'] as StartedRabbitMQContainer).getAmqpUrl()
  );
  MailHogClient.baseUrl = `http://localhost:${globalThis.containers['mailhog'].getMappedPort(8025)}`;
};
