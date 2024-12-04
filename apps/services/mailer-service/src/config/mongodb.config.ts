import { registerAs } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import mongoose from 'mongoose';

function validateEnvironment(): { MONGODB_URI: string } {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MongoDB Config Validation Error: MONGODB_URI is required');
  }

  const isValidUri = /^(mongodb(?:\+srv)?):\/\/[^\s]+$/i.test(MONGODB_URI);
  if (!isValidUri) {
    throw new Error(
      'MongoDB Config Validation Error: MONGODB_URI is not a valid MongoDB connection string'
    );
  }

  return { MONGODB_URI };
}

function setupConnectionLogging(connection: mongoose.Connection, logger: Logger): void {
  connection.on('connected', () => logger.log('MongoDB connected'));
  connection.on('disconnected', () => logger.log('MongoDB disconnected'));
  if (process.env['NODE_ENV'] !== 'production') {
    mongoose.set('debug', (collectionName, method, query, doc) => {
      logger.debug(`${collectionName}.${method}`, JSON.stringify(query), doc);
    });
  }
}

export default registerAs('mongodb', (): { configs: MongooseModuleOptions } => {
  const { MONGODB_URI } = validateEnvironment();
  const logger = new Logger('Mongoose');
  const configs: MongooseModuleOptions = {
    uri: MONGODB_URI,
    dbName: 'mailer-service',
    onConnectionCreate: (connection) => setupConnectionLogging(connection, logger),
  };

  return { configs };
});
