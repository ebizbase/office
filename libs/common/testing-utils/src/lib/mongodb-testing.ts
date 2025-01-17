import { Connection, createConnection } from 'mongoose';

export interface MongoDBTestingClient {
  connection: Connection;
  close(): Promise<void>;
}

export class MongodbTesting {
  static async getClient(uri: 'mongodb://127.0.0.1:27017'): Promise<MongoDBTestingClient> {
    const connection = createConnection(uri, { directConnection: true });
    return { connection, close: async () => connection.close(true) };
  }
}
