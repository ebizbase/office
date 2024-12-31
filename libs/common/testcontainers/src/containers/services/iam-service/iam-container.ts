import {
  AbstractStartedContainer,
  GenericContainer,
  StartedTestContainer,
  Wait,
} from 'testcontainers';
import { StartedMailHogContainer } from '../../infras/mailhog';
import { StartedMongoDBContainer, StartedRabbitMQContainer } from '../../infras';

export class IAMServiceContainer extends GenericContainer {
  constructor(
    infras: {
      mongodb: StartedMongoDBContainer;
      rabitmq: StartedRabbitMQContainer;
      mailhog: StartedMailHogContainer;
    },
    image?: string
  ) {
    super(image || 'ebizbase/office-iam-service:edge');
    this.withEnvironment({
      PORT: '3000',
      LOG_DEBUG: '*',
      LOG_TRACE: '*',
      TOKEN_SECRET: 'secret',
      ACCESS_TOKEN_EXPIRES_IN: '30s',
      REFRESH_TOKEN_EXPIRES_IN: '10m',
      MONGODB_URI: `${infras.mongodb.getConnectionString()}?directConnection=true`,
      RABBITMQ_URIS: infras.rabitmq.getAmqpUrl(),
      SMTP_URI: infras.mailhog.getSmtpUri(),
    });
    this.withExposedPorts(3000);
    this.waitStrategy = Wait.forLogMessage('IAM service is up and running');
  }

  override async start(): Promise<StartedIAMServiceContainer> {
    const staredContainer = await super.start();
    return new StartedIAMServiceContainer(staredContainer);
  }
}

export class StartedIAMServiceContainer extends AbstractStartedContainer {
  constructor(container: StartedTestContainer) {
    super(container);
  }

  getApiUrl(): string {
    return `http://${this.getHost()}:${this.getMappedPort(3000)}`;
  }
}
