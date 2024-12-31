import {
  AbstractStartedContainer,
  GenericContainer,
  StartedTestContainer,
  Wait,
} from 'testcontainers';
import { StartedMailHogContainer } from '../../infras/mailhog';
import { StartedMongoDBContainer, StartedRabbitMQContainer } from '../../infras';

export class MailerServiceContainer extends GenericContainer {
  constructor(
    infras: {
      mongodb: StartedMongoDBContainer;
      rabitmq: StartedRabbitMQContainer;
      mailhog: StartedMailHogContainer;
    },
    image?: string
  ) {
    super(image || 'ebizbase/office-mailer-service:edge');
    this.withEnvironment({
      PORT: '3000',
      LOG_DEBUG: '*',
      LOG_TRACE: '*',
      MONGODB_URI: `${infras.mongodb.getConnectionString()}?directConnection=true`,
      RABBITMQ_URIS: infras.rabitmq.getAmqpUrl(),
      SMTP_URI: infras.mailhog.getSmtpUri(),
    });
    this.withExposedPorts(3000);
    this.withWaitStrategy(Wait.forLogMessage('Mailer service is up and running'));
  }

  override async start(): Promise<StartedMailerServiceContainer> {
    const staredContainer = await super.start();
    return new StartedMailerServiceContainer(staredContainer);
  }
}

export class StartedMailerServiceContainer extends AbstractStartedContainer {
  constructor(container: StartedTestContainer) {
    super(container);
  }
}
