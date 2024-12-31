import { RabbitMQContainer } from './rabbitmq-container';

describe('RabbitMQContainer', () => {
  jest.setTimeout(240_000);

  it('should start, connect and close with', async () => {
    const rabbitMQContainer = await new RabbitMQContainer().start();
    await rabbitMQContainer.stop();
  });

  it('different username and password with', async () => {
    const USER = 'user';
    const PASSWORD = 'password';

    const rabbitMQContainer = await new RabbitMQContainer()
      .withEnvironment({
        RABBITMQ_DEFAULT_USER: USER,
        RABBITMQ_DEFAULT_PASS: PASSWORD,
      })
      .start();

    await rabbitMQContainer.stop();
  });

  it('test publish and subscribe', async () => {
    const QUEUE = 'test';
    const PAYLOAD = 'Hello World';

    const rabbitMQContainer = await new RabbitMQContainer().start();
    const channel = await rabbitMQContainer.getChannel();
    await channel.assertQueue(QUEUE);

    channel.sendToQueue(QUEUE, Buffer.from(PAYLOAD));

    await new Promise((resolve) => {
      channel.consume(QUEUE, (message) => {
        expect(message?.content.toString()).toEqual(PAYLOAD);
        resolve(true);
      });
    });

    await rabbitMQContainer.stop();
  }, 10_000);

  it('should work using version 4', async () => {
    const rabbitMQContainer = await new RabbitMQContainer('rabbitmq:4-management-alpine').start();
    await rabbitMQContainer.stop();
  });
});
