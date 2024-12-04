import { MongoDBContainer } from '@testcontainers/mongodb';
import { RabbitMQContainer } from '@testcontainers/rabbitmq';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';

declare global {
  /* eslint-disable no-var */
  var containers: { [key: string]: StartedTestContainer };
}

module.exports = async function () {
  const startTime = Date.now();
  process.stdout.write('Setting up servers for e2e tests\n');
  globalThis.containers = {};

  // start infrastructure services
  const [mongodb, rabitmq, mailhog] = await Promise.all([
    new MongoDBContainer().start(),
    new RabbitMQContainer().start(),
    new GenericContainer('mailhog/mailhog')
      .withExposedPorts(8025, 1025)
      .withWaitStrategy(Wait.forListeningPorts())
      .start(),
  ]);

  // start services
  const mailer = await new GenericContainer('ebizbase/office-mailer-service:edge')
    .withEnvironment({
      MONGODB_URI: `${mongodb.getConnectionString()}?directConnection=true`,
      RABBITMQ_URIS: rabitmq.getAmqpUrl(),
      SMTP_URI: 'smtp://' + mailhog.getHost() + ':' + mailhog.getMappedPort(1025),
    })
    .withExposedPorts(3000)
    .withWaitStrategy(Wait.forLogMessage('Mailer service is up and running'))
    .start();

  globalThis.containers = {
    mongodb,
    rabitmq,
    mailhog,
    mailer,
  };

  process.stdout.write(`Servers are up and running in ${Date.now() - startTime}ms\n`);
};
