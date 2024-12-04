import mongoose from 'mongoose';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import mongodbConfig from './mongodb.config';

// Mock Logger
const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn().mockImplementation(() => mockLogger),
}));

describe('MongoDB Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment Validation', () => {
    it('should throw an error if MONGODB_URI is missing', () => {
      delete process.env['MONGODB_URI'];

      expect(() => mongodbConfig()).toThrowError(
        'MongoDB Config Validation Error: MONGODB_URI is required'
      );
    });

    it('should throw an error if MONGODB_URI is invalid', () => {
      process.env['MONGODB_URI'] = 'invalid-uri';

      expect(() => mongodbConfig()).toThrowError(
        'MongoDB Config Validation Error: MONGODB_URI is not a valid MongoDB connection string'
      );
    });

    it('should pass validation if MONGODB_URI is valid', () => {
      process.env['MONGODB_URI'] = 'mongodb://localhost:27017';
      expect(() => mongodbConfig()).not.toThrow();
    });
  });

  describe('Configuration', () => {
    beforeEach(() => {
      process.env['MONGODB_URI'] = 'mongodb://localhost:27017';
    });

    it('should return the correct MongooseModuleOptions', () => {
      const result = mongodbConfig();
      const configs: MongooseModuleOptions = result.configs;

      expect(configs).toMatchObject({
        uri: 'mongodb://localhost:27017',
        dbName: 'mailer-service',
      });

      expect(typeof configs.onConnectionCreate).toBe('function');
    });
  });

  describe('Connection Logging', () => {
    let mockConnection: mongoose.Connection;

    beforeEach(() => {
      process.env['MONGODB_URI'] = 'mongodb://localhost:27017';
      mockConnection = {
        on: jest.fn((event, handler) => {
          if (event === 'connected') {
            handler();
          }
          if (event === 'disconnected') {
            handler();
          }
        }),
      } as unknown as mongoose.Connection;
    });

    it('should log connection events in development mode', () => {
      mongoose.set = jest.fn();

      const result = mongodbConfig();
      result.configs.onConnectionCreate?.(mockConnection);

      // Verify event listeners
      expect(mockConnection.on).toHaveBeenCalledWith('connected', expect.any(Function));
      expect(mockConnection.on).toHaveBeenCalledWith('disconnected', expect.any(Function));

      // Verify logging
      expect(mockLogger.log).toHaveBeenCalledWith('MongoDB connected');
      expect(mockLogger.log).toHaveBeenCalledWith('MongoDB disconnected');
    });

    it('should setup debug logging in development mode', () => {
      // Đặt môi trường NODE_ENV khác 'production'
      process.env['NODE_ENV'] = 'development';

      // Mock hàm mongoose.set
      mongoose.set = jest.fn();

      // Lấy cấu hình và thực thi onConnectionCreate
      const result = mongodbConfig();
      const mockConnection = {
        on: jest.fn(),
      } as unknown as mongoose.Connection;
      result.configs.onConnectionCreate?.(mockConnection);

      // Lấy callback debug
      expect(mongoose.set).toHaveBeenCalledWith('debug', expect.any(Function));
      const debugCallback = (mongoose.set as jest.Mock).mock.calls[0][1];

      // Kiểm tra callback debug
      const mockCollectionName = 'users';
      const mockMethod = 'find';
      const mockQuery = { name: 'John Doe' };
      const mockDoc = { age: 30 };

      // Gọi callback
      debugCallback(mockCollectionName, mockMethod, mockQuery, mockDoc);

      // Kiểm tra logger.debug
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'users.find',
        JSON.stringify(mockQuery),
        mockDoc
      );
    });

    it('should not set debug in production mode', () => {
      process.env['NODE_ENV'] = 'production';
      mongoose.set = jest.fn();

      const result = mongodbConfig();
      result.configs.onConnectionCreate?.(mockConnection);

      // Verify debug mode is not set
      expect(mongoose.set).not.toHaveBeenCalled();
    });
  });
});
