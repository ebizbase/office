import * as amqp from 'amqplib';

export class AmqpClient {
  public static connection?: amqp.Connection;
  public static channel?: amqp.Channel;

  public static async connect(uri: string) {
    AmqpClient.connection = await amqp.connect(uri);
    AmqpClient.channel = await AmqpClient.connection.createChannel();
  }

  private static checkConnection() {
    if (AmqpClient.connection === undefined) {
      throw new Error('Connection not initialized');
    } else if (AmqpClient.channel === undefined) {
      throw new Error('Channel not initialized');
    }
  }

  public static async assertExchange(
    exchange: string,
    type: 'direct' | 'topic' | 'headers' | 'fanout' | 'match' | string,
    options?: amqp.Options.AssertExchange
  ) {
    AmqpClient.checkConnection();
    return AmqpClient.channel?.assertExchange(exchange, type, options);
  }

  public static async assertQueue(queue: string, options?: amqp.Options.AssertQueue) {
    AmqpClient.checkConnection();
    await AmqpClient.channel?.assertQueue(queue, options);
  }

  public static async publish(
    exchange: string,
    routingKey: string,
    message: object,
    options?: amqp.Options.Publish
  ) {
    AmqpClient.checkConnection();
    return AmqpClient.channel?.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      options
    );
  }

  public static async sendToQueue(queue: string, message: object, options?: amqp.Options.Publish) {
    AmqpClient.checkConnection();
    AmqpClient.channel?.sendToQueue(queue, Buffer.from(JSON.stringify(message)), options);
  }
}
