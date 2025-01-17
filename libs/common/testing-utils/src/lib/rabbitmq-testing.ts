import * as amqp from 'amqplib';

export interface RabbitMQTEstingClient {
  connection: amqp.Connection;
  chanel: amqp.Channel;
  close: () => Promise<void>;
}

export class RabbitMQTesting {
  constructor(
    private host = '127.0.0.1',
    private port = 5672
  ) {}

  public async getClient(): Promise<RabbitMQTEstingClient> {
    try {
      const connection = await amqp.connect({
        protocol: 'amqp',
        port: this.port,
        hostname: this.host,
      });
      const channel = await connection.createChannel();
      return {
        connection,
        chanel: channel,
        close: async () => {
          await channel.close();
          await connection.close();
        },
      };
    } catch (err) {
      throw new Error('Error when connect to rabbitmq server: ' + err);
    }
  }
}
