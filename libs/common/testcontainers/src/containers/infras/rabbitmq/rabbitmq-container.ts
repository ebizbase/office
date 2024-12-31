import {
  AbstractStartedContainer,
  GenericContainer,
  StartedTestContainer,
  StopOptions,
  StoppedTestContainer,
  Wait,
} from 'testcontainers';
import * as amqp from 'amqplib';

const AMQP_PORT = 5672;
const AMQPS_PORT = 5671;
const HTTPS_PORT = 15671;
const HTTP_PORT = 15672;
const RABBITMQ_DEFAULT_USER = 'guest';
const RABBITMQ_DEFAULT_PASS = 'guest';

export class RabbitMQContainer extends GenericContainer {
  constructor(image = 'rabbitmq:3-management-alpine') {
    super(image);
    this.withExposedPorts(AMQP_PORT, AMQPS_PORT, HTTPS_PORT, HTTP_PORT)
      .withEnvironment({
        RABBITMQ_DEFAULT_USER,
        RABBITMQ_DEFAULT_PASS,
      })
      .withWaitStrategy(Wait.forLogMessage('Server startup complete'))
      .withStartupTimeout(30000);
  }

  public override async start(): Promise<StartedRabbitMQContainer> {
    return new StartedRabbitMQContainer(await super.start());
  }
}

export class StartedRabbitMQContainer extends AbstractStartedContainer {
  private username?: string;
  private password?: string;
  private connection?: amqp.Connection;
  private chanel?: amqp.Channel;

  constructor(startedTestContainer: StartedTestContainer) {
    super(startedTestContainer);
  }

  public getAmqpUrl(): string {
    return `amqp://${this.getHost()}:${this.getMappedPort(AMQP_PORT)}`;
  }

  public getAmqpsUrl(): string {
    return `amqps://${this.getHost()}:${this.getMappedPort(AMQPS_PORT)}`;
  }

  public async getCredentials(): Promise<{ username: string; password: string }> {
    if (!this.username || !this.password) {
      const { output } = await this.startedTestContainer.exec('printenv');
      const enviroments = output.split('\n').reduce(
        (acc, line) => {
          const [key, value] = line.split('=');
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>
      );
      this.username = enviroments['RABBITMQ_DEFAULT_USER'] || RABBITMQ_DEFAULT_USER;
      this.password = enviroments['RABBITMQ_DEFAULT_PASS'] || RABBITMQ_DEFAULT_PASS;
    }
    return { username: this.username, password: this.password };
  }

  public async getAmqpConnection(): Promise<amqp.Connection> {
    if (!this.connection) {
      const { username, password } = await this.getCredentials();
      this.connection = await amqp.connect({
        protocol: 'amqp',
        port: this.startedTestContainer.getMappedPort(5672),
        hostname: this.getHost(),
        username,
        password,
      });
    }
    return this.connection;
  }

  public async getChannel(): Promise<amqp.Channel> {
    if (!this.chanel) {
      this.chanel = await (await this.getAmqpConnection()).createChannel();
    }
    return this.chanel;
  }

  override async stop(options?: Partial<StopOptions>): Promise<StoppedTestContainer> {
    if (this.chanel) {
      await this.chanel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    const stopedContainer = await super.stop(options);
    return stopedContainer;
  }
}
