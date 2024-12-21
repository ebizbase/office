import { StartedRabbitMQContainer } from '@testcontainers/rabbitmq';
import { StartedMongoDBContainer } from '@testcontainers/mongodb';
import {
  AbstractStartedContainer,
  GenericContainer,
  StartedTestContainer,
  Wait,
} from 'testcontainers';
import { StartedMailHogContainer } from '../../infras/mailhog';

export class TransactionalMailerServiceContainer extends GenericContainer {
  constructor(
    infras: {
      mongodb: StartedMongoDBContainer;
      rabitmq: StartedRabbitMQContainer;
      mailhog: StartedMailHogContainer;
    },
    image?: string
  ) {
    super(image || 'ebizbase/office-transactional-mailer-service:edge');
    this.withEnvironment({
      MONGODB_URI: `${infras.mongodb.getConnectionString()}?directConnection=true`,
      RABBITMQ_URIS: infras.rabitmq.getAmqpUrl(),
      SMTP_URI: infras.mailhog.getSmtpUri(),
    });
    this.withExposedPorts(3005);
    this.waitStrategy = Wait.forLogMessage('Transactional mailer service is up and running');
  }

  override async start(): Promise<StartedTransactionalMailerServiceContainer> {
    const staredContainer = await super.start();
    return new StartedTransactionalMailerServiceContainer(staredContainer);
  }
}

export class StartedTransactionalMailerServiceContainer extends AbstractStartedContainer {
  constructor(container: StartedTestContainer) {
    super(container);
  }

  getApiUrl(): string {
    return `http://${this.getHost}:${this.getMappedPort(3005)}`;
  }
}
